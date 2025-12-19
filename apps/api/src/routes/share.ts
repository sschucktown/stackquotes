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
  const supabase = getServiceClient();
  const { optionName } = await c.req.json<{ optionName?: string }>();

  console.log("[ACCEPT] token:", token);
  console.log("[ACCEPT] optionName:", optionName);

  if (!token || !optionName) {
    return c.json({ error: "Invalid request" }, 400);
  }

  /* 1️⃣ Fetch proposal */
  const { data: proposal, error: proposalError } = await supabase
    .from("smart_proposals")
    .select("*")
    .eq("public_token", token)
    .single();

  console.log("[ACCEPT] proposal:", proposal);

  if (proposalError || !proposal) {
    return c.json({ error: "Proposal not found" }, 404);
  }

  if (proposal.job_id) {
    return c.json({
      data: {
        status: proposal.status,
        job_id: proposal.job_id,
      },
    });
  }

  /* 2️⃣ Validate option */
  const options = Array.isArray(proposal.line_items)
    ? proposal.line_items
    : [];

  const selectedOption = options.find(
    (o: any) => o.name === optionName
  );

  if (!selectedOption) {
    return c.json({ error: "Invalid option selected" }, 400);
  }

  const approvedPrice =
    typeof selectedOption.subtotal === "number"
      ? selectedOption.subtotal
      : null;

  /* 3️⃣ Create job */
  const jobPayload = {
    proposal_id: proposal.id,
    contractor_id: proposal.contractor_id,
    client_id: proposal.client_id,
    approved_option: optionName,
    approved_price: approvedPrice,
    deposit_amount: proposal.deposit_amount,
    status: "pending",
  };

  console.log("[JOB INSERT PAYLOAD]", jobPayload);

  const { data: jobs, error: jobError } = await supabase
    .from("jobs")
    .insert([jobPayload])
    .select()
    .single();

  console.log("[JOB INSERT RESULT]", jobs, jobError);

  if (jobError || !jobs) {
    return c.json({ error: "Job creation failed" }, 500);
  }

  /* 4️⃣ Update proposal */
  const { error: updateError } = await supabase
    .from("smart_proposals")
    .update({
      status: "accepted",
      accepted_option: optionName,
      accepted_at: new Date().toISOString(),
      job_id: jobs.id,
    })
    .eq("id", proposal.id);

  console.log("[PROPOSAL UPDATE ERROR]", updateError);

  if (updateError) {
    return c.json({ error: "Proposal update failed" }, 500);
  }

  /* 5️⃣ Success */
  return c.json({
    data: {
      status: "accepted",
      job_id: jobs.id,
      job_public_token: jobs.job_public_token,
    },
  });
});

export default shareRouter;
