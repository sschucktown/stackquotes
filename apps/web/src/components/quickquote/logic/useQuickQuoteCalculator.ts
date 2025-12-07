import { computed, Ref } from "vue";
import type { QuickQuoteAddOn } from "@/stores/quickQuotePrototype";

export function useQuickQuoteCalculator(basePrice: Ref<number>, baseCost: Ref<number>, addOns: Ref<QuickQuoteAddOn[]>) {
  const enabledAddOns = computed(() => addOns.value.filter((item) => item.enabled));

  const addOnPrice = computed(() =>
    enabledAddOns.value.reduce((sum, item) => sum + (item.price || 0), 0)
  );

  const addOnCost = computed(() =>
    enabledAddOns.value.reduce((sum, item) => sum + (item.cost || 0), 0)
  );

  const totalPrice = computed(() => basePrice.value + addOnPrice.value);
  const totalCost = computed(() => baseCost.value + addOnCost.value);
  const margin = computed(() => totalPrice.value - totalCost.value);
  const marginPct = computed(() =>
    totalPrice.value > 0 ? Math.max(0, (margin.value / totalPrice.value) * 100) : 0
  );

  const lowEstimate = computed(() => Math.round(totalPrice.value * 0.92));
  const highEstimate = computed(() => Math.round(totalPrice.value * 1.1));

  const confidence = computed<"High" | "Medium" | "Low">(() => {
    const total = totalPrice.value;
    if (total < 30000) return "High";
    if (total <= 60000) return "Medium";
    return "Low";
  });

  return {
    enabledAddOns,
    addOnPrice,
    addOnCost,
    totalPrice,
    totalCost,
    margin,
    marginPct,
    lowEstimate,
    highEstimate,
    confidence,
  };
}
