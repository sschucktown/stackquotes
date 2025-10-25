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
  setUserSubscriptionTier,
} from "@stackquotes/db";
import type { PaymentType, SubscriptionPlanTier } from "@stackquotes/types";
import { PRICE_ID_TO_PLAN } from "@stackquotes/config";

const PLAN_TIER_VALUES: SubscriptionPlanTier[] = ["free", "starter", "pro", "team"];
const PLAN_TIER_SET = new Set<SubscriptionPlanTier>(PLAN_TIER_VALUES);

const parsePlanTier = (value: unknown): SubscriptionPlanTier | null => {
  if (typeof value !== "string") return null;
  const normalised = value.toLowerCase();
  return PLAN_TIER_SET.has(normalised as SubscriptionPlanTier)
    ? (normalised as SubscriptionPlanTier)
    : null;
};

const planFromPriceId = (priceId: unknown): SubscriptionPlanTier | null => {
  if (typeof priceId !== "string") return null;
  const mapped = PRICE_ID_TO_PLAN[priceId];
  return mapped ? (mapped as SubscriptionPlanTier) : null;
};

const updateProfile = async (
  supabase: ReturnType<typeof getServiceClient>,
  userId: string | null,
  updates: Record<string, unknown>
) => {
  if (!userId) return;
  const { error } = await supabase.from("profiles").update(updates).eq("id", userId);
  if (error) {
    console.error("[stripe] failed to update profile", updates, error);
  }
};

const findProfileIdByCustomer = async (
  supabase: ReturnType<typeof getServiceClient>,
  customerId: string | null | undefined
): Promise<string | null> => {
  if (!customerId) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  if (error) {
    console.error("[stripe] failed to find profile by customer id", customerId, error);
    return null;
  }
  return (data as { id: string } | null)?.id ?? null;
};

const findProfileIdBySubscription = async (
  supabase: ReturnType<typeof getServiceClient>,
  subscriptionId: string | null | undefined
): Promise<string | null> => {
  if (!subscriptionId) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("stripe_subscription_id", subscriptionId)
    .maybeSingle();
  if (error) {
    console.error("[stripe] failed to find profile by subscription id", subscriptionId, error);
    return null;
  }
  return (data as { id: string } | null)?.id ?? null;
};

const findUserIdByAccount = async (
  supabase: ReturnType<typeof getServiceClient>,
  accountId: string | null | undefined
): Promise<string | null> => {
  if (!accountId) return null;
  const { data, error } = await supabase
    .from("contractor_profiles")
    .select("user_id")
    .eq("stripe_account_id", accountId)
    .maybeSingle();
  if (error) {
    console.error("[stripe] failed to find user by account id", accountId, error);
    return null;
  }
  return (data as { user_id: string } | null)?.user_id ?? null;
};

const upsertUserMetadata = async (
  supabase: ReturnType<typeof getServiceClient>,
  userId: string | null,
  updates: Record<string, unknown>
) => {
  if (!userId) return;
  const payload = { id: userId, ...updates };
  const { error } = await supabase.from("users").upsert(payload, { onConflict: "id" });
  if (error) {
    console.error("[stripe] failed to upsert user metadata", updates, error);
  }
};

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

const recordCapitalEvent = async (
  supabase: ReturnType<typeof getServiceClient>,
  accountId: string | null | undefined,
  kind: "offer" | "loan_funded",
  payload: Record<string, unknown>
) => {
  const userId = await findUserIdByAccount(supabase, accountId ?? null);
  const amountCents = (() => {
    const amount = payload.financing_amount ?? payload.amount ?? payload.eligible_amount ?? payload.amount_cents;
    return typeof amount === "number" ? amount : null;
  })();
  const metadata = {
    id: payload.id,
    currency: payload.currency,
    status: payload.status,
  };
  const { error } = await supabase.from("financing_events").insert({
    user_id: userId,
    provider: "stripe_capital",
    kind,
    amount_cents: amountCents,
    metadata,
  });
  if (error) {
    console.error("[stripe] failed to insert financing event", kind, error);
  }
};

const upsertAddonFlag = async (
  supabase: ReturnType<typeof getServiceClient>,
  userId: string | null,
  addonKey: string | null | undefined
) => {
  if (!userId || !addonKey) return;
  const { data, error } = await supabase
    .from("users")
    .select("addons")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    console.error("[stripe] failed to load addons for merge", error);
    return;
  }
  const currentAddons = ((data?.addons as Record<string, unknown>) ?? {}) as Record<string, unknown>;
  if (currentAddons[addonKey] === true) {
    return;
  }
  const nextAddons = { ...currentAddons, [addonKey]: true };
  const { error: updateError } = await supabase
    .from("users")
    .upsert(
      {
        id: userId,
        addons: nextAddons,
      },
      { onConflict: "id" }
    );
  if (updateError) {
    console.error("[stripe] failed to persist addon flag", userId, addonKey, updateError);
  }
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
          const addonKey = (session.metadata?.addonKey ?? session.metadata?.addon_key) as
            | string
            | undefined;
          const sessionCustomerId =
            typeof session.customer === "string"
              ? session.customer
              : session.customer?.id ?? null;
          if (addonKey) {
            let addonUserId =
              (session.metadata?.userId as string | undefined) ?? null;
            if (!addonUserId) {
              addonUserId = await findProfileIdByCustomer(supabase, sessionCustomerId);
            }
            await upsertAddonFlag(supabase, addonUserId, addonKey);
            break;
          }
          if (session.mode !== "subscription") {
            break;
          }
          const subscriptionId = resolveSubscriptionId(session.subscription);
          const record = await getSubscriptionByCheckoutSessionId(supabase, session.id);
          const userId = record?.userId ?? (session.metadata?.userId as string | undefined) ?? null;
          const customerId = typeof session.customer === "string" ? session.customer : null;

          let currentPeriodEnd: string | undefined;
          let status = session.status ?? "active";
          let planTier =
            parsePlanTier(session.metadata?.planTier ?? session.metadata?.plan_tier) ??
            planFromPriceId(session.metadata?.priceId ?? null) ??
            parsePlanTier(record?.planTier ?? null);

          if (subscriptionId) {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            status = subscription.status ?? status;
            currentPeriodEnd = toIso(subscription.current_period_end ?? undefined);
            if (!planTier) {
              const subscriptionPrice = subscription.items?.data?.[0]?.price?.id ?? null;
              planTier = planFromPriceId(subscriptionPrice);
            }
          }

          const updatedRecord = await updateSubscriptionStatusRecord(supabase, {
            stripeCheckoutSessionId: session.id,
            stripeSubscriptionId: subscriptionId ?? undefined,
            status,
            currentPeriodEnd,
            planTier: planTier ?? record?.planTier ?? null,
          });

          const tierToPersist =
            parsePlanTier(updatedRecord?.planTier ?? null) ?? parsePlanTier(planTier ?? null);

          if (userId) {
            if (customerId) {
              await upsertStripeCustomerId(supabase, userId, customerId);
            }
            if (tierToPersist) {
              await setUserSubscriptionTier(supabase, userId, tierToPersist);
            }
            const profileUpdates: Record<string, unknown> = {
              stripe_subscription_id: subscriptionId ?? null,
            };
            if (customerId) {
              profileUpdates.stripe_customer_id = customerId;
            }
            if (tierToPersist) {
              profileUpdates.subscription_tier = tierToPersist;
            }
            await updateProfile(supabase, userId, profileUpdates);
          }
          break;
        }
        case "invoice.paid": {
          const invoice = event.data.object as Stripe.Invoice;
          if (invoice.subscription) {
            const priceId = invoice.lines?.data?.[0]?.price?.id ?? null;
            const updatedRecord = await updateSubscriptionStatusRecord(supabase, {
              stripeSubscriptionId:
                typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription.id,
              status: invoice.status ?? "paid",
              currentPeriodEnd: toIso(invoice.lines?.data?.[0]?.period?.end ?? undefined),
              planTier: planFromPriceId(priceId) ?? null,
            });
            const invoiceCustomerId =
              typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id ?? null;
            let subscriptionUserId = updatedRecord?.userId ?? null;
            if (!subscriptionUserId) {
              subscriptionUserId = await findProfileIdByCustomer(supabase, invoiceCustomerId);
            }
            const tierToPersist =
              parsePlanTier(updatedRecord?.planTier ?? null) ?? planFromPriceId(priceId);
            if (subscriptionUserId && tierToPersist) {
              await setUserSubscriptionTier(supabase, subscriptionUserId, tierToPersist);
            }
            if (subscriptionUserId) {
              const profileUpdates: Record<string, unknown> = {
                stripe_subscription_id:
                  typeof invoice.subscription === "string"
                    ? invoice.subscription
                    : invoice.subscription.id,
              };
              if (invoiceCustomerId) {
                profileUpdates.stripe_customer_id = invoiceCustomerId;
              }
              if (tierToPersist) {
                profileUpdates.subscription_tier = tierToPersist;
              }
              await updateProfile(supabase, subscriptionUserId, profileUpdates);
            }
          }
          break;
        }
        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          const subscriptionId = subscription.id;
          const customerId =
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer?.id ?? null;
          let subscriptionUserId =
            (subscription.metadata?.user_id as string | undefined) ?? null;
          if (!subscriptionUserId) {
            subscriptionUserId = await findProfileIdBySubscription(supabase, subscriptionId);
          }
          if (!subscriptionUserId) {
            subscriptionUserId = await findProfileIdByCustomer(supabase, customerId);
          }
          if (subscriptionUserId) {
            await setUserSubscriptionTier(supabase, subscriptionUserId, "free");
            await updateProfile(supabase, subscriptionUserId, {
              subscription_tier: "free",
              stripe_subscription_id: null,
            });
          }
          break;
        }
        case "customer.subscription.trial_will_end": {
          const subscription = event.data.object as Stripe.Subscription;
          const subscriptionId = subscription.id;
          const customerId =
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer?.id ?? null;
          let subscriptionUserId =
            (subscription.metadata?.user_id as string | undefined) ?? null;
          if (!subscriptionUserId) {
            subscriptionUserId = await findProfileIdBySubscription(supabase, subscriptionId);
          }
          if (!subscriptionUserId) {
            subscriptionUserId = await findProfileIdByCustomer(supabase, customerId);
          }
          if (subscriptionUserId) {
            const trialEnd = toIso(subscription.trial_end ?? undefined);
            await upsertUserMetadata(supabase, subscriptionUserId, {
              trial_end: trialEnd ?? null,
              subscription_tier: "pro",
              is_active: true,
            });
            await updateProfile(supabase, subscriptionUserId, {
              subscription_tier: "pro",
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
          const feePercentRaw = metadata.feePercent ?? metadata.fee_percent;
          const isMilestoneRaw = metadata.isMilestone ?? metadata.is_milestone;
          const isFinancedRaw = metadata.isFinanced ?? metadata.is_financed;
          const toBool = (value: unknown): boolean => {
            if (typeof value === "boolean") return value;
            if (typeof value === "string") return value.toLowerCase() === "true";
            if (typeof value === "number") return value === 1;
            return false;
          };
          const toNumber = (value: unknown): number | null => {
            if (typeof value === "number") return value;
            if (typeof value === "string") {
              const parsed = Number(value);
              return Number.isFinite(parsed) ? parsed : null;
            }
            return null;
          };
          await recordStripePayment(supabase, {
            contractorId,
            proposalId: proposalId ?? null,
            stripePaymentIntentId: intent.id,
            amount: amount / 100,
            type: resolvePaymentType(metadata.type),
            status: intent.status ?? "succeeded",
            feePercent: toNumber(feePercentRaw),
            isMilestone: toBool(isMilestoneRaw),
            isFinanced: toBool(isFinancedRaw),
            paymentStatus: intent.status ?? "succeeded",
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
        case "capital.offer.created": {
          const offer = event.data.object as Stripe.Event.Data.Object & Record<string, unknown>;
          const accountId =
            typeof (offer as { account?: string }).account === "string"
              ? (offer as { account: string }).account
              : null;
          await recordCapitalEvent(supabase, accountId, "offer", {
            id: offer.id as string | undefined,
            currency: offer.currency ?? null,
            status: offer.status ?? null,
            eligible_amount: (offer as { eligible_amount?: number }).eligible_amount ?? null,
          });
          break;
        }
        case "capital.financing.created": {
          const financing = event.data.object as Stripe.Event.Data.Object & Record<string, unknown>;
          const accountId =
            typeof (financing as { account?: string }).account === "string"
              ? (financing as { account: string }).account
              : null;
          await recordCapitalEvent(supabase, accountId, "loan_funded", {
            id: financing.id as string | undefined,
            currency: financing.currency ?? null,
            status: financing.status ?? null,
            financing_amount: (financing as { financing_amount?: number }).financing_amount ?? null,
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
