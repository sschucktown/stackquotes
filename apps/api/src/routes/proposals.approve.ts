// apps/api/src/routes/proposals.approve.ts
import { Hono } from "hono";
import { getServiceClient } from "@/lib/supabase"; // path may vary — adjust if needed

export const proposalsApprove = new Hono();

// POST /api/proposals/:publicToken/approve
proposalsApprove.post("/:publicToken/approve", async (c) => {
  const publicToken = c.req.param("publicToken");
  const body = await c.req.json().catch(() => null);

  if (!body || !body.option || !body.signature) {
    return c.json(
      { error: "Missing option or signature" },
      400
    );
  }

  const supabase = getServiceClient();

  // Find proposal by public_token
  const { data: proposal, error: findErr } = await supabase
    .from("smart_proposals")
    .select("*")
    .eq("public_token", publicToken)
    .maybeSingle();

  if (findErr || !proposal) {
    return c.json({ error: "Proposal not found" }, 404);
  }

  // Update proposal with signed data
  const { error: updateErr } = await supabase
    .from("smart_proposals")
    .update({
      signed_option: body.option,
      signature_image: body.signature, // base64 PNG
      signed_at: new Date().toISOString(),
      status: "accepted",
      updated_at: new Date().toISOString(),
    })
    .eq("id", proposal.id);

  if (updateErr) {
    console.error("Signature update failed:", updateErr);
    return c.json({ error: "Failed to save signature" }, 500);
  }

  return c.json({ success: true, proposalId: proposal.id });
});
