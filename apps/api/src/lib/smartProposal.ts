import type { LineItem, ProposalOption, ProposalTotal } from "@stackquotes/types";

export const SMART_PROPOSAL_MULTIPLIERS: Array<{ name: string; factor: number; summary: string }> =
  [
    {
      name: "Good",
      factor: 0.85,
      summary: "Value-focused essentials to win price-sensitive clients.",
    },
    {
      name: "Better",
      factor: 1,
      summary: "Balanced scope aligned with your QuickQuote baseline.",
    },
    {
      name: "Best",
      factor: 1.2,
      summary: "Premium upgrade package for maximum client delight.",
    },
  ];

const roundCurrency = (value: number): number => Math.round(value * 100) / 100;

const mapOption = (
  items: LineItem[],
  multiplier: { name: string; factor: number; summary: string }
): ProposalOption => {
  const lineItems = items.map((item) => {
    const quantity = Number(item.quantity ?? 0);
    const unitCost = roundCurrency(Number(item.unitPrice ?? 0) * multiplier.factor);
    const total = roundCurrency(unitCost * quantity);
    return {
      description: item.description,
      quantity,
      unitCost,
      total,
    };
  });

  const subtotal = roundCurrency(lineItems.reduce((sum, entry) => sum + entry.total, 0));

  return {
    name: multiplier.name,
    summary: multiplier.summary,
    lineItems,
    subtotal,
    multiplier: multiplier.factor,
  };
};

export const createSmartProposalFromLineItems = (
  lineItems: LineItem[],
  branding: { businessName?: string | null } = {}
): { options: ProposalOption[]; totals: ProposalTotal[] } => {
  const options = SMART_PROPOSAL_MULTIPLIERS.map((entry) => mapOption(lineItems, entry));

  if (branding.businessName && options.length >= 3) {
    options[2] = {
      ...options[2],
      summary: `${branding.businessName}'s signature upgrade experience.`,
    };
  }

  const totals = options.map<ProposalTotal>((option) => ({
    name: option.name,
    total: option.subtotal,
  }));

  return { options, totals };
};

