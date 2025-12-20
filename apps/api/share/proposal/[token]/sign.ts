import { Hono } from "hono";
import { z } from "zod";
import { getServiceClient } from "../../../lib/supabase";

export const signRouter = new Hono();

/* --------------------------------------------------
   Schema
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
  const publicToken = c.req.param("token");

  if (!publicToken) {
    return c.json({ error: "Missing proposal token" }, 400);
  }

  let parsed;
  try {
    parsed = bodySchema.parse(await c.req.json());
  } catch {
    return c.json({ error: "Invalid payload" }, 400);
  }

  const { accepted_option, signature_image } = parsed;

  /* --------------------------------------------------
     1) Fetch proposal by PUBLIC TOKEN
  -------------------------------------------------- */
  const { data: proposal, error: fetchErr } = await supabase
    .from("smart_proposals")
    .select(
      "id, contractor_id, client_id, line_items, deposit_amount"
    )
    .eq("public_token", publicToken)
    .single();

  if (fetchErr || !proposal) {
    return c.json({ error: "Proposal not found" }, 404);
  }

  /* --------------------------------------------------
     2) Resolve approved price
  -------------------------------------------------- */
  let approvedPrice = 0;

  try {
    const payload: any = proposal.line_items;
    const options = Array.isArray(payload?.options)
      ? payload.options
      : [];

    const lower = accepted_option.toLowerCase();

    const match =
      options.find(
        (o: any) => (o?.name ?? "").toLowerCase() === lower
      ) || options[0];

    approvedPrice = Number(match?.subtotal ?? 0);
  } catch {
    approvedPrice = 0;
  }

  /* --------------------------------------------------
     3) Upload signature
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
    return c.json({ error: "Signature upload failed" }, 500);
  }

  const { data: urlData } = supabase.storage
    .from("proposal-signatures")
    .getPublicUrl(filename);

  const signatureUrl = urlData.publicUrl;
  const now = new Date().toISOString();

  /* --------------------------------------------------
     4) Update proposal
  -------------------------------------------------- */
  const { error: updateErr } = await supabase
    .from("smart_proposals")
    .update({
      signed_option: accepted_option,
      signature_image: signatureUrl,
      signed_at: now,
      status: "accepted",
    })
    .eq("id", proposal.id);

  if (updateErr) {
    return c.json({ error: "Failed to update proposal" }, 500);
  }

  /* --------------------------------------------------
     5) Create job (PRIMARY SIDE EFFECT)
  -------------------------------------------------- */
  const { data: job, error: jobErr } = await supabase
    .from("jobs")
    .insert({
      proposal_id: proposal.id,
      contractor_id: proposal.contractor_id,
      client_id: proposal.client_id,
      approved_option: accepted_option,
      approved_price: approvedPrice,
      deposit_amount: proposal.deposit_amount,
      approved_at: now,
      status: "pending",
    })
    .select()
    .single();

  if (jobErr || !job) {
    return c.json({ error: "Failed to create job" }, 500);
  }

  /* --------------------------------------------------
     DONE
  -------------------------------------------------- */
  return c.json({
    success: true,
    job_id: job.id,
    proposal_id: proposal.id,
  });
});
