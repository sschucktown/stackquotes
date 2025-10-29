import { Hono } from "hono";
import type { Context } from "hono";
import { initStripe } from "../../lib/stripe.js";
import { requireUser } from "../../lib/auth.js";
import { getServiceClient } from "../../lib/supabase.js";
import {
  getStripeCustomerId,
  upsertStripeCustomerId,
  upsertSubscriptionCheckout,
} from "@stackquotes/db";
import { getBaseAppUrl, readJsonBody } from "./utils.js";

const PLAN_DETAILS = {
  starter: { amount: 49, name: "Starter" },
  pro: { amount: 99, name: "Pro" },
  team: { amount: 149, name: "Team" },
} as const;

type PlanTier = keyof typeof PLAN_DETAILS;

const normalisePlanTier = (value: unknown): PlanTier | null => {
  if (typeof value !== "string") return null;
  const key = value.trim().toLowerCase();
  return key in PLAN_DETAILS ? (key as PlanTier) : null;
};

const resolvePlanTier = async (c: Context): Promise<PlanTier> => {
  const queryPlan = c.req.query("plan_tier") ?? c.req.query("planTier") ?? null;
  const body = await readJsonBody(c);
  const bodyPlan = body.plan_tier ?? body.planTier;
  const planTier = normalisePlanTier(bodyPlan ?? queryPlan);
  return planTier ?? "starter";
};

export const registerCreateCheckoutSessionRoute = (router: Hono) => {
  router.post("/create-checkout-session", async (c) => {
    const user = await requireUser(c);
    const planTier = await resolvePlanTier(c);
    const plan = PLAN_DETAILS[planTier];
    if (!plan) {
      c.status(400);
      return c.json({ error: "Unsupported plan tier requested." });
    }

    const supabase = getServiceClient();
    const stripe = initStripe();

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
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `StackQuotes ${plan.name} Plan`,
            },
            recurring: { interval: "month" },
            unit_amount: plan.amount * 100,
          },
          quantity: 1,
        },
      ],
      allow_promotion_codes: true,
      metadata: {
        userId: user.id,
        planTier,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planTier,
        },
      },
      success_url: `${baseUrl}/dashboard?upgraded=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing?plan=${planTier}`,
    });

    if (!session.url) {
      c.status(500);
      return c.json({ error: "Stripe did not return a redirect URL." });
    }

    await upsertSubscriptionCheckout(supabase, {
      userId: user.id,
      planTier,
      stripeCheckoutSessionId: session.id,
      status: session.status ?? "pending",
      stripeSubscriptionId:
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription?.id ?? null,
    });

    return c.json({
      data: {
        url: session.url,
        id: session.id,
      },
    });
  });
};
