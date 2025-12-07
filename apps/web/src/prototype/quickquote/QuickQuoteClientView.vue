<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

type AddOn = { label: string; enabled?: boolean };

const props = defineProps<{
  estimate?: number;
  low?: number;
  high?: number;
  scope?: string[];
  addOns?: AddOn[];
  jobType?: string;
  clientName?: string;
}>();

const route = useRoute();

const lowEstimate = computed(() => Number(route.query.low ?? props.low ?? 16800));
const highEstimate = computed(() => Number(route.query.high ?? props.high ?? 21200));
const job = computed(() => (route.query.job as string) || props.jobType || "Deck - Composite");
const scopeItems = computed(() => props.scope ?? ["Composite surface", "Hidden fasteners", "Upgraded rails"]);
const addOnItems = computed(() =>
  props.addOns ?? [
    { label: "Premium rails", enabled: true },
    { label: "Lighting package", enabled: false },
  ]
);
const client = computed(() => props.clientName || "Sarah Thompson");

const confidenceLevel = computed(() => "High");
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <div class="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-0">
      <header class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">QuickQuote Preview</p>
            <h1 class="text-xl font-semibold text-slate-900">Your Ballpark Estimate</h1>
            <p class="text-sm text-slate-600">Prepared for {{ client }}</p>
          </div>
          <div class="flex flex-col items-end gap-1">
            <span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-inner">{{ job }}</span>
            <span class="text-xs text-slate-500">Prototype only</span>
          </div>
        </div>
      </header>

      <section class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
        <p class="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Estimated Range</p>
        <p class="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          {{ lowEstimate.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) }}
          -
          {{ highEstimate.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) }}
        </p>
        <p class="mt-2 text-sm text-slate-600">This is a ballpark. Final price is verified at the on-site visit.</p>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-900">Scope Summary</h3>
          <span class="text-xs text-slate-500">Preview</span>
        </div>
        <div class="mt-3 grid gap-3 sm:grid-cols-2">
          <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 shadow-inner">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Base Scope</p>
            <ul class="mt-2 space-y-1 text-sm text-slate-700">
              <li v-for="item in scopeItems" :key="item" class="flex items-start gap-2">
                <span class="mt-1 h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 shadow-inner">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Included Add-ons</p>
            <ul class="mt-2 space-y-1 text-sm text-slate-700">
              <li v-for="item in addOnItems" :key="item.label" class="flex items-start gap-2">
                <span
                  class="mt-0.5 h-4 w-4 rounded-full"
                  :class="item.enabled ? 'bg-emerald-500' : 'bg-slate-300'"
                ></span>
                <span>{{ item.label }}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-900">Confidence Meter</h3>
          <span class="text-xs font-semibold text-emerald-700">{{ confidenceLevel }}</span>
        </div>
        <div class="mt-2 flex items-center gap-2">
          <div class="flex flex-1 items-center gap-1">
            <div class="h-2 flex-1 rounded-full bg-emerald-200 animate-pulse"></div>
            <div class="h-2 flex-1 rounded-full bg-emerald-300 animate-pulse"></div>
            <div class="h-2 flex-1 rounded-full bg-emerald-400 animate-pulse"></div>
          </div>
          <span class="text-xs text-slate-500">High</span>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
        <h3 class="text-lg font-semibold text-slate-900">Next Steps</h3>
        <ul class="mt-2 space-y-2 text-sm text-slate-700">
          <li class="flex items-start gap-2">
            <span class="mt-1 h-1.5 w-1.5 rounded-full bg-slate-300"></span>
            <span>Review this estimate range.</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="mt-1 h-1.5 w-1.5 rounded-full bg-slate-300"></span>
            <span>Schedule a site visit to verify scope and access.</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="mt-1 h-1.5 w-1.5 rounded-full bg-slate-300"></span>
            <span>Receive your final SmartProposal afterward.</span>
          </li>
        </ul>
        <button
          type="button"
          class="mt-4 inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700"
        >
          Schedule Visit
        </button>
      </section>
    </div>
  </div>
</template>
