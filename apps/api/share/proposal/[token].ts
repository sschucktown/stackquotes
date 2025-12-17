import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client (SERVICE ROLE)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid proposal id" });
  }

  const { data, error } = await supabase
    .from("smart_proposals")
    .select(`
      id,
      status,
      public_token,
      signed_option,
      title,
      description,
      payment_link_url,
      deposit_config,
      line_items,
      contractor:contractor_id (
        business_name,
        logo_url,
        accent_color,
        email
      ),
      client:client_id (
        id,
        name,
        email
      )
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("[share/proposal] fetch error:", error);
    return res.status(404).json({ error: "Proposal not found" });
  }

  // Supabase joins ALWAYS return arrays
  const contractor = Array.isArray(data.contractor)
    ? data.contractor[0]
    : null;

  const client = Array.isArray(data.client)
    ? data.client[0]
    : null;

  return res.status(200).json({
    proposal: {
      id: data.id,
      publicToken: data.public_token,
      status: data.status,
      title: data.title,
      description: data.description,
      signedOption: data.signed_option ?? null,
      options: data.line_items?.options ?? [],
      depositConfig: data.deposit_config ?? null,
    },

    contractor: contractor
      ? {
          businessName: contractor.business_name,
          logoUrl: contractor.logo_url,
          accentColor: contractor.accent_color,
          email: contractor.email,
        }
      : null,

    client: client ?? null,

    deposit: {
      amount: null,
      config: data.deposit_config ?? null,
    },

    paymentLinkUrl: data.payment_link_url ?? null,
  });
}
