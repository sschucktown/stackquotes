import { Hono } from "hono";
import type { Context } from "hono";
import { getServiceClient } from "../lib/supabase.js";

export const shareRouter = new Hono();

/* =========================================================
   GET /api/share/proposal/:token
========================================================= */
shareRouter.get("/proposal/:token", async (c: Context) => {
  const token = c.req.param("token");
  const supabase = getServiceClient();

  const { data: proposal } = await supabase
    .from("smart_proposals")
    .select("*")
    .eq("public_token", token)
    .single();

  if (!proposal) {
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
        options: proposal.line_items ?? [],
      },
    },
  });
});

/* =========================================================
   POST /api/share/proposal/:token/accept
========================================================= */
shareRouter.post("/proposal/:token/accept", async (c: Context) => {
  const token = c.req.param("token");
  const { optionName } = await c.req.json<{ optionName?: string }>();
  const supabase = getServiceClient();

  if (!token || !optionName) {
    return c.json({ error: "Invalid request" }, 400);
  }

  const { data: proposal } = await supabase
    .from("smart_proposals")
    .select("*")
    .eq("public_token", token)
    .single();

  if (!proposal) {
    return c.json({ error: "Proposal not found" }, 404);
  }

  // Idempotent
  if (proposal.job_id) {
    return c.json({
      data: {
        status: proposal.status,
        job_id: proposal.job_id,
      },
    });
  }

  const selected = proposal.line_items?.find(
    (o: any) => o.name === optionName
  );

  if (!selected) {
    return c.json({ error: "Invalid option" }, 400);
  }

  const { data: jobs, error: jobError } = await supabase
    .from("jobs")
    .insert([{
      proposal_id: proposal.id,
      contractor_id: proposal.contractor_id,
      client_id: proposal.client_id,
      approved_option: optionName,
      approved_price: selected.subtotal ?? null,
      deposit_amount: proposal.deposit_amount,
      status: "pending",
    }])
    .select();

  if (jobError || !jobs?.length) {
    console.error("[JOB ERROR]", jobError);
    return c.json({ error: "Job creation failed" }, 500);
  }

  const job = jobs[0];

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
