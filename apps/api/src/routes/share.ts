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

  console.log("🔎 [SHARE GET] token:", token);

  if (!token) {
    return c.json({ error: "Invalid proposal link" }, 400);
  }

  const { data: proposal, error } = await supabase
    .from("smart_proposals")
    .select("*")
    .eq("public_token", token)
    .single();

  if (error || !proposal) {
    console.error("❌ [SHARE GET] proposal not found", error);
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
        options: proposal.options ?? [],
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

  if (!token) {
    return c.json({ error: "Invalid proposal link" }, 400);
  }

  const body = await c.req.json<{ optionName?: string }>();
  const optionName = body.optionName;

  console.log("🚨 [ACCEPT] optionName:", optionName);

  if (!optionName) {
    return c.json({ error: "Missing option name" }, 400);
  }

  /* -------------------------------------------------------
     1️⃣ Fetch proposal
  ------------------------------------------------------- */
  const { data: proposal, error: proposalError } = await supabase
    .from("smart_proposals")
    .select("*")
    .eq("public_token", token)
    .single();

  console.log("📦 [ACCEPT] proposal:", proposal);

  if (proposalError || !proposal) {
    console.error("❌ [ACCEPT] proposal fetch failed", proposalError);
    return c.json({ error: "Proposal not found" }, 404);
  }

  /* -------------------------------------------------------
     2️⃣ Idempotency check
  ------------------------------------------------------- */
  if (proposal.job_id) {
    console.warn("⚠️ [ACCEPT] job already exists:", proposal.job_id);
    return c.json({
      data: {
        status: proposal.status,
        job_id: proposal.job_id,
      },
    });
  }

  /* -------------------------------------------------------
     3️⃣ Validate option
  ------------------------------------------------------- */
  const selectedOption = Array.isArray(proposal.options)
    ? proposal.options.find((o: any) => o.name === optionName)
    : null;

  console.log("📦 [ACCEPT] selectedOption:", selectedOption);

  if (!selectedOption) {
    return c.json({ error: "Invalid option selected" }, 400);
  }

  const approvedPrice =
    typeof selectedOption.subtotal === "number"
      ? selectedOption.subtotal
      : null;

  /* -------------------------------------------------------
     4️⃣ Create job
  ------------------------------------------------------- */
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

  /* -------------------------------------------------------
     5️⃣ UPDATE proposal (THIS IS THE PROOF STEP)
  ------------------------------------------------------- */
  const { data: updated, error: updateError } = await supabase
    .from("smart_proposals")
    .update({
      status: "accepted",
      accepted_option: optionName,
      accepted_at: new Date().toISOString(),
      job_id: job.id,
    })
    .eq("id", proposal.id)
    .select(); // 🔴 CRITICAL

  console.log("🧪 [PROPOSAL UPDATE RESULT]", { updated, updateError });

  if (updateError) {
    console.error("❌ [PROPOSAL UPDATE ERROR]", updateError);
    return c.json({ error: "Failed to update proposal" }, 500);
  }

  /* -------------------------------------------------------
     6️⃣ SUCCESS
  ------------------------------------------------------- */
  console.log("✅ [ACCEPT SUCCESS] job_id:", job.id);

  return c.json({
    data: {
      status: "accepted",
      job_id: job.id,
      job_public_token: job.job_public_token,
    },
  });
});

export default shareRouter;
