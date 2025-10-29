import { Hono } from "hono";
import { z } from "zod";
import { initStripe } from "../../lib/stripe.js";
import { requireUser } from "../../lib/auth.js";
import { getServiceClient } from "../../lib/supabase.js";
import { getBaseAppUrl, readJsonBody } from "./utils.js";
import { loadServerConfig } from "@stackquotes/config";
import {
  upsertSubscriptionCheckout,
  getStripeCustomerId,
  upsertStripeCustomerId,
} from "@stackquotes/db";

const requestSchema = z.object({
  priceId: z.string().min(1, "priceId is required").optional(),
  planTier: z.enum(["free", "pro", "team"]).optional(),
});

export const registerCheckoutRoute = (router: Hono) => {
  router.post("/checkout", async (c) => {
    const user = await requireUser(c);
    const supabase = getServiceClient();
    const stripe = initStripe();
    const body = await readJsonBody(c);
    const parsed = requestSchema.parse(body);

    const config = loadServerConfig();
    const envPrices: Record<string, string | undefined> = {
      pro: process.env.STRIPE_PRICE_PRO || config.PRO_PRICE_ID,
      team: process.env.STRIPE_PRICE_TEAM,
    };

    // Figure out requested plan tier (default to pro)
    let planTier: "free" | "pro" | "team" = "pro";
    if (parsed.planTier && ["free", "pro", "team"].includes(parsed.planTier)) {
      planTier = parsed.planTier as typeof planTier;
    } else if (parsed.priceId) {
      if (parsed.priceId === envPrices.pro) planTier = "pro";
      else if (parsed.priceId === envPrices.team) planTier = "team";
    }

    // Always use server-configured price IDs; do not trust client
    const priceToUse = planTier === "team" ? envPrices.team : envPrices.pro;
    if (!priceToUse) {
      c.status(500);
      return c.json({ error: `Stripe price id for plan '${planTier}' is not configured on the server.` });
    }
    let customerId = await getStripeCustomerId(supabase, user.id);
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await upsertStripeCustomerId(supabase, user.id, customerId);
    }

    const baseUrl = getBaseAppUrl();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceToUse, quantity: 1 }],
      success_url: `${baseUrl}/dashboard?upgraded=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing?plan=${planTier}`,
      metadata: {
        userId: user.id,
        planTier,
        priceId: priceToUse,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planTier,
          priceId: priceToUse,
        },
      },
    });

    await upsertSubscriptionCheckout(supabase, {
      userId: user.id,
      planTier,
      stripeCheckoutSessionId: session.id,
      status: session.status ?? "open",
      stripeSubscriptionId:
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id ?? null,
    });

    return c.json({ id: session.id });
  });
};
