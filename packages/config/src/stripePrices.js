export const STRIPE_PRICES = {
  LAUNCH: "price_123free",
  BUILD: "price_1SNON3AEYYFvhjkfUxCqMXkE",
  // Pro $79.99 (new)
  PRO: "price_1SOlB3AEYYFvhjkfzV5WWADi",
};

export const PRICE_ID_TO_PLAN = {
  [STRIPE_PRICES.LAUNCH]: "launch",
  [STRIPE_PRICES.BUILD]: "build",
  [STRIPE_PRICES.PRO]: "pro",
};
