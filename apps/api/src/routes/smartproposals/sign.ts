import { Hono } from "hono";
import { z } from "zod";
import { getServiceClient } from "../../lib/supabase.js";
import { requireUser } from "../../lib/auth.js";

export const signRouter = new Hono();

/**
 * Body:
 * - accepted_option: which option (e.g. "good" | "better" | "best")
 * - signature_image: data URL (data:image/png;base64,...)
 */
const bodySchema = z.object({
  accepted_option: z.string().min(1),
  signature_image: z.string().startsWith("data:image/"),
});

/**
 * Helper: find the approved option in SmartProposal line_items JSON
 * We favor:
 * - key match (e.g. "good" / "better" / "best")
 * - name match
 * - "better" fallback
 * - first option
 */
const resolveApprovedOption = (proposal: any, acceptedOption: string) => {
  const payload = proposal.line_items as any;
  const options = Array.isArray(payload?.options) ? payload.options : [];
  const target = acceptedOption.toLowerCase().trim();

  if (!options.length) {
    return {
      approvedPrice: 0,
      approvedLabel: acceptedOption,
    };
  }

  const byKey =
    options.find(
      (o: any) => (o?.key ?? "").toString().toLowerCase().trim() === target
    ) ?? null;

  const byName =
    options.find(
      (o: any) => (o?.name ?? "").toString().toLowerCase().trim() === target
    ) ?? null;

  const betterFallback =
    options.find(
      (o: any) =>
        (o?.name ?? "").toString().toLowerCase().trim() === "better"
    ) ?? null;

  const chosen = byKey || byName || betterFallback || options[0];

  const subtotal = Number(chosen?.subtotal ?? 0);
  const label =
    (chosen?.name as string | undefined) ??
    (chosen?.label as string | undefined) ??
    acceptedOption;

  return {
    approvedPrice: Number.isFinite(subtotal) ? subtotal : 0,
    approvedLabel: label,
  };
};

// POST /api/smartproposals/:proposalId/sign
signRouter.post("/", async (c) => {
  const user = await requireUser(c);
  const supabase = getServiceClient();

  const proposalId = c.req.param("proposalId");
  if (!proposalId) {
    return c.json({ error: "Missing proposalId" }, 400);
  }

  // Parse body
  let parsed;
  try {
    parsed = bodySchema.parse(await c.req.json());
  } catch (e) {
    return c.json({ error: "Invalid payload", details: e }, 400);
  }

  const { accepted_option, signature_image } = parsed;

  // Fetch SmartProposal (and ensure it belongs to this contractor)
  const { data: proposal, error: fetchErr } = await supabase
    .from("smart_proposals")
    .select("*")
    .eq("id", proposalId)
    .eq("contractor_id", user.id)
    .single();

  if (fetchErr || !proposal) {
    return c.json({ error: "Proposal not found" }, 404);
  }

  // Resolve approved price & label from line_items
  const { approvedPrice, approvedLabel } = resolveApprovedOption(
    proposal,
    accepted_option
  );

  const depositAmount = Number(proposal.deposit_amount ?? 0);

  // Convert Base64 → Buffer
  const base64Data = signature_image.split(",")[1];
  let buffer: Buffer;
  try {
    buffer = Buffer.from(base64Data, "base64");
  } catch {
    return c.json({ error: "Invalid signature image encoding" }, 400);
  }

  // Upload signature to storage
  const filename = `${proposalId}.png`;
  const { data: uploadData, error: uploadErr } = await supabase.storage
    .from("proposal-signatures")
    .upload(filename, buffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (uploadErr) {
    return c.json(
      { error: "Signature upload failed", details: uploadErr },
      500
    );
  }

  const { data: publicUrlData } = supabase.storage
    .from("proposal-signatures")
    .getPublicUrl(filename);

  const signatureUrl = publicUrlData.publicUrl;
  const signedAt = new Date().toISOString();

  // Create Job row linked to this proposal
  const { data: job, error: jobErr } = await supabase
    .from("jobs")
    .insert({
      proposal_id: proposal.id,
      contractor_id: user.id,
      client_id: proposal.client_id,
      approved_option: approvedLabel,
      approved_price: approvedPrice,
      deposit_amount: depositAmount || null,
      status: "pending",
    })
    .select()
    .single();

  if (jobErr || !job) {
    return c.json({ error: "Failed to create job", details: jobErr }, 500);
  }

  // Update SmartProposal with signature + linkage to job
  const { error: updateErr } = await supabase
    .from("smart_proposals")
    .update({
      accepted_option: approvedLabel,
      signature_image: signatureUrl,
      signed_at: signedAt,
      status: "accepted",
      job_id: job.id,
    })
    .eq("id", proposalId)
    .eq("contractor_id", user.id);

  if (updateErr) {
    return c.json(
      {
        error: "Failed to update proposal with signature",
        details: updateErr,
      },
      500
    );
  }

  return c.json({
    success: true,
    proposal_id: proposalId,
    job_id: job.id,
    accepted_option: approvedLabel,
    approved_price: approvedPrice,
    deposit_amount: depositAmount || 0,
    signature_url: signatureUrl,
    signed_at: signedAt,
  });
});
