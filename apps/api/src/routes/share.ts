import { Hono } from "hono";
import { getServiceClient } from "../lib/supabase.js";

export const shareRouter = new Hono();

/**
 * PUBLIC SMART PROPOSAL
 * URL: /api/share/proposal/:token
 */
shareRouter.get("/proposal/:token", async (c) => {

  // 🔥 ADD THIS LINE (FIRST LINE INSIDE HANDLER)
  console.log("🔥 SHARE ROUTE HIT:", c.req.path);

  const token = c.req.param("token");
  const supabase = getServiceClient();

  const { data: proposal, error } = await supabase
    .from("smart_proposals")
    .select("*")
    .eq("public_token", token)
    .maybeSingle();

  if (!proposal) {
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
