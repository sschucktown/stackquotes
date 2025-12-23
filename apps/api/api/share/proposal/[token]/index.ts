import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getServiceClient } from "../../../../lib/supabase";

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

  const { data: proposal, error } = await supabase
    .from("smart_proposals")
    .select(`
      id,
      title,
      description,
      status,
      accepted_option,
      deposit_amount,
      payment_link_url,
      signed_at
    `)
    .eq("public_token", token)
    .single();

  if (error || !proposal) {
    return res.status(404).json({ error: "Proposal not found" });
  }

  return res.status(200).json({
    proposal
  });
}
