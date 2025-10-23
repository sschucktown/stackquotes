import { Hono } from "hono";
import Stripe from "stripe";
import { handleWebhookEvent, initStripe } from "../../lib/stripe.js";
import { getServiceClient } from "../../lib/supabase.js";
import {
  getSubscriptionByCheckoutSessionId,
  recordStripePayment,
  updateContractorStripeStatusByAccountId,
  updateSubscriptionStatusRecord,
  upsertStripeCustomerId,
} from "@stackquotes/db";
import type { PaymentType } from "@stackquotes/types";

const toIso = (value: number | null | undefined): string | undefined => {
  if (!value) return undefined;
  return new Date(value * 1000).toISOString();
};

const resolveSubscriptionId = (input: Stripe.Checkout.Session["subscription"]): string | null => {
  if (!input) return null;
  return typeof input === "string" ? input : input.id;
};

const resolvePaymentType = (value: unknown): PaymentType => {
  if (typeof value !== "string") return "deposit";
  const key = value.toLowerCase();
  if (key === "upsell" || key === "installment") {
    return key;
  }
  return "deposit";
};

export const registerStripeWebhookRoute = (router: Hono) => {
  router.post("/webhook", async (c) => {
    const signature = c.req.header("stripe-signature");
    if (!signature) {
      c.status(400);
      return c.json({ error: "Missing Stripe signature header." });
    }

    const payload = await c.req.arrayBuffer();
    const supabase = getServiceClient();
    const stripe = initStripe();

    try {
      const event = await handleWebhookEvent({ payload, signature });
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          if (session.mode !== "subscription") {
            break;
          }
          const subscriptionId = resolveSubscriptionId(session.subscription);
          const record = await getSubscriptionByCheckoutSessionId(supabase, session.id);
          const userId = record?.userId ?? (session.metadata?.userId as string | undefined) ?? null;

          let currentPeriodEnd: string | undefined;
          let status = session.status ?? "active";

          if (subscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            status = subscription.status ?? status;
            currentPeriodEnd = toIso(subscription.current_period_end ?? undefined);
          }

          await updateSubscriptionStatusRecord(supabase, {
            stripeCheckoutSessionId: session.id,
            stripeSubscriptionId: subscriptionId ?? undefined,
            status,
            currentPeriodEnd,
            planTier: (session.metadata?.planTier ?? session.metadata?.plan_tier ?? record?.planTier) as string | null,
          });

          if (userId && typeof session.customer === "string") {
            await upsertStripeCustomerId(supabase, userId, session.customer);
          }
          break;
        }
        case "invoice.paid": {
          const invoice = event.data.object as Stripe.Invoice;
          if (invoice.subscription) {
            await updateSubscriptionStatusRecord(supabase, {
              stripeSubscriptionId:
                typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription.id,
              status: invoice.status ?? "paid",
              currentPeriodEnd: toIso(invoice.lines?.data?.[0]?.period?.end ?? undefined),
            });
          }
          break;
        }
        case "payment_intent.succeeded": {
          const intent = event.data.object as Stripe.PaymentIntent;
          const metadata = intent.metadata ?? {};
          const contractorId = (metadata.contractorId ?? metadata.contractor_id) as string | undefined;
          if (!contractorId) {
            break;
          }
          const proposalId = (metadata.proposalId ?? metadata.proposal_id) as string | undefined;
          const amount = intent.amount_received ?? intent.amount ?? 0;
          await recordStripePayment(supabase, {
            contractorId,
            proposalId: proposalId ?? null,
            stripePaymentIntentId: intent.id,
            amount: amount / 100,
            type: resolvePaymentType(metadata.type),
            status: intent.status ?? "succeeded",
          });
          break;
        }
        case "account.updated": {
          const account = event.data.object as Stripe.Account;
          const status =
            account.charges_enabled && account.payouts_enabled
              ? "active"
              : account.details_submitted
                ? "pending_review"
                : "pending";
          await updateContractorStripeStatusByAccountId(supabase, {
            accountId: account.id,
            status,
          });
          break;
        }
        case "payout.paid": {
          const payout = event.data.object as Stripe.Payout;
          console.log(
            "[stripe] payout paid",
            payout.id,
            "amount:",
            (payout.amount ?? 0) / 100,
            "currency:",
            payout.currency
          );
          break;
        }
        default: {
          console.log("[stripe] webhook received:", event.type);
        }
      }
      return c.json({ received: true });
    } catch (error) {
      console.error("[stripe] webhook error", error);
      c.status(400);
      return c.json({ error: "Webhook signature verification failed." });
    }
  });
};
