import { Hono } from "hono";
import { getServiceClient } from "../../../../lib/supabase";

export const jobRouter = new Hono();

/* --------------------------------------------------
   GET /api/share/proposal/:token/job
-------------------------------------------------- */

jobRouter.get("/", async (c) => {
  const supabase = getServiceClient();

  const token = c.req.param("token");
  if (!token) {
    return c.json({ error: "Missing proposal token" }, 400);
  }

  // 1️⃣ Find proposal by public token
  const { data: proposal, error: proposalErr } = await supabase
    .from("smart_proposals")
    .select("id")
    .eq("public_token", token)
    .single();

  if (proposalErr || !proposal) {
    return c.json({ error: "Proposal not found" }, 404);
  }

  // 2️⃣ Find job created from proposal
  const { data: job, error: jobErr } = await supabase
    .from("jobs")
    .select("id, deposit_amount, payment_link_url")
    .eq("proposal_id", proposal.id)
    .single();

  if (jobErr || !job) {
    return c.json({ error: "Job not found" }, 404);
  }

  // 3️⃣ Return job in a stable shape
  return c.json({
    job: {
      id: job.id,
      deposit_amount: job.deposit_amount ?? 0,
      payment_link_url: job.payment_link_url,
    },
  });
});
