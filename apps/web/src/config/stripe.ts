import { STRIPE_PRICES as BASE_PRICES } from "@stackquotes/config";

const resolvedPrices = {
  LAUNCH:
    import.meta.env.VITE_STRIPE_PRICE_LAUNCH ??
    import.meta.env.NEXT_PUBLIC_STRIPE_PRICE_LAUNCH ??
    BASE_PRICES.LAUNCH,
  PRO:
    import.meta.env.VITE_STRIPE_PRICE_PRO ??
    import.meta.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ??
    BASE_PRICES.PRO,
  CREW:
    import.meta.env.VITE_STRIPE_PRICE_CREW ??
    import.meta.env.NEXT_PUBLIC_STRIPE_PRICE_CREW ??
    BASE_PRICES.CREW,
  ADDON_PROPOSALS:
    import.meta.env.VITE_STRIPE_PRICE_ADDON_PROPOSALS ??
    import.meta.env.NEXT_PUBLIC_STRIPE_PRICE_ADDON_PROPOSALS ??
    BASE_PRICES.ADDON_PROPOSALS,
  ADDON_BRANDING:
    import.meta.env.VITE_STRIPE_PRICE_ADDON_BRANDING ??
    import.meta.env.NEXT_PUBLIC_STRIPE_PRICE_ADDON_BRANDING ??
    BASE_PRICES.ADDON_BRANDING,
  // Legacy aliases for backward compatibility
  FREE:
    import.meta.env.VITE_STRIPE_PRICE_LAUNCH ??
    import.meta.env.NEXT_PUBLIC_STRIPE_PRICE_LAUNCH ??
    BASE_PRICES.LAUNCH,
  TEAM:
    import.meta.env.VITE_STRIPE_PRICE_CREW ??
    import.meta.env.NEXT_PUBLIC_STRIPE_PRICE_CREW ??
    BASE_PRICES.CREW,
} as const;

export const STRIPE_PRICES = resolvedPrices;
export type StripePriceKey = keyof typeof STRIPE_PRICES;

// Backward-compat aliases for older references
// @ts-expect-error legacy alias
export const STRIPE_PRICES_ALIAS = {
  // Deprecated keys mapped to new ones to avoid runtime errors during transition
  FREE: resolvedPrices.LAUNCH,
  TEAM: resolvedPrices.CREW,
};
