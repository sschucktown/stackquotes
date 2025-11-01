import { loadStripe } from "@stripe/stripe-js";
import { supabase, apiBaseUrl } from "./supabase";

export interface CheckoutOptions {
  planTier?: "pro" | "crew";
  billingInterval?: "monthly" | "yearly";
}

export async function startCheckout(priceIdOrOptions: string | CheckoutOptions): Promise<void> {
  const publishableKey =
    import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? import.meta.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    throw new Error("Stripe publishable key is not configured.");
  }

  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;
  if (!accessToken) {
    throw new Error("You must be signed in to upgrade.");
  }

  const stripe = await loadStripe(publishableKey);
  if (!stripe) {
    throw new Error("Unable to initialize Stripe.");
  }

  const body: Record<string, unknown> =
    typeof priceIdOrOptions === "string"
      ? { priceId: priceIdOrOptions }
      : {
          planTier: priceIdOrOptions.planTier ?? "pro",
          billingInterval: priceIdOrOptions.billingInterval ?? "monthly",
        };

  const response = await fetch(`${apiBaseUrl}/stripe/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || "Failed to create checkout session.");
  }

  const session: { id: string } = await response.json();
  if (!session?.id) {
    throw new Error("Stripe session id missing in response.");
  }

  const { error } = await stripe.redirectToCheckout({ sessionId: session.id });
  if (error) {
    throw new Error(error.message);
  }
}
