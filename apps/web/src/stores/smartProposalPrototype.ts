import { computed, reactive } from "vue";

export type OptionKey = "good" | "better" | "best";

export type Upgrade = {
  id: string;
  label: string;
  desc: string;
  scopeAdd?: string[];
  priceDelta: number;
  active?: boolean;
};

export type SmartOption = {
  label: string;
  subtitle: string;
  basePrice: number;
  price: number;
  scope: string[];
  upgrades: Upgrade[];
  confidence: "On track" | "Great pick" | "Premium fit";
};

type DepositMode = "percent" | "flat" | "none";

const baseScope = ["Structural framing", "Standard rails", "Stairs + landings"];

const state = reactive({
  simpleMode: true,
  visitNotes: "Walked the yard, confirmed access on north side. Hidden fasteners preferred.",
  baseScope,
  hasImportedFromQuickQuote: false,
  importMeta: {
    lead: { name: "", email: "", phone: "", location: "", job: "" },
    templateName: "",
    estimates: { low: 0, high: 0, total: 0 },
  },
  options: {
    good: {
      label: "Good",
      subtitle: "Essential Option",
      basePrice: 18600,
      price: 18600,
      scope: [...baseScope],
      confidence: "On track",
      upgrades: [
        { id: "u-stain", label: "Stain & seal", desc: "Protective finish on rails + surface.", scopeAdd: ["Stain + seal package"], priceDelta: 600, active: false },
      ],
    } as SmartOption,
    better: {
      label: "Better",
      subtitle: "Comfort Option",
      basePrice: 21400,
      price: 21400,
      scope: [...baseScope, "Composite surface", "Aluminum rails"],
      confidence: "Great pick",
      upgrades: [
        { id: "u-composite", label: "Composite surface", desc: "Low-maintenance boards with hidden fasteners.", scopeAdd: ["Composite decking", "Hidden fasteners"], priceDelta: 1800, active: true },
        { id: "u-rail", label: "Aluminum railing", desc: "Sleek black railing upgrade.", scopeAdd: ["Powder-coated rail"], priceDelta: 900, active: true },
        { id: "u-light", label: "Lighting package", desc: "Stair + perimeter lights.", scopeAdd: ["Integrated lighting"], priceDelta: 620, active: false },
      ],
    } as SmartOption,
    best: {
      label: "Best",
      subtitle: "Premium Option",
      basePrice: 24800,
      price: 24800,
      scope: [...baseScope, "Premium composite surface", "Glass rail"],
      confidence: "Premium fit",
      upgrades: [
        { id: "u-prem-surface", label: "Premium composite surface", desc: "Top-tier capped boards.", scopeAdd: ["Premium composite surface"], priceDelta: 2600, active: true },
        { id: "u-glass", label: "Glass rail", desc: "Frameless glass system.", scopeAdd: ["Glass railing"], priceDelta: 1800, active: true },
        { id: "u-light-best", label: "Lighting package", desc: "Stair + perimeter lights.", scopeAdd: ["Integrated lighting"], priceDelta: 620, active: true },
      ],
    } as SmartOption,
  },
  summary: {
    text: "Here are three tailored options. Good covers essentials, Better adds comfort upgrades, Best delivers the premium experience.",
    manual: false,
  },
  deposit: {
    mode: "percent" as DepositMode,
    percent: 15,
    flat: 1200,
  },
});

const sumUpgradePrice = (upgrades: Upgrade[]) =>
  upgrades.filter((u) => u.active).reduce((sum, u) => sum + (u.priceDelta || 0), 0);

const autoGenerateScopeSnapshot = (optionKey: OptionKey): string[] => {
  const option = state.options[optionKey];
  const add = option.upgrades.filter((u) => u.active).flatMap((u) => u.scopeAdd || [u.label]);
  const scope = [...state.baseScope, ...add];
  option.scope = scope;
  return scope;
};

const refreshOptionPrice = (optionKey: OptionKey) => {
  const option = state.options[optionKey];
  const upgradeTotal = sumUpgradePrice(option.upgrades);
  option.price = Math.round(option.basePrice + upgradeTotal);
  autoGenerateScopeSnapshot(optionKey);
};

const applyUpgrade = (optionKey: OptionKey, upgradeId: string, value: boolean) => {
  const option = state.options[optionKey];
  const target = option.upgrades.find((u) => u.id === upgradeId);
  if (!target) return;
  target.active = value;
  refreshOptionPrice(optionKey);
  if (!state.summary.manual) {
    autoGenerateSummary();
  }
};

const setDepositMode = (mode: DepositMode) => {
  state.deposit.mode = mode;
};

const setDepositPercent = (percent: number) => {
  state.deposit.percent = percent;
};

const setDepositFlat = (value: number) => {
  state.deposit.flat = value;
};

const autoGenerateSummary = () => {
  state.summary.text =
    "Here are three options: Good covers essentials, Better adds durability and comfort, and Best unlocks premium finishes.";
  state.summary.manual = false;
};

const summaryComputed = computed(() => state.summary.text);

const depositPreview = computed(() => {
  const target = state.options.better?.price || state.options.best?.price || state.options.good.price || 0;
  if (state.deposit.mode === "percent") return Math.round(target * (state.deposit.percent / 100));
  if (state.deposit.mode === "flat") return state.deposit.flat;
  return 0;
});

const hydrateFromQuickQuote = (payload: any) => {
  if (!payload) return;

  state.hasImportedFromQuickQuote = true;
  state.importMeta.lead = {
    name: payload.lead?.name || "",
    email: payload.lead?.email || "",
    phone: payload.lead?.phone || "",
    location: payload.lead?.location || "",
    job:
      payload.lead?.jobType && payload.lead?.subtype
        ? `${payload.lead.jobType} - ${payload.lead.subtype}`
        : payload.lead?.jobType || "",
  };
  state.importMeta.templateName = payload.templateName || "";
  state.importMeta.estimates = {
    low: payload.lowEstimate || 0,
    high: payload.highEstimate || 0,
    total: payload.totalPrice || 0,
  };

  if (payload.scope?.length) {
    state.baseScope = [...payload.scope];
  }

  (["good", "better", "best"] as OptionKey[]).forEach((key) => {
    state.options[key].upgrades.forEach((upgrade) => {
      upgrade.active = false;
    });
    state.options[key].scope = [...state.baseScope];
  });

  if (payload.lowEstimate) {
    state.options.good.basePrice = payload.lowEstimate;
    state.options.good.price = payload.lowEstimate;
  }
  if (payload.totalPrice) {
    state.options.better.basePrice = payload.totalPrice;
    state.options.better.price = payload.totalPrice;
  }
  if (payload.highEstimate) {
    state.options.best.basePrice = payload.highEstimate;
    state.options.best.price = payload.highEstimate;
  }

  (["good", "better", "best"] as OptionKey[]).forEach((key) => autoGenerateScopeSnapshot(key));

  if (payload.depositMode) {
    setDepositMode(payload.depositMode);
  }
  if (payload.depositMode === "flat") {
    setDepositFlat(payload.flatDeposit || 0);
  } else if (payload.depositMode === "percent") {
    setDepositPercent(payload.percentDeposit || 0);
  }

  state.summary.manual = false;
  autoGenerateSummary();
};

// initialize prices and scopes
(["good", "better", "best"] as OptionKey[]).forEach((key) => refreshOptionPrice(key));

export const useSmartProposalPrototype = () => ({
  state,
  applyUpgrade,
  autoGenerateScopeSnapshot,
  refreshOptionPrice,
  autoGenerateSummary,
  setDepositMode,
  setDepositPercent,
  setDepositFlat,
  summaryComputed,
  depositPreview,
  hydrateFromQuickQuote,
});
