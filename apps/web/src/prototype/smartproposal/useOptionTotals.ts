import { computed, toValue, type ComputedRef, type MaybeRef } from "vue";
import type { ProposalOption, OptionTotals } from "./types";

const toCurrencySafeNumber = (value: number | undefined) => (Number.isFinite(value) ? Number(value) : 0);

const marginStateFromPct = (pct: number): Pick<OptionTotals, "marginNudge" | "marginNudgeMsg"> => {
  if (pct < 35) return { marginNudge: "warn", marginNudgeMsg: "Increase margin to protect profit" };
  if (pct < 45) return { marginNudge: "neutral", marginNudgeMsg: "On track. Consider a slight lift." };
  return { marginNudge: "great", marginNudgeMsg: "Great margin! You're well covered." };
};

export const calculateMarginPct = (totalCost: number, totalPrice: number): number => {
  if (!Number.isFinite(totalPrice) || totalPrice <= 0) return 0;
  const pct = ((totalPrice - totalCost) / totalPrice) * 100;
  return Math.round(pct);
};

export const useOptionTotals = (option: MaybeRef<ProposalOption>): {
  totalCost: ComputedRef<number>;
  totalPrice: ComputedRef<number>;
  marginPct: ComputedRef<number>;
  marginNudge: ComputedRef<OptionTotals["marginNudge"]>;
  marginNudgeMsg: ComputedRef<string>;
} => {
  const totalCost = computed(() =>
    toValue(option).items
      .filter((item) => item.included !== false)
      .reduce((sum, item) => sum + toCurrencySafeNumber(item.cost), 0)
  );

  const totalPrice = computed(() =>
    toValue(option).items
      .filter((item) => item.included !== false)
      .reduce((sum, item) => sum + toCurrencySafeNumber(item.price), 0)
  );

  const marginPct = computed(() => calculateMarginPct(totalCost.value, totalPrice.value));

  const marginState = computed(() => marginStateFromPct(marginPct.value));

  const marginNudge = computed(() => marginState.value.marginNudge);
  const marginNudgeMsg = computed(() => marginState.value.marginNudgeMsg);

  return { totalCost, totalPrice, marginPct, marginNudge, marginNudgeMsg };
};
