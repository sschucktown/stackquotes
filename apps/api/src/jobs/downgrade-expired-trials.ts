import { getServiceClient } from "../lib/supabase.js";
import { setUserSubscriptionTier } from "@stackquotes/db";

const ACTIVE_SUBSCRIPTION_STATUSES = [
  "trialing",
  "active",
  "past_due",
  "incomplete",
  "pending",
] as const;

export const downgradeExpiredTrials = async (): Promise<void> => {
  const supabase = getServiceClient();
  const nowIso = new Date().toISOString();

  const { data: candidates, error } = await supabase
    .from("users")
    .select("id")
    .eq("subscription_tier", "pro")
    .not("trial_end", "is", null)
    .lte("trial_end", nowIso);

  if (error) {
    console.error("[stripe] failed to load expired trials", error);
    return;
  }

  for (const candidate of candidates ?? []) {
    const userId = candidate.id as string;
    if (!userId) continue;

    const { data: activeSubscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("user_id", userId)
      .in("status", [...ACTIVE_SUBSCRIPTION_STATUSES])
      .maybeSingle();

    if (subscriptionError) {
      console.error("[stripe] failed to inspect subscription status", userId, subscriptionError);
      continue;
    }
    if (activeSubscription) {
      continue;
    }

    const { error: userUpdateError } = await supabase
      .from("users")
      .update({
        subscription_tier: "free",
        trial_end: null,
        is_active: true,
      })
      .eq("id", userId);
    if (userUpdateError) {
      console.error("[stripe] failed to downgrade user record", userId, userUpdateError);
      continue;
    }

    try {
      await setUserSubscriptionTier(supabase, userId, "free");
    } catch (setTierError) {
      console.error("[stripe] failed to sync subscription tier helper", userId, setTierError);
    }}
};

