import { Hono } from "hono";
import { z } from "zod";
import { initStripe } from "../../lib/stripe.js";
import { requireUser } from "../../lib/auth.js";
import { getServiceClient } from "../../lib/supabase.js";
import { getBaseAppUrl, readJsonBody } from "./utils.js";
import { PRICE_ID_TO_PLAN } from "@stackquotes/config";
import {
  upsertSubscriptionCheckout,
  getStripeCustomerId,
  upsertStripeCustomerId,
} from "@stackquotes/db";

const requestSchema = z.object({
  priceId: z.string().min(1, "priceId is required"),
});

export const registerCheckoutRoute = (router: Hono) => {
  router.post("/checkout", async (c) => {
    const user = await requireUser(c);
    const supabase = getServiceClient();
    const stripe = initStripe();
    const body = await readJsonBody(c);
    const { priceId } = requestSchema.parse(body);

    const planTier = PRICE_ID_TO_PLAN[priceId] ?? "pro";
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
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      metadata: {
        userId: user.id,
        planTier,
        priceId,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planTier,
          priceId,
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
