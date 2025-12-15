import { Hono } from "hono";
import { getServiceClient } from "../lib/supabase.js";

export const shareRouter = new Hono();

/**
 * PUBLIC SMART PROPOSAL
 * URL: /api/share/proposal/:token
 * Uses smart_proposals.public_token (NOT id)
 */
shareRouter.get("/proposal/:token", async (c) => {
  const token = c.req.param("token");
  const supabase = getServiceClient();

  if (!token) {
    return c.json({ error: "Invalid proposal link" }, 400);
  }

  const { data: proposal, error } = await supabase
    .from("smart_proposals")
    .select(`
      id,
      public_token,
      status,
      accepted_option,
      title,
      description,
      client_id,
      contractor_id,
      payment_link_url,
      deposit_config,
      deposit_amount,
      options,
      totals,
      created_at,
      signed_at
    `)
    .eq("public_token", token)
    .single();

  if (error || !proposal) {
    return c.json(
      { error: "This proposal link is invalid or has expired." },
      404
    );
  }

  /**
   * IMPORTANT:
   * This response shape MUST match PublicProposalPayload
   * used by useProposal()
   */
  return c.json({
    data: {
      proposal: {
        ...proposal,
        acceptedOption: proposal.accepted_option ?? null,
        paymentLinkUrl: proposal.payment_link_url ?? null,
        depositConfig: proposal.deposit_config ?? null,
      },

      contractor: null,
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

export default shareRouter;
