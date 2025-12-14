import { Hono } from "hono";
import { getServiceClient } from "../lib/supabase.js";

export const shareRouter = new Hono();

shareRouter.get("/proposal/id/:id", async (c) => {
  const id = c.req.param("id");
  const supabase = getServiceClient();

  if (!id) {
    c.status(400);
    return c.json({ error: "Invalid proposal id" });
  }

  const { data: proposal, error } = await supabase
    .from("smart_proposals")
    .select(`
      id,
      status,
      signed_option,
      title,
      description,
      client_id,
      contractor_id,
      payment_link_url,
      created_at,
      signed_at
    `)
    .eq("id", id)
    .single();

  if (error || !proposal) {
    c.status(404);
    return c.json({ error: "Proposal not found" });
  }

  return c.json({
    proposal,
  });
});

export default shareRouter;
