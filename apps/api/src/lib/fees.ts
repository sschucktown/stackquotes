export type FeeContext = {
  tier: "free" | "pro";
  addons?: Record<string, unknown> | null;
  isFinanced?: boolean;
};

const toRecord = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
};

export const computePlatformFeePercent = (ctx: FeeContext): number => {
  const base = ctx.tier === "pro" ? 1 : 3;
  const addons = toRecord(ctx.addons);
  const hasFinancingBoost = Boolean(addons.financing_boost);
  const financed = Boolean(ctx.isFinanced);

  if (financed && hasFinancingBoost) {
    return 0;
  }
  if (hasFinancingBoost && ctx.tier === "pro") {
    return 0.5;
  }
  return base;
};

