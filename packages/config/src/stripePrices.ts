export const STRIPE_PRICES = {
  LAUNCH: process.env.STRIPE_PRICE_LAUNCH ?? "price_launch_placeholder",
  PRO: process.env.STRIPE_PRICE_PRO ?? "price_pro_placeholder",
  CREW: process.env.STRIPE_PRICE_CREW ?? "price_crew_placeholder",
  ADDON_PROPOSALS: process.env.STRIPE_PRICE_ADDON_PROPOSALS ?? "price_addon_proposals_placeholder",
  ADDON_BRANDING: process.env.STRIPE_PRICE_ADDON_BRANDING ?? "price_addon_branding_placeholder",
} as const;

export type StripePriceKey = keyof typeof STRIPE_PRICES;

export const PRICE_ID_TO_PLAN: Record<string, "launch" | "pro" | "crew"> = {
  [STRIPE_PRICES.LAUNCH]: "launch",
  [STRIPE_PRICES.PRO]: "pro",
  [STRIPE_PRICES.CREW]: "crew",
};
