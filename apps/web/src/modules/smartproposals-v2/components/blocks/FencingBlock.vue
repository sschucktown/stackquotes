<template>
  <div class="rounded-[32px] bg-white p-6 ring-1 ring-slate-100 shadow-sm">
    <FencingProposal
      :proposal="proposalCard"
      :options="optionCards"
      :selected-option="selectedPackageId"
      @selectOption="store.setSelectedPackage"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSpv2Store } from "../../stores/useSpv2Store";
import FencingProposal from "@/components/SmartProposal/FencingProposal.vue";

const store = useSpv2Store();

const currency = (value: number | null | undefined) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    Number(value ?? 0)
  );

const depositLabel = computed(() => {
  const terms = store.paymentTerms;
  if (terms.depositType === "percent") {
    return `${terms.depositValue}% deposit`;
  }
  return `${currency(terms.depositValue)} deposit`;
});

const proposalCard = computed(() => ({
  address: store.jobAddress,
  timeline: store.packages?.better?.metricValue || "2-3 weeks install",
  warranty: store.packages?.better?.metricLabel ? `${store.packages.better.metricLabel}` : "5-year warranty",
  logoUrl: store.brand.logoDataUrl,
}));

const mapOption = (key: "good" | "better" | "best") => {
  const pkg = store.packages[key];
  const material = pkg.metricLabel && pkg.metricValue ? `${pkg.metricLabel}: ${pkg.metricValue}` : pkg.subtitle || "";
  const baseChips =
    pkg.metricLabel && pkg.metricValue
      ? [{ icon: "M", label: `${pkg.metricLabel}: ${pkg.metricValue}` }]
      : [];
  return {
    id: key,
    title: pkg.title,
    features: pkg.bullets.slice(0, 4),
    material: material || "Premium materials",
    price: currency(pkg.price),
    deposit: depositLabel.value,
    badge: pkg.badgeLabel || undefined,
    included: pkg.bullets,
    excluded: [],
    chips: baseChips,
  };
};

const optionCards = computed(() => [mapOption("good"), mapOption("better"), mapOption("best")]);
const selectedPackageId = computed(() => store.selectedPackageId);
</script>
