/**
 * Produces friendly, client-facing copy from option scopes.
 */
export const buildClientCopy = (options) => {
  const good = options.good || { scopeSummary: [] };
  const better = options.better || { scopeSummary: [] };
  const best = options.best || { scopeSummary: [] };

  const headline = "Three clear options tailored to your project.";
  const paragraph =
    "Good covers the essentials, Better adds comfort and longevity upgrades, and Best delivers the premium experience with top materials.";

  const bullets = [
    `Good includes: ${good.scopeSummary.slice(0, 2).join(", ") || "core scope"}.`,
    `Better adds: ${better.scopeSummary.slice(2, 5).join(", ") || "select upgrades"}.`,
    `Best unlocks: ${best.scopeSummary.slice(2, 6).join(", ") || "our premium package"}.`,
  ];

  return { headline, paragraph, bullets };
};
