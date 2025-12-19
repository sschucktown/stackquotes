import { Hono } from "hono";
import type { Context } from "hono";
import { getServiceClient } from "../lib/supabase.js";

export const shareRouter = new Hono();

/* =========================================================
   GET /api/share/proposal/:token
========================================================= */
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
    return c.json({ error: "Proposal not found" }, 404);
  }

  // 🔑 THIS IS THE FIX
  const options = Array.isArray(proposal.line_items)
    ? proposal.line_items
    : [];

  return c.json({
    data: {
      proposal: {
        id: proposal.id,
        title: proposal.title,
        description: proposal.description,
        status: proposal.status,
        publicToken: proposal.public_token,
        options, // ← NOW CORRECT
        depositConfig: proposal.deposit_config ?? null,
      },
    },
  });
});

/* =========================================================
   POST /api/share/proposal/:token/accept
========================================================= */
shareRouter.post("/proposal/:token/accept", async (c: Context) => {
  const token = c.req.param("token");
  const supabase = getServiceClient();

  const { optionName } = await c.req.json<{ optionName?: string }>();

  if (!token || !optionName) {
    return c.json({ error: "Invalid request" }, 400);
  }

  const { data: proposal, error } = await supabase
    .from("smart_proposals")
    .select("*")
    .eq("public_token", token)
    .single();

  if (error || !proposal) {
    return c.json({ error: "Proposal not found" }, 404);
  }

  const options = Array.isArray(proposal.line_items)
    ? proposal.line_items
    : [];

  const selectedOption = options.find((o: any) => o.name === optionName);

  if (!selectedOption) {
    return c.json({ error: "Invalid option selected" }, 400);
  }

  await supabase
    .from("smart_proposals")
    .update({
      status: "accepted",
      accepted_option: optionName,
      accepted_at: new Date().toISOString(),
    })
    .eq("id", proposal.id);

  return c.json({
    data: { status: "accepted" },
  });
});

export default shareRouter;
