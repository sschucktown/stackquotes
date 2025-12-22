// apps/api/api/share/proposal/[token]/sign.ts
import { Hono } from "hono";
import { z } from "zod";

import { getServiceClient } from "../../../../lib/supabase";
import { createJobFromProposal } from "../../../../lib/createJobFromProposal";
import { createDepositPayLink } from "../../../../lib/createDepositPayLink";

export const signRouter = new Hono();

/* --------------------------------------------------
   Types
-------------------------------------------------- */

type SmartProposalRow = {
  id: string;
  contractor_id: string | null;
  client_id: string | null;
  line_items: any; // JSON payload (legacy or normalized)
  deposit_amount: number | null;
  status: string | null;
  signed_at: string | null;
  payment_link_url?: string | null;
};

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
  if (!token) return c.json({ error: "Missing proposal token" }, 400);

  // Parse body
  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await c.req.json());
  } catch {
    return c.json({ error: "Invalid payload" }, 400);
  }

  const { accepted_option, signature_image } = parsed;

  // Fetch proposal by public token
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
    .single<SmartProposalRow>();

  if (fetchErr || !proposal) {
    console.error("[SIGN] proposal fetch failed", fetchErr);
    return c.json({ error: "Proposal not found" }, 404);
  }

  // Guardrails (idempotency + correct state)
  if (proposal.signed_at) return c.json({ error: "Proposal already signed" }, 409);
  if ((proposal.status ?? "") !== "sent") {
    return c.json({ error: "Proposal is not in a signable state" }, 409);
  }

  // Upload signature to storage
  const base64 = signature_image.split(",")[1] ?? "";
  if (!base64) return c.json({ error: "Invalid signature image" }, 400);

  const buffer = Buffer.from(base64, "base64");
  const filename = `${proposal.id}.png`;

  const { error: uploadErr } = await supabase.storage
    .from("proposal-signatures")
    .upload(filename, buffer, { contentType: "image/png", upsert: true });

  if (uploadErr) {
    console.error("[SIGN] upload failed", uploadErr);
    return c.json({ error: "Signature upload failed" }, 500);
  }

  const { data: publicUrl } = supabase.storage
    .from("proposal-signatures")
    .getPublicUrl(filename);

  const signatureUrl = publicUrl?.publicUrl ?? null;
  if (!signatureUrl) return c.json({ error: "Signature URL missing" }, 500);

  // Update proposal with signature + acceptance
  const now = new Date().toISOString();

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
    console.error("[SIGN] proposal update failed", updateErr);
    return c.json({ error: "Failed to update proposal" }, 500);
  }

  // Create job (single source of truth)
  let jobId: string;
  try {
    const result = await createJobFromProposal({
      supabase,
      proposal,
      acceptedOption: accepted_option,
      actor: "client",
    });

    jobId = result.job.id;
  } catch (err: any) {
    console.error("❌ [SIGN] job create failed", err);
    return c.json({ error: err?.message || "Failed to create job" }, 500);
  }

  // Re-fetch job (authoritative row for deposit, etc.)
  const { data: job, error: jobFetchErr } = await supabase
    .from("jobs")
    .select("id, deposit_amount, payment_link_url")
    .eq("id", jobId)
    .single<{ id: string; deposit_amount: number | null; payment_link_url: string | null }>();

  if (jobFetchErr || !job) {
    console.error("[SIGN] job refetch failed", jobFetchErr);
    return c.json({ error: "Failed to load created job" }, 500);
  }

  // Create deposit pay link (only if deposit > 0)
  let paymentLinkUrl: string | null = job.payment_link_url ?? null;

  if (!paymentLinkUrl && job.deposit_amount && job.deposit_amount > 0) {
    try {
      paymentLinkUrl = await createDepositPayLink({
        supabase,
        jobId: job.id,
        amount: job.deposit_amount,
      });

      await supabase
        .from("jobs")
        .update({ payment_link_url: paymentLinkUrl })
        .eq("id", job.id);
    } catch (err) {
      console.error("[SIGN] failed to create deposit paylink", err);
      // Non-fatal: success page can still render without button
      paymentLinkUrl = null;
    }
  }

  return c.json({
    success: true,
    proposal_id: proposal.id,
    job_id: job.id,
    accepted_option,
    payment_link_url: paymentLinkUrl,
  });
});
