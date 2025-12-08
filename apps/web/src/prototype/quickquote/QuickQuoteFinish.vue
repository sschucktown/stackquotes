<script setup lang="ts">
import { computed, onMounted, toRef } from "vue";
import { useRouter } from "vue-router";
import { useQuickQuotePrototype } from "@/stores/quickQuotePrototype";
import { useQuickQuoteCalculator } from "@/components/quickquote/logic/useQuickQuoteCalculator";

const router = useRouter();
const { state, exportForProposal } = useQuickQuotePrototype();

const calculator = useQuickQuoteCalculator(toRef(state, "basePrice"), toRef(state, "baseCost"), toRef(state, "addOns"));

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const jobLabel = computed(() => `${state.lead.jobType} - ${state.lead.subtype}`);
const templateLabel = computed(() => state.templateName || "Custom QuickQuote");

const handleBuildProposal = () => {
  exportForProposal();
  router.push("/prototype/smartproposal");
};

const handleEditQuote = () => {
  router.push("/prototype/quickquote/builder");
};

onMounted(() => {
  if (!state.basePrice || !state.baseCost || !state.lead) {
    router.push("/prototype/quickquote/builder");
  }
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
    <div class="mx-auto flex max-w-2xl flex-col items-center justify-center">
      <div class="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700">
        <span class="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
        <span>QuickQuote ready</span>
      </div>
      <div class="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
        <div class="space-y-2 text-center">
          <p class="text-lg font-semibold text-slate-900">Your QuickQuote is ready. Build the full proposal?</p>
          <p class="text-sm text-slate-600">We'll keep your pricing, scope, and deposit preferences as we move forward.</p>
        </div>

        <div class="mt-6 grid gap-3 sm:grid-cols-2">
          <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-inner">
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Low estimate</p>
            <p class="text-xl font-semibold text-slate-900">{{ formatCurrency(calculator.lowEstimate.value) }}</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-inner">
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">High estimate</p>
            <p class="text-xl font-semibold text-slate-900">{{ formatCurrency(calculator.highEstimate.value) }}</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-inner">
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Template</p>
            <p class="text-sm font-semibold text-slate-900">{{ templateLabel }}</p>
            <p class="text-xs text-slate-500">Base: {{ formatCurrency(state.basePrice) }} | Cost: {{ formatCurrency(state.baseCost) }}</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-inner">
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Job</p>
            <p class="text-sm font-semibold text-slate-900">{{ jobLabel }}</p>
            <p class="text-xs text-slate-500">Lead: {{ state.lead.name }}</p>
          </div>
        </div>

        <div class="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            @click="handleEditQuote"
          >
            Edit QuickQuote
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 rounded-full border border-blue-200 bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700"
            @click="handleBuildProposal"
          >
            Build Full Proposal →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
