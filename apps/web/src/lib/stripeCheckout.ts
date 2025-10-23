import { loadStripe } from "@stripe/stripe-js";

export async function startCheckout(priceId: string): Promise<void> {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    throw new Error("Stripe publishable key is not configured.");
  }

  const stripe = await loadStripe(publishableKey);
  if (!stripe) {
    throw new Error("Unable to initialize Stripe.");
  }

  const response = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ priceId }),
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

