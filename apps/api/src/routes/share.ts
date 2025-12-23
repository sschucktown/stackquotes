import { Hono } from "hono";
import type { Context } from "hono";
import { z } from "zod";
import { Buffer } from "node:buffer";
import { getServiceClient } from "../lib/supabase.js";



export const shareRouter = new Hono();
shareRouter.get("/proposal/:token/job", async (c) => {
  const token = c.req.param("token");
  const supabase = getServiceClient();

  console.log("🧪 HIT /proposal/:token/job with token:", token);

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
    payment_link_url: job.payment_link_url,
  });
});

/* =========================================================
   GET /api/share/proposal/:token
========================================================= */
shareRouter.get("/proposal/:token", async (c: Context) => {
  const token = c.req.param("token");
  const supabase = getServiceClient();

  if (!token) return c.json({ error: "Invalid proposal link" }, 400);

  const { data: proposal, error } = await supabase
    .from("smart_proposals")
    .select("*")
    .eq("public_token", token)
    .single();

  if (error || !proposal) {
    return c.json({ error: "Proposal not found" }, 404);
  }

  return c.json({ data: proposal });
});

/* =========================================================
   GET /api/share/proposal/:token/job   ✅ THIS WAS MISSING
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
   POST /api/share/proposal/:token/accept
========================================================= */
shareRouter.post("/proposal/:token/accept", async (c: Context) => {
  const token = c.req.param("token");
  const supabase = getServiceClient();

  const body = await c.req.json<{ optionName?: string }>();
  if (!body.optionName) {
    return c.json({ error: "Missing option name" }, 400);
  }

  const { data: proposal } = await supabase
    .from("smart_proposals")
    .select("*")
    .eq("public_token", token)
    .single();

  if (!proposal) return c.json({ error: "Proposal not found" }, 404);

  if (proposal.job_id) {
    return c.json({ job_id: proposal.job_id });
  }

  const { data: job } = await supabase
    .from("jobs")
    .insert({
      proposal_id: proposal.id,
      contractor_id: proposal.contractor_id,
      client_id: proposal.client_id,
      approved_option: body.optionName,
      deposit_amount: proposal.deposit_amount,
      status: "pending",
    })
    .select()
    .single();

  await supabase
    .from("smart_proposals")
    .update({ job_id: job.id, status: "accepted" })
    .eq("id", proposal.id);

  return c.json({ job_id: job.id });
});

/* =========================================================
   POST /api/share/proposal/:token/sign
========================================================= */
shareRouter.post("/proposal/:token/sign", async (c: Context) => {
  const token = c.req.param("token");
  const supabase = getServiceClient();

  const schema = z.object({
    accepted_option: z.string(),
    signature_image: z.string(),
  });

  const { accepted_option, signature_image } = schema.parse(await c.req.json());

  const { data: proposal } = await supabase
    .from("smart_proposals")
    .select("*")
    .eq("public_token", token)
    .single();

  if (!proposal) return c.json({ error: "Proposal not found" }, 404);

  const buffer = Buffer.from(signature_image.split(",")[1], "base64");

  await supabase.storage
    .from("proposal-signatures")
    .upload(`${proposal.id}.png`, buffer, { upsert: true });

  await supabase
    .from("smart_proposals")
    .update({ status: "accepted", signed_option: accepted_option })
    .eq("id", proposal.id);

  return c.json({ success: true });
});

export default shareRouter;
