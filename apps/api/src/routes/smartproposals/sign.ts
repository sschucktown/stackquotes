import { Hono } from "hono";
import type { Context } from "hono";
import { z } from "zod";
import { getServiceClient } from "../../lib/supabase.js";

export const signRouter = new Hono();

/**
 * Expected JSON body:
 * {
 *   public_token: string;
 *   option: string;
 *   signature_image: string; // dataURL
 * }
 */
const signSchema = z.object({
  public_token: z.string().uuid(),
  option: z.string().min(1),
  signature_image: z.string().min(30), // basic length check
});

signRouter.post("/", async (c: Context) => {
  const body = await c.req.json().catch(() => null);
  const parsed = signSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      400
    );
  }

  const { public_token, option, signature_image } = parsed.data;

  const supabase = getServiceClient();

  // 1. Look up proposal via public token
  const { data: proposals, error: lookupErr } = await supabase
    .from("smart_proposals")
    .select("id, status")
    .eq("public_token", public_token)
    .limit(1);

  if (lookupErr) {
    return c.json({ error: lookupErr.message }, 500);
  }

  if (!proposals || proposals.length === 0) {
    return c.json({ error: "Proposal not found" }, 404);
  }

  const proposal = proposals[0];

  // 2. Update the proposal record with signature
  const { error: updateErr } = await supabase
    .from("smart_proposals")
    .update({
      signed_option: option,
      signature_image: signature_image,
      signed_at: new Date().toISOString(),
      status: "accepted",
    })
    .eq("id", proposal.id);

  if (updateErr) {
    return c.json({ error: updateErr.message }, 500);
  }

  return c.json({
    success: true,
    proposal_id: proposal.id,
    message: "Signature stored successfully.",
  });
});
