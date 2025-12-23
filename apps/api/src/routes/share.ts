import { Hono } from "hono";
import type { Context } from "hono";
import { z } from "zod";
import { Buffer } from "node:buffer";
import { getServiceClient } from "../lib/supabase.js";

/**
 * PUBLIC SHARE ROUTER
 * Handles public SmartProposal access, acceptance, signature,
 * and post-sign success flows
 */
export const shareRouter = new Hono();

/* =========================================================
   GET /api/share/proposal/:token
   Public proposal viewer
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

  return c.json({
    data: {
      proposal: {
        id: proposal.id,
        title: proposal.title,
        description: proposal.description,
        status: proposal.status,
        publicToken: proposal.public_token,
        options,
        deposit_amount: proposal.deposit_amount ?? 0,
      },
    },
  });
});

/* =========================================================
   POST /api/share/proposal/:token/sign
   Public signature + job creation
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

  let parsed;
  try {
    parsed = bodySchema.parse(await c.req.json());
  } catch {
    return c.json({ error: "Invalid payload" }, 400);
  }

  const { accepted_option, signature_image } = parsed;

  // Fetch proposal
  const { data: proposal, error: proposalErr } = await supabase
    .from("smart_proposals")
    .select("*")
    .eq("public_token", token)
    .single();

  if (proposalErr || !proposal) {
    return c.json({ error: "Proposal not found" }, 404);
  }

  // Upload signature
  const base64 = signature_image.split(",")[1];
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

  // Update proposal
  await supabase
    .from("smart_proposals")
    .update({
      signed_option: accepted_option,
      signature_image: signatureUrl,
      signed_at: nowIso,
      status: "accepted",
    })
    .eq("id", proposal.id);

  // Idempotent job creation
  if (!proposal.job_id) {
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
          String(o?.name ?? "").toLowerCase() ===
          accepted_option.toLowerCase()
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
        deposit_amount: proposal.deposit_amount ?? 0,
        status: "pending",
      })
      .select()
      .single();

    if (jobErr || !job) {
      console.error("❌ [SIGN] job create failed", jobErr);
      return c.json({ error: "Failed to create job" }, 500);
    }

    await supabase
      .from("smart_proposals")
      .update({ job_id: job.id })
      .eq("id", proposal.id);
  }

  return c.json({ success: true });
});

/* =========================================================
   GET /api/share/proposal/:token/job
   SUCCESS PAGE DATA (THIS WAS MISSING)
========================================================= */
shareRouter.get("/proposal/:token/job", async (c: Context) => {
  const token = c.req.param("token");
  const supabase = getServiceClient();

  console.log("🔎 [JOB FETCH] token:", token);

  if (!token) return c.json({ error: "Missing token" }, 400);

  const { data: proposal, error: proposalErr } = await supabase
    .from("smart_proposals")
    .select("id, job_id, deposit_amount")
    .eq("public_token", token)
    .single();

  if (proposalErr || !proposal) {
    return c.json({ error: "Proposal not found" }, 404);
  }

  if (!proposal.job_id) {
    return c.json({ error: "Job not found" }, 404);
  }

  const { data: job, error: jobErr } = await supabase
    .from("jobs")
    .select("id, deposit_amount, payment_link_url, status")
    .eq("id", proposal.job_id)
    .single();

  if (jobErr || !job) {
    return c.json({ error: "Job not found" }, 404);
  }

  return c.json({
    job_id: job.id,
    status: job.status,
    deposit_amount: job.deposit_amount ?? proposal.deposit_amount ?? 0,
    payment_link_url: job.payment_link_url ?? null,
  });
});

/* =========================================================
   DEBUG: list recent proposals + tokens
   TEMPORARY — REMOVE AFTER DEBUGGING
========================================================= */
shareRouter.get("/_debug/proposals", async () => {
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("smart_proposals")
    .select("id, public_token, job_id, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }

  return new Response(JSON.stringify(data), { status: 200 });
});


export default shareRouter;
