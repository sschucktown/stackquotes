import { Hono } from "hono";
import { z } from "zod";
import { Buffer } from "node:buffer";
import { getServiceClient } from "../../../../lib/supabase.js";

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
  const token = c.req.param("token");

  if (!token) {
    return c.json({ error: "Missing proposal token" }, 400);
  }

  /* -----------------------------
     Parse body
  ------------------------------ */

  let parsed;
  try {
    parsed = bodySchema.parse(await c.req.json());
  } catch {
    return c.json({ error: "Invalid payload" }, 400);
  }

  const { accepted_option, signature_image } = parsed;

  /* -----------------------------
     Fetch proposal
  ------------------------------ */

  const { data: proposal, error: proposalErr } = await supabase
    .from("smart_proposals")
    .select("*")
    .eq("public_token", token)
    .single();

  if (proposalErr || !proposal) {
    return c.json({ error: "Proposal not found" }, 404);
  }

  /* -----------------------------
     Upload signature
  ------------------------------ */

  const base64 = signature_image.split(",")[1] ?? "";
  const buffer = Buffer.from(base64, "base64");
  const filename = `${proposal.id}.png`;

  const { error: uploadErr } = await supabase.storage
    .from("proposal-signatures")
    .upload(filename, buffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (uploadErr) {
    console.error("[SIGN] upload failed", uploadErr);
    return c.json({ error: "Signature upload failed" }, 500);
  }

  const { data: publicUrl } = supabase.storage
    .from("proposal-signatures")
    .getPublicUrl(filename);

  const signatureUrl = publicUrl.publicUrl;
  const nowIso = new Date().toISOString();

  /* -----------------------------
     Update proposal (signed)
  ------------------------------ */

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
    console.error("[SIGN] proposal update failed", updateErr);
    return c.json({ error: "Failed to update proposal" }, 500);
  }

  /* ==================================================
     ENSURE JOB EXISTS (AUTHORITATIVE)
     This is the missing invariant fix
  ================================================== */

  let jobId = proposal.job_id ?? null;

  if (!jobId) {
    // Normalize options to compute approved price
    let options: any[] = [];

    if (Array.isArray(proposal.options)) {
      options = proposal.options;
    } else if (
      proposal.line_items &&
      typeof proposal.line_items === "object" &&
      Array.isArray((proposal.line_items as any).options)
    ) {
      options = (proposal.line_items as any).options;
    }

    const matchedOption =
      options.find(
        (o: any) =>
          String(o?.name ?? "").toLowerCase() ===
          accepted_option.toLowerCase()
      ) ?? options[0];

    const approvedPrice =
      typeof matchedOption?.subtotal === "number"
        ? matchedOption.subtotal
        : 0;

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
      .select("id")
      .single();

    if (jobErr || !job) {
      console.error("❌ [SIGN] job create failed", jobErr);
      return c.json({ error: "Failed to create job" }, 500);
    }

    jobId = job.id;

    // 🔑 CRITICAL BACK-LINK
    await supabase
      .from("smart_proposals")
      .update({ job_id: jobId })
      .eq("id", proposal.id);
  }

  /* -----------------------------
     Success
  ------------------------------ */

  return c.json({
    success: true,
    proposal_id: proposal.id,
    job_id: jobId,
  });
});

export default signRouter;
