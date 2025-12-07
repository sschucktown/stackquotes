export type OptionKey = "good" | "better" | "best";

export type LineItem = {
  id: string;
  name: string;
  desc?: string;
  cost: number;
  price: number;
  included?: boolean;
  category?: "structure" | "surface" | "hardware" | "upgrade" | string;
};

export type ProposalOption = {
  label: string;
  items: LineItem[];
};

export type OptionTotals = {
  totalCost: number;
  totalPrice: number;
  marginPct: number;
  marginNudge: "warn" | "neutral" | "great";
  marginNudgeMsg: string;
};
