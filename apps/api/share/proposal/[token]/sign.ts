import { Hono } from "hono";
import { z } from "zod";
import { getServiceClient } from "../../../lib/supabase";
import { createJobFromProposal } from "../../../lib/createJobFromProposal";

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
  } catch (err) {
    return c.json({ error: "Invalid payload" }, 400);
  }

  const { accepted_option, signature_image } = parsed;

  /* -----------------------------
     Fetch proposal by token
  ------------------------------ */

  const { data: proposal, error: fetchErr } = await supabase
    .from("smart_proposals")
    .select(
      `
        id,
        contractor_id,
        client_id,
        line_items,
        deposit_amount,
        status,
        signed_at
      `
    )
    .eq("public_token", token)
    .single();

  if (fetchErr || !proposal) {
    return c.json({ error: "Proposal not found" }, 404);
  }

  if (proposal.signed_at) {
    return c.json(
      { error: "Proposal already signed" },
      409
    );
  }

  if (proposal.status !== "sent") {
    return c.json(
      { error: "Proposal is not in a signable state" },
      409
    );
  }

  /* -----------------------------
     Upload signature
  ------------------------------ */

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
    console.error("[SIGN] upload failed", uploadErr);
    return c.json({ error: "Signature upload failed" }, 500);
  }

  const { data: publicUrl } = supabase.storage
    .from("proposal-signatures")
    .getPublicUrl(filename);

  /* -----------------------------
     Update proposal
  ------------------------------ */

  const now = new Date().toISOString();

  const { error: updateErr } = await supabase
    .from("smart_proposals")
    .update({
      signed_option: accepted_option,
      signature_image: publicUrl.publicUrl,
      signed_at: now,
      status: "accepted",
    })
    .eq("id", proposal.id);

  if (updateErr) {
    console.error("[SIGN] proposal update failed", updateErr);
    return c.json(
      { error: "Failed to update proposal" },
      500
    );
  }

  /* -----------------------------
     Create job (single source of truth)
  ------------------------------ */

  let jobResult;
  try {
    jobResult = await createJobFromProposal({
      supabase,
      proposal,
      acceptedOption: accepted_option,
      actor: "client",
    });
  } catch (err: any) {
    console.error("❌ [SIGN] job create failed", err);
    return c.json(
      { error: err.message || "Failed to create job" },
      500
    );
  }

  /* -----------------------------
     Success
  ------------------------------ */

  return c.json({
    success: true,
    proposal_id: proposal.id,
    job_id: jobResult.job.id,
    accepted_option,
  });
});
