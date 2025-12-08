<script setup lang="ts">
import { ref, toRef } from "vue";
import { useRoute, useRouter } from "vue-router";
import BaseEstimate from "./sections/BaseEstimate.vue";
import AddOns from "./sections/AddOns.vue";
import EstimateSummary from "./sections/EstimateSummary.vue";
import MiniProfitPulse from "./sections/MiniProfitPulse.vue";
import VisitAndDeposit from "./sections/VisitAndDeposit.vue";
import TemplateSelectorModal from "./modals/TemplateSelectorModal.vue";
import { useQuickQuotePrototype } from "@/stores/quickQuotePrototype";
import { useQuickQuoteCalculator } from "./logic/useQuickQuoteCalculator";
import { useClientSummary } from "./logic/useClientSummary";

const router = useRouter();
const route = useRoute();

const { state, templates, applyTemplate, setBasePrice, setBaseCost, updateAddOn } = useQuickQuotePrototype();

const selectorOpen = ref(false);

const calculator = useQuickQuoteCalculator(toRef(state, "basePrice"), toRef(state, "baseCost"), toRef(state, "addOns"));
const summaryLogic = useClientSummary({
  lead: { jobType: state.lead.jobType, subtype: state.lead.subtype },
  templateName: toRef(state, "templateName"),
  lowEstimate: calculator.lowEstimate,
  highEstimate: calculator.highEstimate,
  addOns: toRef(state, "addOns"),
});

const depositDescription = () => {
  switch (state.depositMode) {
    case "flat":
      return `Client will see a ${formatCurrency(state.flatDeposit)} target deposit when converted later.`;
    case "percent":
      return `Client will see ${state.percentDeposit}% of the estimate as a target deposit.`;
    default:
      return "This QuickQuote only previews pricing. Deposit is added later.";
  }
};

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const handleTemplateSelect = (templateId: string) => {
  applyTemplate(templateId);
  summaryLogic.regenerate();
  selectorOpen.value = false;
};

const initialTemplate = (route.query.template as string) || templates[0]?.id;
if (initialTemplate) {
  applyTemplate(initialTemplate);
  summaryLogic.regenerate();
}

const previewClientView = () => {
  router.push({
    path: `/quickquote/demo/preview`,
    query: {
      low: calculator.lowEstimate.value,
      high: calculator.highEstimate.value,
      job: `${state.lead.jobType} - ${state.lead.subtype}`,
    },
  });
};

const sendQuickQuote = () => {
  console.log("[QuickQuote]", {
    total: calculator.totalPrice.value,
    range: [calculator.lowEstimate.value, calculator.highEstimate.value],
  });
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <div class="mx-auto flex max-w-5xl flex-col gap-4 px-4 pb-28 pt-6 sm:px-6 lg:px-8">
      <header
        class="rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm transition hover:shadow-md sm:px-6 sm:py-5"
      >
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex flex-wrap items-center gap-3">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 shadow-inner transition hover:bg-slate-200"
              @click="router.push('/prototype/hq')"
            >
              <span class="text-lg leading-none">&larr;</span>
              <span>Back</span>
            </button>
            <div class="flex flex-col gap-0.5">
              <div class="flex items-center gap-2">
                <p class="text-lg font-semibold text-slate-900">QuickQuote Builder</p>
                <span
                  class="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-inner"
                >
                  Single Estimate
                </span>
              </div>
              <p class="text-sm text-slate-500">Lean ballpark with add-ons and a fast summary.</p>
            </div>
          </div>
          <div class="flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-inner">
            Prototype Only
          </div>
        </div>
      </header>

      <section
        class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:shadow-md sm:px-6 sm:py-5"
      >
        <div class="mb-3 flex items-center justify-between gap-3">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Lead &amp; Job Overview</p>
            <h2 class="text-lg font-semibold text-slate-900">{{ state.lead.name }} - {{ state.lead.jobType }} ({{ state.lead.subtype }})</h2>
            <p class="text-xs text-slate-500">Prefilled from template: {{ state.templateName || "Not selected" }}</p>
          </div>
          <button
            type="button"
            class="text-xs font-semibold text-blue-600 underline-offset-4 hover:underline"
            @click="selectorOpen = true"
          >
            Switch Template
          </button>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-3">
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-inner">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Client</p>
              <p class="text-sm font-semibold text-slate-900">{{ state.lead.name }}</p>
              <p class="text-sm text-slate-600">{{ state.lead.email }}</p>
              <p class="text-sm text-slate-600">{{ state.lead.phone }}</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-inner">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Location</p>
              <p class="text-sm font-medium text-slate-800">{{ state.lead.location }}</p>
            </div>
          </div>
          <div class="space-y-3">
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-inner">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Job Type</p>
              <p class="text-sm font-semibold text-slate-900">{{ state.lead.jobType }} - {{ state.lead.subtype }}</p>
            </div>
            <div class="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-inner">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Scope Notes</p>
              <ul class="mt-1 space-y-1 text-sm text-slate-700">
                <li v-for="item in state.scope" :key="item" class="flex items-start gap-2">
                  <span class="mt-1 h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <BaseEstimate
        :base-price="state.basePrice"
        :base-cost="state.baseCost"
        :margin="calculator.margin.value"
        :margin-pct="calculator.marginPct.value"
        @update:base-price="setBasePrice"
        @update:base-cost="setBaseCost"
      />

      <AddOns
        :add-ons="state.addOns"
        @toggle="(payload) => updateAddOn(payload.id, 'enabled', payload.value)"
        @update="(payload) => updateAddOn(payload.id, payload.field, payload.value)"
      />

      <EstimateSummary
        :low-estimate="calculator.lowEstimate.value"
        :high-estimate="calculator.highEstimate.value"
        :confidence="calculator.confidence.value"
        :summary="summaryLogic.summary.value"
        :manual="summaryLogic.manual.value"
        @update:summary="
          summaryLogic.summary.value = $event;
          summaryLogic.manual.value = true;
        "
        @regenerate="summaryLogic.regenerate()"
      />

      <MiniProfitPulse
        :total-price="calculator.totalPrice.value"
        :total-cost="calculator.totalCost.value"
        :margin-pct="calculator.marginPct.value"
      />

      <VisitAndDeposit
        :next-visit="state.nextVisit"
        :deposit-mode="state.depositMode"
        :flat-deposit="state.flatDeposit"
        :percent-deposit="state.percentDeposit"
        :deposit-description="depositDescription()"
        @update:deposit-mode="(val) => (state.depositMode = val)"
        @edit-visit="console.log('Edit visit clicked')"
      />
    </div>

    <footer
      class="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-4px_14px_rgba(15,23,42,0.06)] backdrop-blur sm:px-6 lg:px-8"
    >
      <div class="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="space-y-0.5 text-xs text-slate-500">
          <p>Prototype only. No real emails or texts are sent.</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            @click="console.log('Save draft')"
          >
            Save Draft
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700"
            @click="previewClientView"
          >
            Preview Client View
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100"
            @click="sendQuickQuote"
          >
            Send QuickQuote
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-slate-900 bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white shadow-md transition hover:bg-black"
            @click="router.push('/prototype/quickquote/finish')"
          >
            Next → Build Full Proposal
          </button>
        </div>
      </div>
    </footer>

    <TemplateSelectorModal
      :open="selectorOpen"
      :templates="templates"
      :selected-id="state.templateId"
      @close="selectorOpen = false"
      @select="handleTemplateSelect"
    />
  </div>
</template>
