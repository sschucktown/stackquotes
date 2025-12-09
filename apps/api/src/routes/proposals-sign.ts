import { Hono } from "hono";
import { z } from "zod";
import { getServiceClient } from "../lib/supabase.js";

export const proposalsSignRouter = new Hono();

const signBodySchema = z.object({
  proposalId: z.string().uuid(),
  optionKey: z.string().min(1),
  signatureData: z.string().min(1), // base64 data URL
});

proposalsSignRouter.post("/sign", async (c) => {
  const supabase = getServiceClient();

  let body: unknown;
  try {
    body = await c.req.json();
  } catch (err) {
    console.error("[proposals/sign] invalid JSON body", err);
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const parseResult = signBodySchema.safeParse(body);
  if (!parseResult.success) {
    console.error("[proposals/sign] validation failed", parseResult.error.flatten());
    return c.json({ error: "Invalid payload", details: parseResult.error.flatten() }, 400);
  }

  const { proposalId, optionKey, signatureData } = parseResult.data;

  // Update the smart_proposals row
  const { error } = await supabase
    .from("smart_proposals")
    .update({
      signed_option: optionKey,
      signature_image: signatureData,
      signed_at: new Date().toISOString(),
      status: "accepted",
    })
    .eq("id", proposalId)
    .single();

  if (error) {
    console.error("[proposals/sign] supabase update failed", error);
    return c.json({ error: "Failed to save signature" }, 500);
  }

  return c.json({ success: true });
});
