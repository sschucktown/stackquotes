import { Hono } from "hono";
import { getServiceClient } from "../../../lib/supabase";

const router = new Hono();

// GET /api/share/proposal/:token
router.get("/", async (c) => {
  const token = c.req.param("token");

  if (!token) {
    return c.json({ error: "Invalid proposal token" }, 400);
  }

  const supabase = getServiceClient();

  const { data: proposal, error } = await supabase
    .from("smart_proposals")
    .select(`
      id,
      status,
      signed_option,
      public_token,
      quickquote_id,
      payment_link_url,
      user_id,
      contractor_id,
      client_id,
      title,
      description,
      created_at,
      signed_at
    `)
    .eq("public_token", token)
    .single();

  if (error && error.code === "PGRST116") {
    return c.json({ error: "Proposal not found" }, 404);
  }

  if (error) {
    console.error("Proposal fetch error:", error);
    return c.json({ error: "Failed to load proposal" }, 500);
  }

  return c.json({
    proposal: {
      id: proposal.id,
      status: proposal.status,
      signed_option: proposal.signed_option,
      title: proposal.title,
      description: proposal.description,
      client_id: proposal.client_id,
      contractor_id: proposal.contractor_id,
      payment_link_url: proposal.payment_link_url,
      created_at: proposal.created_at,
      signed_at: proposal.signed_at,
    },
  });
});

export default router;
