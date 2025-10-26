import { Hono } from "hono";
import { requireUser } from "../lib/auth.js";
import { getServiceClient } from "../lib/supabase.js";

const NORMALISE_TIER = (value: unknown): "free" | "pro" => {
  if (typeof value === "string" && value.toLowerCase() === "pro") {
    return "pro";
  }
  return "free";
};

export const billingRouter = new Hono();

billingRouter.get("/status", async (c) => {
  const user = await requireUser(c);
  const supabase = getServiceClient();

  const selectColumns = "subscription_tier, trial_end, addons, is_active";
  let { data, error } = await supabase
    .from("users")
    .select(selectColumns)
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[billing] failed to fetch user plan", error);
    c.status(500);
    return c.json({ error: "Unable to load plan status." });
  }

  if (!data) {
    const upsertResult = await supabase
      .from("users")
      .upsert(
        {
          id: user.id,
          subscription_tier: "free",
          is_active: true,
        },
        { onConflict: "id" }
      )
      .select(selectColumns)
      .single();

    if (upsertResult.error) {
      console.error("[billing] failed to initialise user record", upsertResult.error);
      c.status(500);
      return c.json({ error: "Unable to load plan status." });
    }
    data = upsertResult.data;
  }

  const tier = NORMALISE_TIER(data?.subscription_tier ?? "free");
  const trialEndRaw = data?.trial_end ?? null;
  const addons = ((data?.addons ?? {}) as Record<string, unknown>) ?? {};
  const isActive = data?.is_active ?? true;

  let inTrial = false;
  let trialEndIso: string | null = null;
  if (typeof trialEndRaw === "string") {
    const parsed = new Date(trialEndRaw);
    if (!Number.isNaN(parsed.getTime())) {
      trialEndIso = parsed.toISOString();
      if (tier === "pro" && parsed.getTime() > Date.now()) {
        inTrial = true;
      }
    }
  }

  return c.json({
    data: {
      tier,
      trialEnd: trialEndIso,
      inTrial,
      addons,
      isActive,
    },
  });
});

