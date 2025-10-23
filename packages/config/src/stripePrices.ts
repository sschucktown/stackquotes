export const STRIPE_PRICES = {
  FREE: "price_123free",
  PRO: "price_456pro",
  TEAM: "price_789team",
} as const;

export type StripePriceKey = keyof typeof STRIPE_PRICES;

export const PRICE_ID_TO_PLAN: Record<string, "free" | "pro" | "team"> = {
  [STRIPE_PRICES.FREE]: "free",
  [STRIPE_PRICES.PRO]: "pro",
  [STRIPE_PRICES.TEAM]: "team",
};

