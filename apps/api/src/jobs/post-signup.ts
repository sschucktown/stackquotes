import { initStripe } from "../lib/stripe.js";
import { getServiceClient } from "../lib/supabase.js";
import { getContractorProfile, upsertContractorStripeAccount } from "@stackquotes/db";

const deriveOnboardingStatus = (chargesEnabled: boolean, detailsSubmitted: boolean): string => {
  if (chargesEnabled) return "active";
  if (detailsSubmitted) return "pending_review";
  return "pending";
};

export interface PostSignupPayload {
  userId: string;
  email?: string | null;
}

export interface PostSignupResult {
  accountId: string | null;
  onboardingRequired: boolean;
}

export const provisionContractorPostSignup = async (
  payload: PostSignupPayload
): Promise<PostSignupResult> => {
  const { userId, email } = payload;
  const supabase = getServiceClient();
  const stripe = initStripe();

  const profile = await getContractorProfile(supabase, userId);
  const existingAccountId = profile?.stripeAccountId ?? null;
  const profileEmail = profile?.email ?? email ?? undefined;

  if (existingAccountId) {
    await supabase
      .from("users")
      .upsert(
        {
          id: userId,
          stripe_connect_account_id: existingAccountId,
        },
        { onConflict: "id" }
      );
    const onboardingRequired = profile?.stripeAccountStatus !== "active";
    return { accountId: existingAccountId, onboardingRequired };
  }

  const account = await stripe.accounts.create({
    type: "express",
    email: profileEmail,
    metadata: { userId },
  });

  const updatedProfile = await upsertContractorStripeAccount(supabase, {
    userId,
    accountId: account.id,
    status: deriveOnboardingStatus(account.charges_enabled, account.details_submitted),
  });

  await supabase
    .from("users")
    .upsert(
      {
        id: userId,
        stripe_connect_account_id: account.id,
      },
      { onConflict: "id" }
    );

  const onboardingRequired = updatedProfile.stripeAccountStatus !== "active";
  return {
    accountId: account.id,
    onboardingRequired,
  };
};

