/**
 * Lightweight generator that turns a template + upgrade selections
 * into Good/Better/Best options with scope, pricing, and deposit preview.
 */
const toNumber = (value) => (Number.isFinite(value) ? Number(value) : 0);

const marginPct = (cost, price) => {
  if (!price) return 0;
  return Math.round(((price - cost) / price) * 100);
};

export const buildProposalFromTemplate = (template, selections) => {
  const baseItems = template.baseLineItems || [];
  const upgrades = template.upgrades || [];
  const baseScope = template.baseScope || [];

  const buildOption = (key, label) => {
    const activeIds = new Set(selections?.[key] || []);
    const appliedUpgrades = upgrades.filter((upgrade) => activeIds.has(upgrade.id));

    const lineItems = [
      ...baseItems.map((item) => ({ ...item, source: "base" })),
      ...appliedUpgrades.flatMap((upgrade) =>
        (upgrade.lineItems || []).map((item) => ({
          ...item,
          source: upgrade.id,
        }))
      ),
    ];

    const totalCost = lineItems.reduce((sum, item) => sum + toNumber(item.cost), 0);
    const totalPrice = lineItems.reduce((sum, item) => sum + toNumber(item.price), 0);
    const scopeSummary = [
      ...baseScope,
      ...appliedUpgrades.flatMap((upgrade) => upgrade.scopeAdd || [upgrade.label]),
    ];

    return {
      key,
      label,
      price: totalPrice,
      cost: totalCost,
      marginPct: marginPct(totalCost, totalPrice),
      items: lineItems,
      lineItems,
      scopeSummary,
      upgrades: appliedUpgrades.map((upgrade) => upgrade.label),
    };
  };

  const options = {
    good: buildOption("good", "Good"),
    better: buildOption("better", "Better"),
    best: buildOption("best", "Best"),
  };

  const referencePrice =
    options.better.price || options.best.price || options.good.price || template.deposit?.flat || 0;

  const depositAmount =
    template.deposit?.mode === "flat"
      ? template.deposit.flat
      : template.deposit?.mode === "percent"
      ? Math.round(referencePrice * (template.deposit.percent / 100))
      : 0;

  return {
    options,
    deposit: {
      mode: template.deposit?.mode ?? "percent",
      percent: template.deposit?.percent ?? 15,
      flat: template.deposit?.flat ?? 1200,
      amount: depositAmount,
    },
    meta: {
      clientName: template.client?.name || "Client",
      job: template.jobType && template.subtype ? `${template.jobType} - ${template.subtype}` : template.jobType,
      quickQuoteRange: template.quickQuoteRange,
    },
  };
};
