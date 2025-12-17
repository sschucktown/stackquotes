import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { token } = req.query;

  if (!token || typeof token !== "string") {
    return res.status(400).json({ error: "Invalid proposal token" });
  }

  const { data, error } = await supabase
    .from("smart_proposals")
    .select(`
      id,
      title,
      description,
      status,
      public_token,
      options,
      deposit_config,
      payment_link_url
    `)
    .eq("public_token", token)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: "Proposal not found" });
  }

  return res.status(200).json({
    proposal: {
      ...data,
      publicToken: data.public_token,
    },
    contractor: null,
    client: null,
    deposit: {
      amount: null,
      config: data.deposit_config,
    },
    paymentLinkUrl: data.payment_link_url,
  });
}
