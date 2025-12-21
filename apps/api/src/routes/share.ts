import { Hono } from "hono";
import type { Context } from "hono";
import { z } from "zod";
import { Buffer } from "node:buffer";
import { getServiceClient } from "../lib/supabase.js";

/**
 * PUBLIC SHARE ROUTER
 * Handles public SmartProposal access + acceptance + signature
 */
export const shareRouter = new Hono();

/* =========================================================
   GET /api/share/proposal/:token
========================================================= */
shareRouter.get("/proposal/:token", async (c: Context) => {
  const token = c.req.param("token");
  const supabase = getServiceClient();

  console.log("🔎 [SHARE GET] token:", token);

  if (!token) return c.json({ error: "Invalid proposal link" }, 400);

  const { data: proposal, error } = await supabase
    .from("smart_proposals")
    .select("*")
    .eq("public_token", token)
    .single();

  if (error || !proposal) {
    console.error("❌ [SHARE GET] proposal not found", error);
    return c.json({ error: "Proposal not found" }, 404);
  }

  // Normalize options:
  // - newer records might store options in `options`
  // - older records might store in `line_items.options`
  let options: any[] = [];
  if (Array.isArray(proposal.options)) options = proposal.options;
  else if (
    proposal.line_items &&
    typeof proposal.line_items === "object" &&
    Array.isArray((proposal.line_items as any).options)
  ) {
    options = (proposal.line_items as any).options;
  }

  console.log("📦 [SHARE GET] options count:", options.length);

  return c.json({
    data: {
      proposal: {
        id: proposal.id,
        title: proposal.title,
        description: proposal.description,
        status: proposal.status,
        publicToken: proposal.public_token,
        options,
        depositConfig: proposal.deposit_config ?? null,
      },
    },
  });
});

/* =========================================================
   POST /api/share/proposal/:token/accept
   Accept proposal AND create job
========================================================= */
shareRouter.post("/proposal/:token/accept", async (c: Context) => {
  const token = c.req.param("token");
  const supabase = getServiceClient();

  console.log("🚨 [ACCEPT] token:", token);

  if (!token) return c.json({ error: "Invalid proposal link" }, 400);

  const body = await c.req.json<{ optionName?: string }>();
  const optionName = body.optionName;

  console.log("🚨 [ACCEPT] optionName:", optionName);

  if (!optionName) return c.json({ error: "Missing option name" }, 400);

  const { data: proposal, error: proposalError } = await supabase
    .from("smart_proposals")
    .select("*")
    .eq("public_token", token)
    .single();

  if (proposalError || !proposal) {
    console.error("❌ [ACCEPT] proposal fetch failed", proposalError);
    return c.json({ error: "Proposal not found" }, 404);
  }

  // Idempotency
  if (proposal.job_id) {
    console.warn("⚠️ [ACCEPT] job already exists:", proposal.job_id);
    return c.json({
      data: { status: proposal.status, job_id: proposal.job_id },
    });
  }

  // Normalize options
  let options: any[] = [];
  if (Array.isArray(proposal.options)) options = proposal.options;
  else if (
    proposal.line_items &&
    typeof proposal.line_items === "object" &&
    Array.isArray((proposal.line_items as any).options)
  ) {
    options = (proposal.line_items as any).options;
  }

  const selectedOption = options.find((o: any) => o?.name === optionName);

  if (!selectedOption) return c.json({ error: "Invalid option selected" }, 400);

  const approvedPrice =
    typeof selectedOption.subtotal === "number" ? selectedOption.subtotal : null;

  const jobPayload = {
    proposal_id: proposal.id,
    contractor_id: proposal.contractor_id,
    client_id: proposal.client_id,
    approved_option: optionName,
    approved_price: approvedPrice,
    deposit_amount: proposal.deposit_amount,
    status: "pending",
  };

  console.log("🧪 [JOB INSERT PAYLOAD]", jobPayload);

  const { data: jobs, error: jobError } = await supabase
    .from("jobs")
    .insert([jobPayload])
    .select();

  console.log("🧪 [JOB INSERT RESULT]", { jobs, jobError });

  if (jobError || !jobs || jobs.length === 0) {
    console.error("❌ [JOB CREATE FAILED]", jobError);
    return c.json({ error: "Job creation failed" }, 500);
  }

  const job = jobs[0];

  const { error: updateError } = await supabase
    .from("smart_proposals")
    .update({
      status: "accepted",
      accepted_option: optionName,
      accepted_at: new Date().toISOString(),
      job_id: job.id,
    })
    .eq("id", proposal.id);

  if (updateError) {
    console.error("❌ [PROPOSAL UPDATE FAILED]", updateError);
  }

  return c.json({
    data: {
      status: "accepted",
      job_id: job.id,
      job_public_token: job.job_public_token,
    },
  });
});

/* =========================================================
   POST /api/share/proposal/:token/sign
   Public signature capture + job creation (if needed)
========================================================= */
shareRouter.post("/proposal/:token/sign", async (c: Context) => {
  const token = c.req.param("token");
  const supabase = getServiceClient();

  console.log("✍️ [SIGN] token:", token);

  if (!token) return c.json({ error: "Invalid proposal link" }, 400);

  const bodySchema = z.object({
    accepted_option: z.string().min(1),
    signature_image: z.string().startsWith("data:image/"),
  });

  let parsed: { accepted_option: string; signature_image: string };
  try {
    parsed = bodySchema.parse(await c.req.json());
  } catch (e) {
    console.error("❌ [SIGN] invalid payload", e);
    return c.json({ error: "Invalid payload" }, 400);
  }

  const { accepted_option, signature_image } = parsed;

  // 1) Fetch proposal by public_token
  const { data: proposal, error: fetchErr } = await supabase
    .from("smart_proposals")
    .select("*")
    .eq("public_token", token)
    .single();

  if (fetchErr || !proposal) {
    console.error("❌ [SIGN] proposal not found", fetchErr);
    return c.json({ error: "Proposal not found" }, 404);
  }

  // 2) Upload signature
  const base64 = signature_image.split(",")[1] ?? "";
  const buffer = Buffer.from(base64, "base64");
  const filename = `${proposal.id}.png`;

  const { error: uploadErr } = await supabase.storage
    .from("proposal-signatures")
    .upload(filename, buffer, { contentType: "image/png", upsert: true });

  if (uploadErr) {
    console.error("❌ [SIGN] upload failed", uploadErr);
    return c.json({ error: "Signature upload failed" }, 500);
  }

  const { data: urlData } = supabase.storage
    .from("proposal-signatures")
    .getPublicUrl(filename);

  const signatureUrl = urlData.publicUrl;
  const nowIso = new Date().toISOString();

  // 3) Update proposal (signature + accepted status)
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
    console.error("❌ [SIGN] proposal update failed", updateErr);
    return c.json({ error: "Failed to update proposal" }, 500);
  }

  // 4) Ensure job exists (idempotent)
  if (proposal.job_id) {
    console.log("✅ [SIGN] job already exists:", proposal.job_id);
    return c.json({ success: true, job_id: proposal.job_id });
  }

  // Normalize options to compute price (best effort)
  let options: any[] = [];
  if (Array.isArray(proposal.options)) options = proposal.options;
  else if (
    proposal.line_items &&
    typeof proposal.line_items === "object" &&
    Array.isArray((proposal.line_items as any).options)
  ) {
    options = (proposal.line_items as any).options;
  }

  const matched =
    options.find(
      (o: any) =>
        String(o?.name ?? "").toLowerCase() === accepted_option.toLowerCase()
    ) || options[0];

  const approvedPrice = Number(matched?.subtotal ?? 0) || 0;

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

  if (jobErr || !job) {
    console.error("❌ [SIGN] job create failed", jobErr);
    return c.json({ error: "Failed to create job" }, 500);
  }

  // back-link job_id
  await supabase
    .from("smart_proposals")
    .update({ job_id: job.id })
    .eq("id", proposal.id);

  console.log("✅ [SIGN] created job:", job.id);

  return c.json({ success: true, job_id: job.id, signature_url: signatureUrl });
});

export default shareRouter;
