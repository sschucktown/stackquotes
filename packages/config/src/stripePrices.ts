export const STRIPE_PRICES = {
  LAUNCH: "price_123free",
  BUILD: "price_1SNON3AEYYFvhjkfUxCqMXkE",
  PRO: "price_1SNONvAEYYFvhjkfO2Mw4cTH",
} as const;

export type StripePriceKey = keyof typeof STRIPE_PRICES;

export const PRICE_ID_TO_PLAN: Record<string, "launch" | "build" | "pro"> = {
  [STRIPE_PRICES.LAUNCH]: "launch",
  [STRIPE_PRICES.BUILD]: "build",
  [STRIPE_PRICES.PRO]: "pro",
};

