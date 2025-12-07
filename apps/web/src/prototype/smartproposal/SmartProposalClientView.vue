<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import DepositPreviewCard from "./DepositPreviewCard.vue";
import { useOptionTotals } from "./useOptionTotals";
import type { LineItem, OptionKey, ProposalOption } from "./types";

const route = useRoute();
const router = useRouter();

const decodePayload = () => {
  const raw = route.query.payload;
  if (typeof raw !== "string") return null;
  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch (error) {
    console.warn("[SmartProposal] failed to decode payload", error);
    return null;
  }
};

const fallbackOptions: Record<OptionKey, ProposalOption> = reactive({
  good: {
    label: "Good",
    items: [
      { id: "g1", name: "Basic Decking", cost: 2400, price: 4200, desc: "", included: true },
      { id: "g2", name: "Standard Railing", cost: 800, price: 1400, desc: "", included: true },
    ],
  },
  better: {
    label: "Better",
    items: [
      { id: "b1", name: "Composite Decking", cost: 3800, price: 6200, desc: "", included: true },
      { id: "b2", name: "Aluminum Railing", cost: 1100, price: 1900, desc: "", included: true },
    ],
  },
  best: {
    label: "Best",
    items: [
      { id: "bs1", name: "Premium Composite Decking", cost: 5400, price: 8600, desc: "", included: true },
      { id: "bs2", name: "Glass Railing", cost: 2600, price: 4200, desc: "", included: true },
    ],
  },
});

const decoded = decodePayload();
const parsedOptions = (() => {
  if (!decoded?.options) return fallbackOptions;
  const record: Record<OptionKey, ProposalOption> = {
    good: { label: "Good", items: [] },
    better: { label: "Better", items: [] },
    best: { label: "Best", items: [] },
  };
  (decoded.options as { key: OptionKey; label: string; items: LineItem[] }[]).forEach((opt) => {
    if (record[opt.key]) {
      record[opt.key].label = opt.label || record[opt.key].label;
      record[opt.key].items = opt.items ?? [];
    }
  });
  return reactive(record);
})();

const selectedOption = computed<OptionKey>(
  () => (["good", "better", "best"] as OptionKey[]).find((key) => route.query.option === key) || "better"
);

const summary = computed(
  () =>
    decoded?.summary ||
    "Here are three tailored options for your project. Each includes the essentials, with upgrades shown in Better and Best."
);
const upgrades = computed<string[]>(() => decoded?.upgrades || ["Composite upgrade", "Railing upgrade"]);
const deposit = computed(() => decoded?.deposit || { mode: "percent", percent: 15, flat: 1200 });

const expanded = reactive<Record<OptionKey, boolean>>({
  good: true,
  better: true,
  best: true,
});

const totals = {
  good: useOptionTotals(computed(() => parsedOptions.good)),
  better: useOptionTotals(computed(() => parsedOptions.better)),
  best: useOptionTotals(computed(() => parsedOptions.best)),
};

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const approveProposal = (optionKey: OptionKey) => {
  console.log("[SmartProposal] client approve prototype", {
    option: optionKey,
    total: totals[optionKey].totalPrice.value,
  });
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <div class="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
      <header class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">SmartProposal Preview</p>
            <h1 class="text-xl font-semibold text-slate-900">Choose the option that fits best</h1>
            <p class="text-sm text-slate-600">Client portal preview</p>
          </div>
          <div class="flex flex-col items-end gap-1">
            <span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-inner">Prototype only</span>
            <button
              type="button"
              class="text-xs font-semibold text-blue-600 underline-offset-4 hover:underline"
              @click="router.push('/prototype/smartproposal/builder')"
            >
              Back to builder
            </button>
          </div>
        </div>
      </header>

      <section class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Proposal summary</p>
            <p class="text-sm text-slate-700">{{ summary }}</p>
            <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span class="font-semibold text-slate-700">Upgrades highlighted:</span>
              <span
                v-for="note in upgrades"
                :key="note"
                class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700"
              >
                {{ note }}
              </span>
            </div>
          </div>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 shadow-inner">
            Selected: {{ selectedOption }}
          </span>
        </div>
      </section>

      <div class="grid gap-4 lg:grid-cols-3">
        <div
          v-for="key in ['good', 'better', 'best']"
          :key="key"
          class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:shadow-md sm:px-5"
        >
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{{ key }}</p>
              <h3 class="text-lg font-semibold text-slate-900">{{ parsedOptions[key as OptionKey].label }}</h3>
              <p class="text-sm font-medium text-slate-900">{{ formatCurrency(totals[key as OptionKey].totalPrice.value) }}</p>
              <p class="text-xs text-slate-500">
                Margin {{ totals[key as OptionKey].marginPct.value }}%
              </p>
            </div>
            <button
              type="button"
              class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
              @click="expanded[key as OptionKey] = !expanded[key as OptionKey]"
            >
              {{ expanded[key as OptionKey] ? "Hide" : "Details" }}
            </button>
          </div>

          <div v-if="expanded[key as OptionKey]" class="mt-3 space-y-2">
            <div
              v-for="item in parsedOptions[key as OptionKey].items"
              :key="item.id"
              class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 shadow-inner"
            >
              <div class="flex items-center justify-between">
                <p class="font-semibold">{{ item.name }}</p>
                <p class="text-sm font-semibold text-slate-900">{{ formatCurrency(Number(item.price) || 0) }}</p>
              </div>
              <p v-if="item.desc" class="text-xs text-slate-600">{{ item.desc }}</p>
            </div>
          </div>

          <button
            type="button"
            class="mt-4 inline-flex w-full items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100"
            @click="approveProposal(key as OptionKey)"
          >
            Approve {{ parsedOptions[key as OptionKey].label }}
          </button>
        </div>
      </div>

      <DepositPreviewCard
        :deposit-mode="deposit.mode"
        :deposit-percent="deposit.percent"
        :deposit-flat="deposit.flat"
        :base-amount="totals[selectedOption].totalPrice.value"
      />
    </div>
  </div>
</template>
