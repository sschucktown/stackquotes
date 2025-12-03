<script setup lang="ts">
import { computed, ref } from "vue";
import type { ProposalData, PackageOption, ThemeName } from "../data/mockProposal";
import HeroSection from "./HeroSection.vue";
import GallerySection from "./GallerySection.vue";
import PackageSelector from "./PackageSelector.vue";
import InclusionsSection from "./InclusionsSection.vue";
import CostSummarySection from "./CostSummarySection.vue";
import TimelineSection from "./TimelineSection.vue";
import TestimonialsSection from "./TestimonialsSection.vue";
import TermsSection from "./TermsSection.vue";
import CompanyFooter from "./CompanyFooter.vue";
import StickyActionBar from "./StickyActionBar.vue";
import PaymentModal from "./PaymentModal.vue";

const props = defineProps<{
  proposal: ProposalData;
}>();

const selectedPackageId = ref<string | null>(null);
const isPaymentOpen = ref(false);

const selectedPackage = computed<PackageOption | null>(() => {
  if (!selectedPackageId.value) return null;
  return props.proposal.packages.find((p) => p.id === selectedPackageId.value) || null;
});

const theme = computed<ThemeName>(() => props.proposal.contractorBrand.theme);

const themeClasses = computed(() => {
  switch (theme.value) {
    case "green":
      return {
        accent: "text-emerald-600",
        accentBg: "bg-emerald-600",
        accentSoftBg: "bg-emerald-50",
        accentBorder: "border-emerald-500",
      };
    case "orange":
      return {
        accent: "text-orange-600",
        accentBg: "bg-orange-600",
        accentSoftBg: "bg-orange-50",
        accentBorder: "border-orange-500",
      };
    case "dark":
      return {
        accent: "text-slate-100",
        accentBg: "bg-slate-900",
        accentSoftBg: "bg-slate-800",
        accentBorder: "border-slate-500",
      };
    case "blue":
    default:
      return {
        accent: "text-blue-600",
        accentBg: "bg-blue-600",
        accentSoftBg: "bg-blue-50",
        accentBorder: "border-blue-500",
      };
  }
});

function handleSelectPackage(id: string) {
  selectedPackageId.value = id;
}

function handlePayClick() {
  if (!selectedPackage.value) return;
  isPaymentOpen.value = true;
}

function handlePaymentComplete() {
  isPaymentOpen.value = false;
}
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <div
      class="mx-auto flex min-h-screen max-w-3xl flex-col px-4 pb-[120px] pt-6 sm:px-6 lg:px-8 lg:pt-8"
    >
      <div class="mb-8 animate-fade-in">
        <HeroSection :proposal="proposal" :theme-classes="themeClasses" />
      </div>

      <div class="flex-1 space-y-10">
        <div v-if="proposal.galleryUrls.length" class="animate-fade-in">
          <GallerySection :proposal="proposal" />
        </div>

        <div class="h-px bg-slate-200/60" />

        <div class="animate-fade-in">
          <PackageSelector
            :proposal="proposal"
            :theme-classes="themeClasses"
            :selected-package-id="selectedPackageId"
            @select-package="handleSelectPackage"
          />
        </div>

        <div class="h-px bg-slate-200/60" />

        <div class="animate-fade-in">
          <CostSummarySection :proposal="proposal" :theme-classes="themeClasses" />
        </div>

        <div class="animate-fade-in">
          <InclusionsSection :title="'Details & Inclusions'" :groups="proposal.inclusions" />
        </div>

        <div v-if="proposal.exclusions.length" class="animate-fade-in">
          <InclusionsSection :title="'Not Included'" :groups="proposal.exclusions" :variant="'subtle'" />
        </div>

        <div class="h-px bg-slate-200/60" />

        <div class="animate-fade-in">
          <TimelineSection :proposal="proposal" :theme-classes="themeClasses" />
        </div>

        <div class="h-px bg-slate-200/60" />

        <div v-if="proposal.testimonials.length" class="animate-fade-in">
          <TestimonialsSection :proposal="proposal" />
        </div>

        <div class="h-px bg-slate-200/60" />

        <div class="animate-fade-in">
          <TermsSection :proposal="proposal" />
        </div>

        <div class="animate-fade-in">
          <CompanyFooter :proposal="proposal" :theme-classes="themeClasses" />
        </div>
      </div>
    </div>

    <StickyActionBar
      :proposal="proposal"
      :selected-package="selectedPackage"
      :theme-classes="themeClasses"
      @pay="handlePayClick"
    />

    <PaymentModal
      :open="isPaymentOpen"
      :selected-package="selectedPackage"
      :proposal="proposal"
      @close="isPaymentOpen = false"
      @complete="handlePaymentComplete"
    />
  </div>
</template>

<style scoped>
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fadeUp 320ms ease-out forwards;
}
</style>
