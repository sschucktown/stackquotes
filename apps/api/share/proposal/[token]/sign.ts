import { Hono } from "hono";
import { z } from "zod";
import { getServiceClient } from "../../../lib/supabase";

const app = new Hono();

/**
 * POST /api/share/proposal/:token/sign
 * Public signing endpoint (NO AUTH)
 */
app.post("/", async (c) => {
  const supabase = getServiceClient();
  const publicToken = c.req.param("token");

  if (!publicToken) {
    return c.json({ error: "Missing public token" }, 400);
  }

  const bodySchema = z.object({
    accepted_option: z.string().min(1),
    signature_image: z.string().startsWith("data:image/"),
  });

  let body;
  try {
    body = bodySchema.parse(await c.req.json());
  } catch {
    return c.json({ error: "Invalid payload" }, 400);
  }

  const { accepted_option, signature_image } = body;

  // 1️⃣ Load proposal by public token
  const { data: proposal, error } = await supabase
    .from("smart_proposals")
    .select(
      `
        id,
        contractor_id,
        client_id,
        line_items,
        deposit_amount
      `
    )
    .eq("public_token", publicToken)
    .single();

  if (error || !proposal) {
    return c.json({ error: "Proposal not found" }, 404);
  }

  // 2️⃣ Determine approved price
  let approvedPrice = 0;
  try {
    const payload: any = proposal.line_items;
    const options = Array.isArray(payload?.options) ? payload.options : [];

    const match =
      options.find(
        (o: any) =>
          (o?.name ?? "").toLowerCase() === accepted_option.toLowerCase()
      ) || options[0];

    approvedPrice = Number(match?.subtotal ?? 0);
  } catch {
    approvedPrice = 0;
  }

  // 3️⃣ Upload signature
  const base64 = signature_image.split(",")[1];
  const buffer = Buffer.from(base64, "base64");
  const filename = `${proposal.id}.png`;

  const { error: uploadErr } = await supabase.storage
    .from("proposal-signatures")
    .upload(filename, buffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (uploadErr) {
    return c.json({ error: "Signature upload failed" }, 500);
  }

  const { data: urlData } = supabase.storage
    .from("proposal-signatures")
    .getPublicUrl(filename);

  const now = new Date().toISOString();

  // 4️⃣ Update proposal
  await supabase
    .from("smart_proposals")
    .update({
      signed_option: accepted_option,
      signature_image: urlData.publicUrl,
      signed_at: now,
      status: "accepted",
    })
    .eq("id", proposal.id);

  // 5️⃣ Create job
  const { data: job, error: jobErr } = await supabase
    .from("jobs")
    .insert({
      proposal_id: proposal.id,
      contractor_id: proposal.contractor_id,
      client_id: proposal.client_id,
      approved_option: accepted_option,
      approved_price: approvedPrice,
      deposit_amount: proposal.deposit_amount ?? null,
      approved_at: now,
      status: "pending",
    })
    .select()
    .single();

  if (jobErr || !job) {
    return c.json({ error: "Failed to create job" }, 500);
  }

  return c.json({
    success: true,
    job_id: job.id,
  });
});

export default app;
