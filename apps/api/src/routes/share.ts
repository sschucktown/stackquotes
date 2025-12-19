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

  // 🔑 CRITICAL FIX: options come from line_items.options
  const options =
    typeof proposal.line_items === "object" &&
    proposal.line_items !== null &&
    Array.isArray((proposal.line_items as any).options)
      ? (proposal.line_items as any).options
      : [];

  return c.json({
    data: {
      proposal: {
        id: proposal.id,
        title: proposal.title,
        description: proposal.description,
        status: proposal.status,
        publicToken: proposal.public_token,
        options,
        depositConfig: proposal.deposit_config,
      },
    },
  });
});

/* =========================================================
   POST /api/share/proposal/:token/accept
========================================================= */
shareRouter.post("/proposal/:token/accept", async (c: Context) => {
  const token = c.req.param("token");
  const supabase = getServiceClient();
  const { optionName } = await c.req.json<{ optionName?: string }>();

  if (!token || !optionName) {
    return c.json({ error: "Invalid request" }, 400);
  }

  const { data: proposal, error } = await supabase
    .from("smart_proposals")
    .select("*")
    .eq("public_token", token)
    .single();

  if (error || !proposal) {
    return c.json({ error: "Proposal not found" }, 404);
  }

  const options =
    typeof proposal.line_items === "object" &&
    proposal.line_items !== null &&
    Array.isArray((proposal.line_items as any).options)
      ? (proposal.line_items as any).options
      : [];

  const selected = options.find((o: any) => o.name === optionName);

  if (!selected) {
    return c.json({ error: "Invalid option selected" }, 400);
  }

  // Create job
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .insert({
      proposal_id: proposal.id,
      contractor_id: proposal.contractor_id,
      client_id: proposal.client_id,
      approved_option: optionName,
      approved_price: selected.subtotal,
      deposit_amount: proposal.deposit_amount,
      status: "pending",
    })
    .select()
    .single();

  if (jobError || !job) {
    return c.json({ error: "Job creation failed" }, 500);
  }

  // Update proposal
  await supabase
    .from("smart_proposals")
    .update({
      status: "accepted",
      accepted_option: optionName,
      job_id: job.id,
      accepted_at: new Date().toISOString(),
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
