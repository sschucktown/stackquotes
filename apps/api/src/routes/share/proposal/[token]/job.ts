import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getServiceClient } from "../../../../../lib/supabase";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.query.token;

  if (!token || typeof token !== "string") {
    return res.status(400).json({ error: "Missing proposal token" });
  }

  const supabase = getServiceClient();

  // 1️⃣ Find proposal by public token
  const { data: proposal, error: proposalErr } = await supabase
    .from("smart_proposals")
    .select("id")
    .eq("public_token", token)
    .single();

  if (proposalErr || !proposal) {
    return res.status(404).json({ error: "Proposal not found" });
  }

  // 2️⃣ Find job linked to proposal
  const { data: job, error: jobErr } = await supabase
    .from("jobs")
    .select("id, deposit_amount, payment_link_url")
    .eq("proposal_id", proposal.id)
    .single();

  if (jobErr || !job) {
    return res.status(404).json({ error: "Job not found" });
  }

  // 3️⃣ Success
  return res.status(200).json({
    id: job.id,
    deposit_amount: job.deposit_amount ?? 0,
    payment_link_url: job.payment_link_url,
  });
}
