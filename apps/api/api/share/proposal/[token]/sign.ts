import { Hono } from "hono";
import { z } from "zod";
import { getServiceClient } from "../../../../lib/supabase";

export const signRouter = new Hono();

/* --------------------------------------------------
   Payload
-------------------------------------------------- */
const bodySchema = z.object({
  accepted_option: z.string().min(1),
  signature_image: z.string().startsWith("data:image/"),
});

/* --------------------------------------------------
   POST /api/share/proposal/:token/sign
-------------------------------------------------- */
signRouter.post("/", async (c) => {
  const supabase = getServiceClient();

  const token = c.req.param("token");
  if (!token) {
    return c.json({ error: "Missing public token" }, 400);
  }

  let parsed;
  try {
    parsed = bodySchema.parse(await c.req.json());
  } catch (err) {
    return c.json({ error: "Invalid payload", details: err }, 400);
  }

  const { accepted_option, signature_image } = parsed;

  /* --------------------------------------------------
     Fetch proposal by public token
  -------------------------------------------------- */
  const { data: proposal, error: proposalErr } = await supabase
    .from("smart_proposals")
    .select(
      "id, contractor_id, client_id, line_items, deposit_amount"
    )
    .eq("public_token", token)
    .single();

  if (proposalErr || !proposal) {
    console.error("❌ [SIGN] Proposal fetch failed", proposalErr);
    return c.json(
      { error: "Proposal not found", details: proposalErr },
      404
    );
  }

  /* --------------------------------------------------
     Compute approved price
  -------------------------------------------------- */
  let approvedPrice = 0;

  try {
    const payload: any = proposal.line_items;
    const options = Array.isArray(payload?.options) ? payload.options : [];

    const matched =
      options.find(
        (o: any) =>
          (o?.name ?? "").toLowerCase() ===
          accepted_option.toLowerCase()
      ) || options[0];

    approvedPrice = Number(
      matched?.subtotal ?? matched?.price ?? matched?.total ?? 0
    );
  } catch {
    approvedPrice = 0;
  }

  /* --------------------------------------------------
     Upload signature
  -------------------------------------------------- */
  const base64 = signature_image.split(",")[1];
  const buffer = Buffer.from(base64, "base64");
  const filename = `${proposal.id}.png`;

  const { error: uploadErr } = await supabase.storage
    .from("proposal-signatures")
    .upload(filename, buffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (uploadErr) {
    console.error("❌ [SIGN] Signature upload failed", uploadErr);
    return c.json(
      { error: "Signature upload failed", details: uploadErr },
      500
    );
  }

  const { data: publicUrlData } = supabase.storage
    .from("proposal-signatures")
    .getPublicUrl(filename);

  const signatureUrl = publicUrlData.publicUrl;
  const nowIso = new Date().toISOString();

  /* --------------------------------------------------
     Update proposal
  -------------------------------------------------- */
  const { error: updateErr } = await supabase
    .from("smart_proposals")
    .update({
      signed_option: accepted_option,
      signature_image: signatureUrl,
      signed_at: nowIso,
      status: "accepted",
    })
    .eq("id", proposal.id);

  if (updateErr) {
    console.error("❌ [SIGN] Proposal update failed", updateErr);
    return c.json(
      { error: "Failed to update proposal", details: updateErr },
      500
    );
  }

  /* --------------------------------------------------
     CREATE JOB — THIS IS WHAT IS FAILING
  -------------------------------------------------- */
  console.log("🧪 [JOB INSERT PAYLOAD]", {
    proposal_id: proposal.id,
    contractor_id: proposal.contractor_id,
    client_id: proposal.client_id,
    approved_option: accepted_option,
    approved_price: approvedPrice,
    deposit_amount: proposal.deposit_amount,
    status: "pending",
  });

  const { data: job, error: jobErr } = await supabase
    .from("jobs")
    .insert({
      proposal_id: proposal.id,
      contractor_id: proposal.contractor_id,
      client_id: proposal.client_id,
      approved_option: accepted_option,
      approved_price: approvedPrice,
      deposit_amount: proposal.deposit_amount ?? null,
      approved_at: nowIso,
      status: "pending",
    })
    .select()
    .single();

  if (jobErr) {
    console.error("❌ [SIGN] JOB INSERT FAILED", jobErr);
    return c.json(
      {
        error: "Failed to create job",
        message: jobErr.message,
        hint: jobErr.hint,
        code: jobErr.code,
        details: jobErr,
      },
      500
    );
  }

  /* --------------------------------------------------
     Success
  -------------------------------------------------- */
  return c.json({
    success: true,
    job_id: job.id,
    proposal_id: proposal.id,
    signature_url: signatureUrl,
  });
});
