import { Hono } from "hono";
import { initStripe } from "../../lib/stripe.js";
import { requireUser } from "../../lib/auth.js";
import { getServiceClient } from "../../lib/supabase.js";
import {
  getContractorProfile,
  upsertContractorStripeAccount,
} from "@stackquotes/db";
import { getBaseAppUrl, readJsonBody } from "./utils.js";

const deriveOnboardingStatus = (chargesEnabled: boolean, detailsSubmitted: boolean): string => {
  if (chargesEnabled) return "active";
  if (detailsSubmitted) return "pending_review";
  return "pending";
};

export const registerCreateConnectAccountRoute = (router: Hono) => {
  router.post("/create-connect-account", async (c) => {
    const user = await requireUser(c);
    const supabase = getServiceClient();
    const stripe = initStripe();
    const body = await readJsonBody(c);

    const profile = await getContractorProfile(supabase, user.id);
    const fallbackEmail = profile?.email ?? user.email ?? undefined;
    const requestedEmail = typeof body.email === "string" ? body.email : undefined;
    const email = requestedEmail ?? fallbackEmail;

    let accountId = profile?.stripeAccountId ?? null;
    let accountStatus = profile?.stripeAccountStatus ?? "pending";
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email,
        metadata: { userId: user.id },
      });
      accountId = account.id;
      const updated = await upsertContractorStripeAccount(supabase, {
        userId: user.id,
        accountId,
        status: deriveOnboardingStatus(account.charges_enabled, account.details_submitted),
      });
      accountStatus = updated.stripeAccountStatus ?? accountStatus;
    } else if (profile?.stripeAccountStatus) {
      accountStatus = profile.stripeAccountStatus;
    }

    const baseUrl = getBaseAppUrl();
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${baseUrl}/settings/payments?connect=retry`,
      return_url: `${baseUrl}/settings/payments?connect=success`,
      type: "account_onboarding",
    });

    return c.json({
      data: {
        url: link.url,
        accountId,
        status: accountStatus,
      },
    });
  });
};
