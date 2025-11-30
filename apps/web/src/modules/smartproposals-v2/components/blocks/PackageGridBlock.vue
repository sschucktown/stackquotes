<template>
  <section class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
    <VisualPackageCards
      :packages="visualPackages"
      v-model:selected-id="selectedPackageId"
      :heading-class="fontClasses.heading"
      :body-class="fontClasses.body"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import VisualPackageCards from "../VisualPackageCards.vue";
import { useSpv2Store } from "../../stores/useSpv2Store";
import type { PackageTierId, VisualPackage } from "../../types";
import { getFontPresetClasses } from "../../utils/theme";

const store = useSpv2Store();

const fontClasses = computed(() => getFontPresetClasses(store.brand.fontPreset));

const selectedPackageId = computed({
  get: () => store.selectedPackageId,
  set: (value: PackageTierId | null) => {
    store.setSelectedPackage(value);
  },
});

const visualPackages = computed<VisualPackage[]>(() => {
  const { depositType, depositValue } = store.paymentTerms;
  const depositPercent = depositType === "percent" ? depositValue : undefined;
  const depositAmount = depositType === "fixed" ? depositValue : undefined;

  const tiers: PackageTierId[] = ["good", "better", "best"];

  return tiers
    .map((id) => {
      const data = store.packages[id];
      if (!data) return null;

      const badge =
        data.badgeLabel ?? (id === "best" ? "Most comprehensive" : id === "better" ? "Enhanced" : undefined);

      return {
        id,
        label: data.label,
        badgeLabel: badge,
        title: data.title || data.label,
        subtitle: data.subtitle,
        bullets: data.bullets ?? [],
        price: data.price ?? 0,
        depositPercent,
        depositAmount,
        metricLabel: data.metricLabel,
        metricValue: data.metricValue,
        imageUrl: data.imageUrl,
        secondaryImageUrl: data.secondaryImageUrl,
        isRecommended: data.isRecommended ?? id !== "good",
      } satisfies VisualPackage;
    })
    .filter(Boolean) as VisualPackage[];
});
</script>
