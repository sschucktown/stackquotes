import { Hono } from "hono";
import { getServiceClient } from "../lib/supabase.js";

export const shareRouter = new Hono();

/**
 * GET /api/share/proposal/:token
 * Public, client-safe proposal fetch
 */
shareRouter.get("/proposal/:token", async (c) => {
  const token = c.req.param("token");
  const supabase = getServiceClient();

  if (!token) {
    return c.json({ error: "Invalid proposal link" }, 400);
  }

  const { data, error } = await supabase
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
      created_at,
      signed_at
    `)
    .eq("public_token", token)
    .maybeSingle();

  if (error || !data) {
    return c.json(
      { error: "This proposal link is invalid or has expired." },
      404
    );
  }

  return c.json({
    proposal: data,
  });
});

export default shareRouter;
