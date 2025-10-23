import { Hono } from "hono";
import { z } from "zod";
import Stripe from "stripe";
import { loadServerConfig } from "@stackquotes/config";
import { initStripe } from "../../lib/stripe.js";
import { requireUser } from "../../lib/auth.js";
import { getServiceClient } from "../../lib/supabase.js";

const requestSchema = z.object({
  user_id: z.string().uuid(),
  payment_method_id: z.string().min(1, "payment_method_id is required"),
});

const isTestSubscriptionEnabled = (config: ReturnType<typeof loadServerConfig>) => {
  const flag = config.FORCE_REQUIRE_CC_FOR_TEST?.toLowerCase() === "true";
  const isTestKey = (config.STRIPE_SECRET_KEY ?? "").startsWith("sk_test_");
  return flag && isTestKey;
};

export const registerCreateSubscriptionTestRoute = (router: Hono) => {
  router.post("/create-subscription-test", async (c) => {
    const authUser = await requireUser(c);
    const payload = requestSchema.parse(await c.req.json());

    if (authUser.id !== payload.user_id) {
      c.status(403);
      return c.json({ error: "Forbidden" });
    }

    const config = loadServerConfig();
    if (!isTestSubscriptionEnabled(config)) {
      c.status(403);
      return c.json({ error: "Test subscription flow is disabled." });
    }

    if (!config.PRO_PRICE_ID) {
      c.status(500);
      return c.json({ error: "PRO_PRICE_ID is not configured." });
    }

    const supabase = getServiceClient();

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, stripe_customer_id, stripe_subscription_id, subscription_tier")
      .eq("id", payload.user_id)
      .maybeSingle();

    if (profileError) {
      console.error("[stripe] failed to load profile", profileError);
      c.status(500);
      return c.json({ error: "Failed to load profile." });
    }

    if (!profile) {
      c.status(404);
      return c.json({ error: "Profile not found." });
    }

    const stripe = initStripe();

    try {
      let customerId = profile.stripe_customer_id ?? null;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: profile.email ?? authUser.email ?? undefined,
          metadata: { user_id: payload.user_id },
        });
        customerId = customer.id;
        const { error } = await supabase
          .from("profiles")
          .update({ stripe_customer_id: customerId })
          .eq("id", payload.user_id);
        if (error) {
          console.error("[stripe] failed to persist stripe_customer_id", error);
        }
      }

      await stripe.paymentMethods.attach(payload.payment_method_id, {
        customer: customerId,
      });

      await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: payload.payment_method_id },
      });

      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: config.PRO_PRICE_ID }],
        payment_behavior: "default_incomplete",
        expand: ["latest_invoice.payment_intent"],
        metadata: { user_id: payload.user_id },
      });

      const latestInvoice = subscription.latest_invoice as Stripe.Invoice | null;
      const paymentIntent = latestInvoice?.payment_intent as Stripe.PaymentIntent | null;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          stripe_subscription_id: subscription.id,
          stripe_customer_id: customerId,
        })
        .eq("id", payload.user_id);
      if (updateError) {
        console.error("[stripe] failed to update profile with subscription id", updateError);
      }

      return c.json({
        client_secret: paymentIntent?.client_secret ?? null,
        subscriptionId: subscription.id,
        customerId,
      });
    } catch (error) {
      console.error("[stripe] create-subscription-test failed", error);
      c.status(500);
      return c.json({ error: (error as Error).message ?? "Stripe error creating subscription." });
    }
  });
};

