<script setup lang="ts">
import { computed, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { OptionKey } from "./types";

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

const fallback = reactive({
  proposal: {
    options: {
      good: { label: "Good", price: 18600, scopeSummary: ["Core framing", "Standard rails"], lineItems: [] },
      better: { label: "Better", price: 21400, scopeSummary: ["Composite surface", "Aluminum rails"], lineItems: [] },
      best: { label: "Best", price: 24800, scopeSummary: ["Premium surface", "Glass rail"], lineItems: [] },
    },
    deposit: { mode: "percent", percent: 15, amount: 3210 },
    meta: { clientName: "Client", job: "Project", quickQuoteRange: "$18,600 - $22,400" },
  },
  copy: {
    headline: "Three clear options tailored to your project.",
    paragraph: "Good covers essentials, Better adds durability, Best delivers premium finishes.",
    bullets: ["Good includes the essentials.", "Better adds upgrades.", "Best unlocks the premium package."],
  },
  primary: "better",
});

const decoded = decodePayload() || fallback;

const selectedOption = computed<OptionKey>(
  () => (["good", "better", "best"] as OptionKey[]).find((key) => route.query.option === key) || decoded.primary || "better"
);

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const approve = (option: OptionKey) => {
  console.log("[SmartProposal] Approve prototype", { option, total: decoded.proposal.options[option].price });
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <div class="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
      <header class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Proposal Preview</p>
            <h1 class="text-xl font-semibold text-slate-900">Choose the option that fits best</h1>
            <p class="text-sm text-slate-600">{{ decoded.proposal.meta.clientName }} · {{ decoded.proposal.meta.job }}</p>
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
        <div class="flex flex-col gap-2">
          <p class="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Overview</p>
          <h3 class="text-lg font-semibold text-slate-900">{{ decoded.copy.headline }}</h3>
          <p class="text-sm text-slate-600">{{ decoded.copy.paragraph }}</p>
          <ul class="mt-2 space-y-1 text-sm text-slate-800">
            <li v-for="item in decoded.copy.bullets" :key="item" class="flex items-start gap-2">
              <span class="mt-1 h-1.5 w-1.5 rounded-full bg-slate-300"></span>
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
      </section>

      <div class="grid gap-4 lg:grid-cols-3">
        <div
          v-for="key in ['good','better','best']"
          :key="key"
          class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:shadow-md sm:px-5"
        >
          <div class="flex items-start justify-between gap-2">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{{ decoded.proposal.options[key as OptionKey].label }}</p>
              <p class="text-2xl font-bold text-slate-900">{{ formatCurrency(decoded.proposal.options[key as OptionKey].price) }}</p>
              <p class="text-xs text-slate-500">
                Includes: {{ decoded.proposal.options[key as OptionKey].scopeSummary.slice(0, 2).join(", ") }}
              </p>
            </div>
            <span
              class="rounded-full px-3 py-1 text-xs font-semibold text-white shadow-inner"
              :class="key === 'good' ? 'bg-slate-800' : key === 'better' ? 'bg-blue-600' : 'bg-emerald-600'"
            >
              {{ key }}
            </span>
          </div>
          <div class="mt-3 space-y-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 shadow-inner">
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Scope highlights</p>
            <ul class="space-y-1 text-sm text-slate-800">
              <li
                v-for="item in decoded.proposal.options[key as OptionKey].scopeSummary.slice(0, 4)"
                :key="item"
                class="flex items-start gap-2"
              >
                <span class="mt-1 h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
          <button
            type="button"
            class="mt-4 inline-flex w-full items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100"
            @click="approve(key as OptionKey)"
          >
            Approve {{ decoded.proposal.options[key as OptionKey].label }}
          </button>
        </div>
      </div>

      <section class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Deposit</p>
            <p class="text-lg font-semibold text-slate-900">{{ decoded.proposal.deposit.mode === "percent" ? decoded.proposal.deposit.percent + "% at approval" : "Flat deposit" }}</p>
            <p class="text-sm text-slate-600">Estimated deposit: {{ formatCurrency(decoded.proposal.deposit.amount || 0) }}</p>
          </div>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 shadow-inner">Preview</span>
        </div>
      </section>
    </div>
  </div>
</template>
