import { Hono } from "hono";
import { z } from "zod";
import { requireUser } from "../../lib/auth.js";
import { getServiceClient } from "../../lib/supabase.js";
import { createJobEvent, JOB_EVENT_TYPES } from "../../lib/jobEvents.js";

export const signRouter = new Hono();

const bodySchema = z.object({
  accepted_option: z.string().min(1),
  signature_image: z.string().startsWith("data:image/"),
});

// POST /api/smartproposals/:proposalId/sign
signRouter.post("/", async (c) => {
  const user = await requireUser(c);
  const supabase = getServiceClient();

  const proposalId = c.req.param("proposalId");
  if (!proposalId) {
    return c.json({ error: "Missing proposalId" }, 400);
  }

  let parsed;
  try {
    parsed = bodySchema.parse(await c.req.json());
  } catch (e) {
    return c.json({ error: "Invalid payload", details: e }, 400);
  }

  const { accepted_option, signature_image } = parsed;

  // 1) Fetch proposal
  const { data: proposal, error: fetchErr } = await supabase
    .from("smart_proposals")
    .select("id, contractor_id, client_id, line_items, deposit_amount")
    .eq("id", proposalId)
    .single();

  if (fetchErr || !proposal) {
    return c.json({ error: "Proposal not found", details: fetchErr }, 404);
  }

  // 2) Compute approved price (best effort)
  let approvedPrice = 0;
  try {
    const payload: any = proposal.line_items;
    const options = Array.isArray(payload?.options) ? payload.options : [];
    const lower = accepted_option.toLowerCase();

    const matched =
      options.find((o: any) => (o?.name ?? "").toLowerCase() === lower) ||
      options.find((o: any) => (o?.name ?? "").toLowerCase() === "better") ||
      options[0];

    approvedPrice = Number(
      matched?.subtotal ?? matched?.price ?? matched?.total ?? 0
    ) || 0;
  } catch {
    approvedPrice = 0;
  }

  const depositAmount =
    proposal.deposit_amount !== null && proposal.deposit_amount !== undefined
      ? Number(proposal.deposit_amount)
      : null;

  // 3) Upload signature
  const base64Data = signature_image.split(",")[1];
  const buffer = Buffer.from(base64Data, "base64");
  const filename = `${proposalId}.png`;

  const { error: uploadErr } = await supabase.storage
    .from("proposal-signatures")
    .upload(filename, buffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (uploadErr) {
    return c.json({ error: "Signature upload failed", details: uploadErr }, 500);
  }

  const { data: publicUrlData } = supabase.storage
    .from("proposal-signatures")
    .getPublicUrl(filename);

  const signatureUrl = publicUrlData.publicUrl;
  const nowIso = new Date().toISOString();

  // 4) Update proposal
  const { error: updateErr } = await supabase
    .from("smart_proposals")
    .update({
      signed_option: accepted_option,
      signature_image: signatureUrl,
      signed_at: nowIso,
      status: "accepted",
    })
    .eq("id", proposalId);

  if (updateErr) {
    return c.json({ error: "Failed to update proposal", details: updateErr }, 500);
  }

  // 5) Create job (PRIMARY PATH)
  const { data: job, error: jobErr } = await supabase
    .from("jobs")
    .insert({
      proposal_id: proposal.id,
      contractor_id: proposal.contractor_id ?? user.id,
      client_id: proposal.client_id,
      approved_option: accepted_option,
      approved_price: approvedPrice,
      deposit_amount: depositAmount,
      approved_at: nowIso,
      status: "pending",
    })
    .select()
    .single();

  if (jobErr || !job) {
    return c.json(
      { error: "Failed to create job for signed proposal", details: jobErr },
      500
    );
  }

  // 6) Record job event (NON-BLOCKING)
  try {
    await createJobEvent(supabase, {
      jobId: job.id,
      type: JOB_EVENT_TYPES.JOB_CREATED,
      actor: "system",
      title: "Job created",
      description: "Project created from signed proposal",
    });
  } catch (err) {
    console.error("[sign] Failed to record JOB_CREATED event", err);
  }

  return c.json({
    success: true,
    proposalId,
    job_id: job.id,
    accepted_option,
    signature_url: signatureUrl,
  });
});
