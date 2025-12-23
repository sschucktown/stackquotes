import { Hono } from "hono";
import { handle } from "hono/vercel";
import { getServiceClient } from "../lib/supabase";

const app = new Hono();

/* --------------------------------------------------
   GET /api/share/proposal/:token
-------------------------------------------------- */
app.get("/proposal/:token", async (c) => {
  const supabase = getServiceClient();
  const token = c.req.param("token");

  const { data, error } = await supabase
    .from("smart_proposals")
    .select("*")
    .eq("public_token", token)
    .single();

  if (error || !data) {
    return c.json({ error: "Proposal not found" }, 404);
  }

  return c.json({ proposal: data });
});

/* --------------------------------------------------
   GET /api/share/proposal/:token/job
-------------------------------------------------- */
app.get("/proposal/:token/job", async (c) => {
  const supabase = getServiceClient();
  const token = c.req.param("token");

  const { data: proposal } = await supabase
    .from("smart_proposals")
    .select("id")
    .eq("public_token", token)
    .single();

  if (!proposal) {
    return c.json({ error: "Proposal not found" }, 404);
  }

  const { data: job } = await supabase
    .from("jobs")
    .select("id, deposit_amount, payment_link_url")
    .eq("proposal_id", proposal.id)
    .single();

  if (!job) {
    return c.json({ error: "Job not found" }, 404);
  }

  return c.json({
    job: {
      id: job.id,
      deposit_amount: job.deposit_amount ?? 0,
      payment_link_url: job.payment_link_url,
    },
  });
});

export default handle(app);
