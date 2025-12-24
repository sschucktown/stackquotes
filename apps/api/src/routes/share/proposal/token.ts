import { Hono } from "hono";
import { getServiceClient } from "../../../../lib/supabase";

export const proposalTokenRouter = new Hono();

/**
 * GET /api/share/proposal/:token
 */
proposalTokenRouter.get("/", async (c) => {
  const token = c.req.param("token");
  const supabase = getServiceClient();

  if (!token) {
    return c.json({ error: "Missing proposal token" }, 400);
  }

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

export default proposalTokenRouter;
