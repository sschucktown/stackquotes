import { Hono } from "hono";
import { getServiceClient } from "../lib/supabase.js";

export const shareProposalRouter = new Hono();

/**
 * GET /api/share/proposal/:token
 * Public SmartProposal access (TOKEN-BASED)
 */
shareProposalRouter.get("/proposal/:token", async (c) => {
  const supabase = getServiceClient();
  const token = c.req.param("token");

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
    },
  });
});

export default shareProposalRouter;
