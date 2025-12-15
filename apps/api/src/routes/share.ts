import { Hono } from "hono";
import { getServiceClient } from "../lib/supabase.js";

export const shareRouter = new Hono();

/**
 * PUBLIC SMART PROPOSAL
 * URL: /api/share/proposal/:token
 */
shareRouter.get("/proposal/:token", async (c) => {
  console.log("🔥 SHARE ROUTE HIT:", c.req.path);

  const token = c.req.param("token");
  const supabase = getServiceClient();

  const { data: proposal, error } = await supabase
    .from("smart_proposals")
    .select("*")
    .eq("public_token", token)
    .maybeSingle();

  if (error || !proposal) {
    return c.json(
      { error: "This proposal link is invalid or has expired." },
      404
    );
  }

  // 🔑 SHAPE MATCHES useProposal EXPECTATION
  return c.json({
    data: {
      proposal,
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
