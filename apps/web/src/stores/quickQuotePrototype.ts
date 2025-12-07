import { reactive } from "vue";

export type QuickQuoteAddOn = {
  id: string;
  label: string;
  price: number;
  cost: number;
  enabled: boolean;
  notes?: string;
};

export type QuickQuoteTemplate = {
  id: string;
  title: string;
  description: string;
  basePrice: number;
  baseCost: number;
  scope: string[];
  addOns: QuickQuoteAddOn[];
  complexity: "Low" | "Medium" | "High";
};

const templateList: QuickQuoteTemplate[] = [
  {
    id: "deck-12x12-pt",
    title: "12x12 Pressure-Treated Deck",
    description: "Starter layout with straightforward framing and standard rails.",
    basePrice: 14800,
    baseCost: 9500,
    scope: ["Standard framing", "Basic rails", "Simple stairs"],
    addOns: [
      { id: "lighting", label: "Lighting package", price: 1200, cost: 500, enabled: false },
      { id: "rails", label: "Premium rails", price: 1500, cost: 700, enabled: false },
      { id: "skirt", label: "Skirt boards", price: 900, cost: 350, enabled: false },
    ],
    complexity: "Low",
  },
  {
    id: "deck-16x20-composite",
    title: "Composite 16x20 Deck",
    description: "Composite surface, upgraded rails, skirt boards.",
    basePrice: 19800,
    baseCost: 11800,
    scope: ["Composite surface", "Hidden fasteners", "Upgraded rails"],
    addOns: [
      { id: "lighting", label: "Lighting package", price: 1400, cost: 600, enabled: false },
      { id: "rails", label: "Premium rails", price: 1800, cost: 900, enabled: true },
      { id: "skirt", label: "Skirt boards", price: 1100, cost: 450, enabled: true },
    ],
    complexity: "Medium",
  },
  {
    id: "deck-resurface",
    title: "Deck Resurfacing",
    description: "Replace surface and rails while reusing sound framing.",
    basePrice: 17200,
    baseCost: 11000,
    scope: ["Demo old surface", "Inspect framing", "New rails + surface"],
    addOns: [
      { id: "lighting", label: "Lighting package", price: 1100, cost: 450, enabled: false },
      { id: "rails", label: "Premium rails", price: 1500, cost: 700, enabled: false },
      { id: "fascia", label: "Fascia wrap", price: 900, cost: 350, enabled: false },
    ],
    complexity: "Medium",
  },
  {
    id: "wrap-around",
    title: "Wrap-Around Deck",
    description: "Expanded wrap with extra footings and fascia upgrades.",
    basePrice: 24800,
    baseCost: 15500,
    scope: ["Multi-side layout", "Extra footings", "Premium fascia"],
    addOns: [
      { id: "lighting", label: "Lighting package", price: 1600, cost: 700, enabled: true },
      { id: "rails", label: "Premium rails", price: 1800, cost: 900, enabled: true },
      { id: "pergola", label: "Pergola / cover roof", price: 3200, cost: 1700, enabled: false },
    ],
    complexity: "High",
  },
  {
    id: "stair-replacement",
    title: "Stair Replacement",
    description: "Focused repair to replace failing stairs and rails.",
    basePrice: 8600,
    baseCost: 5200,
    scope: ["New stringers", "Treads + rails", "Safety-focused finish"],
    addOns: [
      { id: "lighting", label: "Lighting package", price: 800, cost: 300, enabled: false },
      { id: "rails", label: "Premium rails", price: 1300, cost: 650, enabled: false },
    ],
    complexity: "Low",
  },
];

const state = reactive({
  lead: {
    name: "Sarah Thompson",
    email: "sarah@example.com",
    phone: "(843) 555-0123",
    location: "482 Maple St, Seattle, WA",
    jobType: "Deck",
    subtype: "Composite",
    source: "QuickQuote portal",
  },
  templateId: "",
  templateName: "",
  scope: ["Composite surface", "Hidden fasteners", "Upgraded rails"],
  basePrice: 19800,
  baseCost: 11800,
  addOns: [
    { id: "lighting", label: "Lighting package", price: 1200, cost: 500, enabled: false },
    { id: "rails", label: "Premium rails", price: 1500, cost: 700, enabled: false },
    { id: "skirt", label: "Skirt boards", price: 900, cost: 350, enabled: false },
  ] as QuickQuoteAddOn[],
  nextVisit: "Tomorrow at 3 PM",
  depositMode: "none" as "none" | "flat" | "percent",
  flatDeposit: 1000,
  percentDeposit: 20,
});

function applyTemplate(templateId?: string) {
  const match = templateList.find((t) => t.id === templateId);
  if (!match) return;
  state.templateId = match.id;
  state.templateName = match.title;
  state.basePrice = match.basePrice;
  state.baseCost = match.baseCost;
  state.scope = [...match.scope];
  state.addOns = match.addOns.map((item) => ({ ...item, notes: item.notes || "" }));
}

function setBasePrice(value: number) {
  state.basePrice = Math.max(0, value || 0);
}

function setBaseCost(value: number) {
  state.baseCost = Math.max(0, value || 0);
}

function updateAddOn(id: string, field: "enabled" | "price" | "cost" | "notes", value: unknown) {
  const target = state.addOns.find((item) => item.id === id);
  if (!target) return;
  if (field === "enabled") {
    target.enabled = Boolean(value);
  } else if (field === "price" || field === "cost") {
    target[field] = Math.max(0, Number(value) || 0);
  } else if (field === "notes") {
    target.notes = String(value ?? "");
  }
}

export function useQuickQuotePrototype() {
  return {
    state,
    templates: templateList,
    applyTemplate,
    setBasePrice,
    setBaseCost,
    updateAddOn,
  };
}
