import { getServiceClient } from "./supabase.js";

export type PlanStatus = {
  tier: "launch" | "pro" | "crew" | string;
  trialEnd: string | null;
  inTrial: boolean;
  hasProFeatures: boolean;
};

const normaliseTier = (value: unknown): "launch" | "pro" | "crew" | string => {
  if (typeof value === "string") {
    const v = value.toLowerCase();
    if (v === "pro" || v === "crew") return v as "pro" | "crew";
    if (v === "launch") return "launch";
    return v; // allow unknowns like 'expired_trial' to pass through
  }
  return "launch";
};

export const getPlanStatus = async (userId: string): Promise<PlanStatus> => {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("users")
    .select("subscription_tier, trial_end")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    console.error("[plan] failed to fetch plan status", error);
  }
  const tier = normaliseTier((data as any)?.subscription_tier ?? "launch");
  const trialEndRaw = (data as any)?.trial_end as string | null | undefined;
  let inTrial = false;
  let trialEnd: string | null = null;
  if (typeof trialEndRaw === "string") {
    const parsed = new Date(trialEndRaw);
    if (!Number.isNaN(parsed.getTime())) {
      trialEnd = parsed.toISOString();
      inTrial = parsed.getTime() > Date.now();
    }
  }
  const hasProFeatures = tier === "pro" || tier === "crew" || inTrial;
  return { tier, trialEnd, inTrial, hasProFeatures };
};

export class PlanRestrictionError extends Error {
  status = 403;
}

export const assertCreateEditAllowed = async (userId: string): Promise<void> => {
  const status = await getPlanStatus(userId);
  if (!status.hasProFeatures) {
    const err = new PlanRestrictionError(
      "Your trial has ended. Upgrade to Pro to continue creating or editing."
    );
    throw err;
  }
};

