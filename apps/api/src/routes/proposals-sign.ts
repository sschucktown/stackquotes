import { Hono } from "hono";
import { z } from "zod";
import { getServiceClient } from "../lib/supabase.js";

export const proposalsSignRouter = new Hono();

const bodySchema = z.object({
  proposalId: z.string().uuid(),
  optionKey: z.string(),
  signatureData: z.string(), // base64 PNG from SignaturePad
});

proposalsSignRouter.post("/sign", async (c) => {
  const supabase = getServiceClient();
  const json = await c.req.json();

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return c.json({ error: parsed.error.flatten() }, 400);
  }

  const { proposalId, optionKey, signatureData } = parsed.data;

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
    console.error("Signature update error:", error);
    return c.json({ error: error.message }, 500);
  }

  return c.json({ ok: true });
});
