export type FeeContext = {
  tier: "launch" | "pro" | "crew";
  addons?: Record<string, unknown> | null;
  isFinanced?: boolean;
};

const toRecord = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
};

const hasFinancingBoostFlag = (addons: Record<string, unknown>): boolean => {
  const value = addons.financing_boost;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  if (typeof value === "number") return value === 1;
  return false;
};

export const computePlatformFeePercent = (ctx: FeeContext): number => {
  const base = ctx.tier === "launch" ? 3 : 1;
  const addons = toRecord(ctx.addons);
  const financed = Boolean(ctx.isFinanced);
  const hasFinancingBoost = hasFinancingBoostFlag(addons);

  if (hasFinancingBoost) {
    return financed ? 0 : 0.5;
  }

  return base;
};
