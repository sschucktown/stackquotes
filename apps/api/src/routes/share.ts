import { Hono } from "hono";
import type { Context } from "hono";
import { getServiceClient } from "../lib/supabase.js";

/**
 * PUBLIC SHARE ROUTER
 */
export const shareRouter = new Hono();

/**
 * GET /api/share/proposal/:token
 * Public SmartProposal fetch
 */
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

/**
 * POST /api/share/proposal/:token/accept
 * Accept a SmartProposal option
 */
shareRouter.post("/proposal/:token/accept", async (c: Context) => {
  const token = c.req.param("token");
  const body = await c.req.json<{ optionName: string }>();
  const { optionName } = body;

  if (!token || !optionName) {
    return c.json({ error: "Invalid request" }, 400);
  }

  const supabase = getServiceClient();

  const { data: proposal, error } = await supabase
    .from("smart_proposals")
    .select("*")
    .eq("public_token", token)
    .single();

  if (error || !proposal) {
    return c.json({ error: "Proposal not found" }, 404);
  }

  const optionExists = proposal.options?.some(
    (o: any) => o.name === optionName
  );

  if (!optionExists) {
    return c.json({ error: "Invalid option" }, 400);
  }

  const { error: updateError } = await supabase
    .from("smart_proposals")
    .update({
      status: "accepted",
      accepted_option: optionName,
      accepted_at: new Date().toISOString(),
    })
    .eq("id", proposal.id);

  if (updateError) {
    console.error(updateError);
    return c.json({ error: "Failed to accept proposal" }, 500);
  }

  return c.json({
    data: {
      status: "accepted",
      acceptedOption: optionName,
    },
  });
});
