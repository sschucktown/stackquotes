import { Hono } from "hono";
import { getServiceClient } from "../lib/supabase.js";

export const shareProposalRouter = new Hono();

/* -------------------------------
   GET /api/share/proposal/:id
   Public proposal fetch
-------------------------------- */
shareProposalRouter.get("/proposal/:id", async (c) => {
  const supabase = getServiceClient();
  const proposalId = c.req.param("id");

  if (!proposalId) {
    return c.json({ error: "Invalid proposal id" }, 400);
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
    .eq("id", proposalId)
    .single();

  if (error || !proposal) {
    return c.json({ error: "Proposal not found" }, 404);
  }

  // ⚠️ Expiration logic intentionally disabled for MVP
  /*
  if (proposal.expires_at && new Date(proposal.expires_at) < new Date()) {
    return c.json({ error: "Proposal expired" }, 410);
  }
  */

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
