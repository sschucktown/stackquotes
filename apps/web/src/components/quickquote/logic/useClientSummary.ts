import { computed, ref, watch, type Ref } from "vue";
import type { QuickQuoteAddOn } from "@/stores/quickQuotePrototype";

type SummaryInputs = {
  lead: { jobType: string; subtype: string };
  templateName: Ref<string>;
  lowEstimate: Ref<number>;
  highEstimate: Ref<number>;
  addOns: Ref<QuickQuoteAddOn[]>;
};

export function useClientSummary(inputs: SummaryInputs) {
  const summary = ref("");
  const manual = ref(false);

  const enabledAddOnLabels = computed(() =>
    inputs.addOns.value.filter((item) => item.enabled).map((item) => item.label)
  );

  const generate = () => {
    const addOnText = enabledAddOnLabels.value.length
      ? `with ${enabledAddOnLabels.value.join(", ")}`
      : "with your selected finishes";
    return `Based on your ${inputs.lead.jobType.toLowerCase()} (${inputs.lead.subtype}) scope, your ballpark estimate is between ${format(
      inputs.lowEstimate.value
    )} and ${format(inputs.highEstimate.value)} ${addOnText}. Final pricing is confirmed during the site visit.`;
  };

  watch(
    [inputs.lowEstimate, inputs.highEstimate, enabledAddOnLabels, inputs.templateName],
    () => {
      if (!manual.value) {
        summary.value = generate();
      }
    },
    { deep: true, immediate: true }
  );

  const regenerate = () => {
    manual.value = false;
    summary.value = generate();
  };

  return { summary, manual, regenerate, generate, enabledAddOnLabels };
}

const format = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
