<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, toRef } from "vue";
import { useRouter } from "vue-router";
import { useQuickQuotePrototype } from "@/stores/quickQuotePrototype";
import { useSmartProposalPrototype } from "@/stores/smartProposalPrototype";
import { useQuickQuoteCalculator } from "@/components/quickquote/logic/useQuickQuoteCalculator";

const router = useRouter();
const { state, exportForProposal } = useQuickQuotePrototype();
const { hydrateFromQuickQuote } = useSmartProposalPrototype();

const calculator = useQuickQuoteCalculator(toRef(state, "basePrice"), toRef(state, "baseCost"), toRef(state, "addOns"));

const showSkeleton = ref(true);
const isBuilding = ref(false);
const hasError = ref(false);
const skeletonTimer = ref<number | null>(null);

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const jobLabel = computed(() =>
  state.lead?.jobType && state.lead?.subtype ? `${state.lead.jobType} - ${state.lead.subtype}` : state.lead?.jobType || ""
);
const templateLabel = computed(() => state.templateName || "Custom QuickQuote");

const missingCriticalData = computed(() => {
  return !state.lead?.name || !state.lead?.jobType || !state.lead?.subtype || !state.lead?.location || !state.templateName;
});

const missingPricing = computed(() => !calculator.lowEstimate.value || !calculator.highEstimate.value || !calculator.totalPrice.value);

const handleBuildProposal = async () => {
  if (isBuilding.value || hasError.value) return;
  isBuilding.value = true;
  const payload = exportForProposal();
  hydrateFromQuickQuote?.(payload);
  await new Promise((resolve) => setTimeout(resolve, 350));
  router.push({ path: "/prototype/smartproposal", query: { from: "quickquote" } });
};

const handleEditQuote = () => {
  router.push("/prototype/quickquote/builder");
};

onMounted(() => {
  hasError.value = missingCriticalData.value || missingPricing.value;
  skeletonTimer.value = window.setTimeout(() => {
    showSkeleton.value = false;
  }, 750);
});

onBeforeUnmount(() => {
  if (skeletonTimer.value) {
    clearTimeout(skeletonTimer.value);
  }
});
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
    <div class="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-2xl backdrop-blur sm:p-8">
      <div class="mb-4 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
        <span class="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-inner">Step 2 of 3</span>
        <span class="text-[11px] text-slate-400">Prototype flow</span>
      </div>

      <div class="space-y-1 text-center">
        <p class="text-2xl font-semibold text-slate-900">Your QuickQuote is ready.</p>
        <p class="text-sm text-slate-600">We'll turn this into a full proposal next.</p>
      </div>

      <div v-if="hasError" class="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-center text-sm text-rose-700 shadow-inner">
        <p class="font-semibold">We need more info before we can continue.</p>
        <p class="text-rose-600">Please complete the QuickQuote first.</p>
        <button
          type="button"
          class="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          @click="handleEditQuote"
        >
          Back to QuickQuote Builder
        </button>
      </div>

      <div v-else class="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-inner">
        <Transition name="fade-slide">
          <div v-if="showSkeleton" key="skeleton" class="space-y-3 px-5 py-5">
            <div class="h-4 w-28 rounded bg-slate-700/60"></div>
            <div class="h-10 w-2/3 rounded bg-slate-700/60"></div>
            <div class="flex gap-3">
              <div class="h-12 flex-1 rounded-xl bg-slate-700/60"></div>
              <div class="h-12 flex-1 rounded-xl bg-slate-700/60"></div>
            </div>
            <div class="h-9 w-full rounded-xl bg-slate-700/60"></div>
          </div>
          <div v-else key="summary" class="px-5 py-5">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div class="text-left">
                <p class="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-200">QuickQuote summary</p>
                <p class="text-2xl font-semibold text-white">{{ formatCurrency(calculator.totalPrice.value) }}</p>
                <p class="text-sm text-slate-200">Range {{ formatCurrency(calculator.lowEstimate.value) }} - {{ formatCurrency(calculator.highEstimate.value) }}</p>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  {{ templateLabel }}
                </span>
                <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  {{ jobLabel }}
                </span>
              </div>
            </div>
            <div class="mt-4 grid gap-3 sm:grid-cols-2">
              <div class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 shadow-inner">
                <p class="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-200">Lead</p>
                <p class="text-sm font-semibold text-white">{{ state.lead.name }}</p>
                <p class="text-xs text-slate-200">{{ state.lead.location }}</p>
              </div>
              <div class="rounded-xl border border-white/10 bg-white/5 px-4 py-3 shadow-inner">
                <p class="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-200">Template</p>
                <p class="text-sm font-semibold text-white">{{ templateLabel }}</p>
                <p class="text-xs text-slate-200">Base {{ formatCurrency(state.basePrice) }}</p>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <div v-if="!hasError" class="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 underline-offset-4 hover:text-slate-800 hover:underline"
          @click="handleEditQuote"
          :disabled="isBuilding"
        >
          Back to QuickQuote
        </button>
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-full border border-blue-200 bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          :disabled="isBuilding"
          @click="handleBuildProposal"
        >
          <span v-if="isBuilding" class="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-b-transparent"></span>
          <span>{{ isBuilding ? "Building your SmartProposal..." : "Build Full Proposal →" }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.fade-slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.fade-slide-leave-from {
  opacity: 1;
}
.fade-slide-leave-to {
  opacity: 0;
}
</style>
