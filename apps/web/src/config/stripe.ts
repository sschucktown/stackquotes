import { STRIPE_PRICES as BASE_PRICES } from "@stackquotes/config";

const resolvedPrices = {
  FREE:
    import.meta.env.VITE_STRIPE_PRICE_FREE ??
    import.meta.env.NEXT_PUBLIC_STRIPE_PRICE_FREE ??
    BASE_PRICES.FREE,
  PRO:
    import.meta.env.VITE_STRIPE_PRICE_PRO ??
    import.meta.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ??
    BASE_PRICES.PRO,
  TEAM:
    import.meta.env.VITE_STRIPE_PRICE_TEAM ??
    import.meta.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM ??
    BASE_PRICES.TEAM,
} as const;

export const STRIPE_PRICES = resolvedPrices;
export type StripePriceKey = keyof typeof STRIPE_PRICES;
