import { Hono } from "hono";
import type { Context } from "hono";
import { getServiceClient } from "../lib/supabase.js";

/**
 * PUBLIC SHARE ROUTER
 * Handles public SmartProposal access + acceptance
 */
export const shareRouter = new Hono();

/* =========================================================
   GET /api/share/proposal/:token
   Fetch public SmartProposal
========================================================= */
shareRouter.get("/proposal/:token", async (c: Context) => {
  const token = c.req.param("token");
  const supabase = getServiceClient();

  if (!token) {
    return c.json({ error: "Invalid proposal link" }, 400);
  }

  const { data: proposal, error } = await supabase
    .from("smart_proposals")
    .select("*")
    .eq("public_token", token)
    .single();

  if (error || !proposal) {
    return c.json({ error: "Proposal not found" }, 404);
  }

  return c.json({
    data: {
      proposal: {
        id: proposal.id,
        title: proposal.title,
        description: proposal.description,
        status: proposal.status,
        publicToken: proposal.public_token,

        // 🔑 FIX: options come from line_items
        options: Array.isArray(proposal.line_items)
          ? proposal.line_items
          : [],

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

  const { optionName } = await c.req.json<{ optionName?: string }>();

  if (!token || !optionName) {
    return c.json({ error: "Invalid request" }, 400);
  }

  // 1️⃣ Fetch proposal
  const { data: proposal, error } = await supabase
    .from("smart_proposals")
    .select("*")
    .eq("public_token", token)
    .single();

  if (error || !proposal) {
    return c.json({ error: "Proposal not found" }, 404);
  }

  // 2️⃣ Prevent double-accept
  if (proposal.job_id) {
    return c.json({
      data: {
        status: proposal.status,
        job_id: proposal.job_id,
      },
    });
  }

  // 🔑 FIX: validate against line_items
  const selectedOption = Array.isArray(proposal.line_items)
    ? proposal.line_items.find((o: any) => o.name === optionName)
    : null;

  if (!selectedOption) {
    return c.json({ error: "Invalid option selected" }, 400);
  }

  const approvedPrice =
    typeof selectedOption.subtotal === "number"
      ? selectedOption.subtotal
      : null;

  // 3️⃣ Create job
  const { data: jobs, error: jobError } = await supabase
    .from("jobs")
    .insert([
      {
        proposal_id: proposal.id,
        contractor_id: proposal.contractor_id,
        client_id: proposal.client_id,
        approved_option: optionName,
        approved_price: approvedPrice,
        deposit_amount: proposal.deposit_amount,
        status: "pending",
      },
    ])
    .select();

  if (jobError || !jobs || jobs.length === 0) {
    console.error("[JOB CREATE ERROR]", jobError);
    return c.json({ error: "Job creation failed" }, 500);
  }

  const job = jobs[0];

  // 4️⃣ Back-link job → proposal
  await supabase
    .from("smart_proposals")
    .update({
      status: "accepted",
      accepted_option: optionName,
      accepted_at: new Date().toISOString(),
      job_id: job.id,
    })
    .eq("id", proposal.id);

  return c.json({
    data: {
      status: "accepted",
      job_id: job.id,
      job_public_token: job.job_public_token,
    },
  });
});

export default shareRouter;
