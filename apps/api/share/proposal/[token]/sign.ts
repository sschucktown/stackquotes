import { Hono } from "hono";
import { z } from "zod";
import { getServiceClient } from "../../../lib/supabase";

export const signRouter = new Hono();

const bodySchema = z.object({
  accepted_option: z.string().min(1),
  signature_image: z.string().startsWith("data:image/"),
});

signRouter.post("/", async (c) => {
  const supabase = getServiceClient();
  const token = c.req.param("token");

  if (!token) {
    return c.json({ error: "Missing token" }, 400);
  }

  let parsed;
  try {
    parsed = bodySchema.parse(await c.req.json());
  } catch {
    return c.json({ error: "Invalid payload" }, 400);
  }

  const { accepted_option, signature_image } = parsed;

  /* --------------------------------------------------
     1️⃣ Fetch proposal by public token
  -------------------------------------------------- */
  const { data: proposal, error } = await supabase
    .from("smart_proposals")
    .select("*")
    .eq("public_token", token)
    .single();

  if (error || !proposal) {
    return c.json({ error: "Proposal not found" }, 404);
  }

  /* --------------------------------------------------
     2️⃣ Upload signature
  -------------------------------------------------- */
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

  const { data: publicUrl } = supabase.storage
    .from("proposal-signatures")
    .getPublicUrl(filename);

  const now = new Date().toISOString();

  /* --------------------------------------------------
     3️⃣ Create job
  -------------------------------------------------- */
  const { data: job, error: jobErr } = await supabase
    .from("jobs")
    .insert({
      proposal_id: proposal.id,
      contractor_id: proposal.contractor_id,
      client_id: proposal.client_id,
      approved_option: accepted_option,
      approved_price: 0,
      deposit_amount: proposal.deposit_amount,
      status: "pending",
    })
    .select()
    .single();

  if (jobErr || !job) {
    return c.json({ error: "Job creation failed" }, 500);
  }

  /* --------------------------------------------------
     4️⃣ Update proposal
  -------------------------------------------------- */
  await supabase
    .from("smart_proposals")
    .update({
      signed_option: accepted_option,
      signature_image: publicUrl.publicUrl,
      signed_at: now,
      status: "accepted",
      job_id: job.id,
    })
    .eq("id", proposal.id);

  return c.json({
    success: true,
    job_id: job.id,
  });
});
