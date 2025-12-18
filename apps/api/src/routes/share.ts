import { Hono } from "hono";
import type { Context } from "hono";
import { getServiceClient } from "../lib/supabase.js";

/**
 * PUBLIC SHARE ROUTER
 * Handles public SmartProposal access
 */
export const shareRouter = new Hono();

/* =========================================================
   GET /api/share/proposal/:token
   Fetch public SmartProposal (TOKEN-BASED)
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
    return c.json(
      { error: "This proposal link is invalid or has expired." },
      404
    );
  }

  return c.json({
    data: {
      proposal: {
        id: proposal.id,
        title: proposal.title,
        description: proposal.description,
        status: proposal.status,
        publicToken: proposal.public_token,
        options: proposal.options ?? [],
        depositConfig: proposal.deposit_config ?? null,
      },

      contractor: {
        businessName: null,
        accentColor: null,
        logoUrl: null,
        email: null,
      },

      client: null,

      deposit: {
        amount: proposal.deposit_amount ?? null,
        config: proposal.deposit_config ?? null,
      },

      paymentLinkUrl: proposal.payment_link_url ?? null,

      plan: {
        tier: "launch",
        allowMultiOptions: true,
        wowPortalEnabled: true,
        inTrial: false,
      },
    },
  });
});

/* =========================================================
   POST /api/share/proposal/:token/accept
   Accept proposal + create job
========================================================= */
shareRouter.post("/proposal/:token/accept", async (c: Context) => {
  const token = c.req.param("token");
  const supabase = getServiceClient();

  if (!token) {
    return c.json({ error: "Invalid proposal link" }, 400);
  }

  const body = await c.req.json<{ optionName?: string }>();
  const optionName = body.optionName;

  if (!optionName) {
    return c.json({ error: "Missing option name" }, 400);
  }

  /* ----------------------------
     Fetch proposal
  ---------------------------- */
  const { data: proposal, error } = await supabase
    .from("smart_proposals")
    .select("*")
    .eq("public_token", token)
    .single();

  if (error || !proposal) {
    return c.json({ error: "Proposal not found" }, 404);
  }

  if (proposal.status === "accepted") {
    return c.json({ error: "Proposal already accepted" }, 400);
  }

  const selectedOption = Array.isArray(proposal.options)
    ? proposal.options.find((o: any) => o.name === optionName)
    : null;

  if (!selectedOption) {
    return c.json({ error: "Invalid option selected" }, 400);
  }

  /* ----------------------------
     Update proposal
  ---------------------------- */
  const { error: updateError } = await supabase
    .from("smart_proposals")
    .update({
      status: "accepted",
      accepted_option: optionName,
      accepted_at: new Date().toISOString(),
    })
    .eq("id", proposal.id);

  if (updateError) {
    console.error("[PROPOSAL UPDATE ERROR]", updateError);
    return c.json({ error: "Failed to accept proposal" }, 500);
  }

  /* ----------------------------
     Create job
  ---------------------------- */
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .insert({
      proposal_id: proposal.id,
      contractor_id: proposal.contractor_id,
      client_id: proposal.client_id,
      approved_option: optionName,
      approved_price: selectedOption.subtotal ?? 0,
      deposit_amount: proposal.deposit_amount ?? null,
      status: "pending",
    })
    .select("id, job_public_token")
    .single();

  if (jobError) {
    console.error("[JOB CREATE ERROR]", jobError);
    return c.json({ error: "Job creation failed" }, 500);
  }

  /* ----------------------------
     Response
  ---------------------------- */
  return c.json({
    data: {
      status: "accepted",
      acceptedOption: optionName,
      jobId: job.id,
      jobPublicToken: job.job_public_token,
    },
  });
});

export default shareRouter;
