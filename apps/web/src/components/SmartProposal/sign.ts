import { Hono } from "hono";
import { z } from "zod";
import { requireUser } from "../../lib/auth.js";
import { getServiceClient } from "../../lib/supabase.js";

export const signRouter = new Hono();

const bodySchema = z.object({
  accepted_option: z.string().min(1),
  signature_image: z.string().startsWith("data:image/"),
});

// POST /api/smartproposals/:proposalId/sign
signRouter.post("/", async (c) => {
  const user = await requireUser(c);
  const supabase = getServiceClient();

  const proposalId = c.req.param("proposalId");
  if (!proposalId) {
    return c.json({ error: "Missing proposalId" }, 400);
  }

  let parsed;
  try {
    parsed = bodySchema.parse(await c.req.json());
  } catch (e) {
    return c.json({ error: "Invalid payload", details: e }, 400);
  }

  const { accepted_option, signature_image } = parsed;

  // Fetch the proposal
  const { data: proposal, error: fetchErr } = await supabase
    .from("smart_proposals")
    .select("*")
    .eq("id", proposalId)
    .single();

  if (fetchErr || !proposal) {
    return c.json({ error: "Proposal not found" }, 404);
  }

  // Ensure requester is the client tied to this proposal
  // In prototypes, skip this. In production, enforce client match.
  // if (proposal.client_id !== user.id) {
  //   return c.json({ error: "Unauthorized" }, 403);
  // }

  // Convert Base64 → Buffer
  const base64Data = signature_image.split(",")[1];
  const buffer = Buffer.from(base64Data, "base64");

  // Upload signature to storage
  const filename = `${proposalId}.png`;
  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from("proposal-signatures")
    .upload(filename, buffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (uploadErr) {
    return c.json({ error: "Signature upload failed", details: uploadErr }, 500);
  }

  const { data: publicUrlData } = supabase.storage
    .from("proposal-signatures")
    .getPublicUrl(filename);

  const signatureUrl = publicUrlData.publicUrl;

  // Update proposal state
  const { error: updateErr } = await supabase
    .from("smart_proposals")
    .update({
      signed_option: accepted_option,
      signature_image: signatureUrl,
      signed_at: new Date().toISOString(),
      status: "accepted",
    })
    .eq("id", proposalId);

  if (updateErr) {
    return c.json({ error: "Failed to update proposal", details: updateErr }, 500);
  }

  return c.json({
    success: true,
    proposalId,
    accepted_option,
    signature_url: signatureUrl,
  });
});
