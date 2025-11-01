import { apiFetch } from "@/lib/http";
import { computed, ref } from "vue";

type Tier = "launch" | "pro" | "crew";

interface TierState {
  tier: Tier;
  trialEnd: string | null;
  inTrial: boolean;
  addons: Record<string, unknown>;
  isActive: boolean;
}

const state = ref<TierState | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
let initialised = false;

const normaliseTier = (value: unknown): Tier => {
  if (typeof value === "string") {
    const v = value.toLowerCase();
    if (v === "pro") return "pro";
    if (v === "crew") return "crew";
  }
  return "launch";
};

const calculateDaysLeft = (trialEnd: string | null): number | null => {
  if (!trialEnd) return null;
  const endDate = new Date(trialEnd);
  if (Number.isNaN(endDate.getTime())) return null;
  const diff = endDate.getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const fetchTier = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await apiFetch<{
      tier: string;
      trialEnd: string | null;
      inTrial: boolean;
      addons: Record<string, unknown>;
      isActive: boolean;
    }>("/billing/status");
    if (response.error) {
      throw new Error(response.error);
    }
    const payload = response.data;
    if (!payload) {
      throw new Error("Missing plan payload.");
    }
    state.value = {
      tier: normaliseTier(payload.tier),
      trialEnd: payload.trialEnd ?? null,
      inTrial: Boolean(payload.inTrial),
      addons: payload.addons ?? {},
      isActive: payload.isActive ?? true,
    };
  } catch (err) {
    console.error("[tier] failed to load billing status", err);
    error.value = err instanceof Error ? err.message : "Unable to load plan information.";
    state.value = {
      tier: "launch",
      trialEnd: null,
      inTrial: false,
      addons: {},
      isActive: true,
    };
  } finally {
    loading.value = false;
  }
};

export const useTier = () => {
  if (!initialised) {
    initialised = true;
    void fetchTier();
  }

  const tier = computed<Tier>(() => state.value?.tier ?? "launch");
  const inTrial = computed<boolean>(() => state.value?.inTrial ?? false);
  const trialEnd = computed<string | null>(() => state.value?.trialEnd ?? null);
  const addons = computed<Record<string, unknown>>(() => state.value?.addons ?? {});
  const isActive = computed<boolean>(() => state.value?.isActive ?? true);
  const isPro = computed<boolean>(() => tier.value === "pro" || inTrial.value);
  const isCrew = computed<boolean>(() => tier.value === "crew");
  const isPaid = computed<boolean>(() => isPro.value || isCrew.value);
  const isLaunch = computed<boolean>(() => !isPaid.value);
  const trialDaysRemaining = computed<number | null>(() => calculateDaysLeft(trialEnd.value));

  const refresh = async () => {
    await fetchTier();
  };

  return {
    tier,
    isPro,
    isCrew,
    isPaid,
    isLaunch,
    inTrial,
    trialEnd,
    trialDaysRemaining,
    addons,
    isActive,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    refresh,
  };
};

