export type ProposalTrade = "hvac" | "roofing" | "solar" | "landscape" | "remodel" | "generic";
export type ProposalTier = "good" | "better" | "best";

export interface VisualAssetConfig {
  abstractImageSrc: string;
  accentClass: string;
}

const normaliseTrade = (trade: string | null | undefined): ProposalTrade => {
  const value = (trade ?? "").toLowerCase();
  if (value === "hvac") return "hvac";
  if (value === "roof" || value === "roofing") return "roofing";
  if (value === "solar") return "solar";
  if (value === "landscape" || value === "landscaping") return "landscape";
  if (value === "remodel" || value === "remodeling" || value === "remodelling") return "remodel";
  return "generic";
};

const normaliseTier = (tier: string | null | undefined): ProposalTier => {
  const value = (tier ?? "").toLowerCase();
  if (value === "best") return "best";
  if (value === "better") return "better";
  return "good";
};

const baseAssets: Record<ProposalTier, VisualAssetConfig> = {
  good: {
    abstractImageSrc: "/proposal-visuals/generic-good.svg",
    accentClass: "from-sky-500 to-cyan-400",
  },
  better: {
    abstractImageSrc: "/proposal-visuals/generic-better.svg",
    accentClass: "from-indigo-500 to-blue-500",
  },
  best: {
    abstractImageSrc: "/proposal-visuals/generic-best.svg",
    accentClass: "from-amber-500 to-rose-500",
  },
};

const tradeOverrides: Partial<Record<ProposalTrade, Partial<Record<ProposalTier, VisualAssetConfig>>>> =
  {
    hvac: {
      good: { abstractImageSrc: "/proposal-visuals/generic-good.svg", accentClass: "from-sky-500 to-cyan-400" },
      better: { abstractImageSrc: "/proposal-visuals/generic-better.svg", accentClass: "from-blue-600 to-cyan-500" },
      best: { abstractImageSrc: "/proposal-visuals/generic-best.svg", accentClass: "from-slate-800 to-sky-500" },
    },
    roofing: {
      good: { abstractImageSrc: "/proposal-visuals/generic-good.svg", accentClass: "from-amber-500 to-orange-500" },
      better: { abstractImageSrc: "/proposal-visuals/generic-better.svg", accentClass: "from-amber-600 to-rose-500" },
      best: { abstractImageSrc: "/proposal-visuals/generic-best.svg", accentClass: "from-slate-800 to-amber-500" },
    },
    solar: {
      good: { abstractImageSrc: "/proposal-visuals/generic-good.svg", accentClass: "from-amber-400 to-emerald-500" },
      better: { abstractImageSrc: "/proposal-visuals/generic-better.svg", accentClass: "from-teal-500 to-cyan-500" },
      best: { abstractImageSrc: "/proposal-visuals/generic-best.svg", accentClass: "from-indigo-700 to-amber-400" },
    },
    landscape: {
      good: { abstractImageSrc: "/proposal-visuals/generic-good.svg", accentClass: "from-emerald-500 to-lime-400" },
      better: { abstractImageSrc: "/proposal-visuals/generic-better.svg", accentClass: "from-green-600 to-teal-500" },
      best: { abstractImageSrc: "/proposal-visuals/generic-best.svg", accentClass: "from-emerald-700 to-amber-400" },
    },
    remodel: {
      good: { abstractImageSrc: "/proposal-visuals/generic-good.svg", accentClass: "from-slate-700 to-blue-500" },
      better: { abstractImageSrc: "/proposal-visuals/generic-better.svg", accentClass: "from-indigo-600 to-blue-400" },
      best: { abstractImageSrc: "/proposal-visuals/generic-best.svg", accentClass: "from-slate-900 to-amber-400" },
    },
  };

export function getDefaultVisualAsset(
  trade: ProposalTrade,
  tier: ProposalTier
): VisualAssetConfig {
  const t = normaliseTrade(trade);
  const key = normaliseTier(tier);
  const override =
    tradeOverrides[t]?.[key] ??
    tradeOverrides[t]?.[normaliseTier(key)] ??
    tradeOverrides.generic?.[key];
  return override ?? baseAssets[key];
}

export function resolveTradeFromAbstractKey(key?: string | null): ProposalTrade {
  if (!key) return "generic";
  const [trade] = key.split("-");
  return normaliseTrade(trade);
}

export function resolveTierFromAbstractKey(key?: string | null): ProposalTier {
  if (!key) return "good";
  const [, tier] = key.split("-");
  return normaliseTier(tier);
}
