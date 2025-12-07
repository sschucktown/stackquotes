<script setup lang="ts">
import { computed, ref, watch } from "vue";

type QQOption = {
  id: "good" | "better" | "best";
  label: string;
  description: string;
  basePrice: number;
  include: boolean;
  notes: string;
  lowEstimate: number;
  highEstimate: number;
  lineItems: string[];
};

const options = ref<QQOption[]>([
  {
    id: "good",
    label: "Good",
    description: "Pressure-treated deck, standard rails.",
    basePrice: 14800,
    include: true,
    notes: "",
    lowEstimate: 13800,
    highEstimate: 15800,
    lineItems: ["12' x 20' deck", "Standard railing", "Basic stairs"],
  },
  {
    id: "better",
    label: "Better",
    description: "Composite decking upgrade.",
    basePrice: 18600,
    include: true,
    notes: "",
    lowEstimate: 17600,
    highEstimate: 19600,
    lineItems: ["12' x 20' composite deck", "Upgraded railing", "Skirt boards"],
  },
  {
    id: "best",
    label: "Best",
    description: "Composite + lighting and fascia.",
    basePrice: 21900,
    include: true,
    notes: "",
    lowEstimate: 20900,
    highEstimate: 22900,
    lineItems: ["Composite deck & premium rails", "Fascia wrap", "Post cap lighting"],
  },
]);

const noteVisibility = ref<Record<QQOption["id"], boolean>>({
  good: false,
  better: false,
  best: false,
});

const depositMode = ref<"none" | "flat" | "percent">("none");
const flatDeposit = ref(1000);
const percentDeposit = ref(20);
const nextVisit = ref("Tomorrow at 3 PM");

const logAction = (label: string, payload?: unknown) => {
  console.log("[QuickQuoteBuilder]", label, payload);
};

const formatCurrency = (value: number): string =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const rangeSummary = computed(() => {
  const included = options.value.filter((option) => option.include);
  if (!included.length) {
    return "Select at least one option to show a client-facing range.";
  }
  return included
    .map(
      (option) => `${option.label}: ${formatCurrency(option.lowEstimate)} - ${formatCurrency(option.highEstimate)}`
    )
    .join(" \u2022 ");
});

const depositDescription = computed(() => {
  switch (depositMode.value) {
    case "flat":
      return `Client will see a ${formatCurrency(flatDeposit.value)} target deposit when converted to SmartProposal.`;
    case "percent":
      return `Client will see ${percentDeposit.value}% of chosen option as a target deposit.`;
    default:
      return "This QuickQuote only previews pricing. Deposit is added later in SmartProposal.";
  }
});

watch(
  () => options.value.map((option) => option.basePrice),
  (prices) => {
    options.value.forEach((option, index) => {
      const base = prices[index] ?? option.basePrice;
      option.lowEstimate = Math.max(0, Math.round(base - 1000));
      option.highEstimate = Math.max(0, Math.round(base + 1000));
    });
  }
);
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <div class="mx-auto flex max-w-5xl flex-col gap-5 px-4 pb-28 pt-6 sm:px-6 lg:px-8">
      <header
        class="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5"
      >
        <div class="flex flex-wrap items-center gap-3">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 shadow-inner transition hover:bg-slate-200"
            @click="logAction('Back to HQ')"
          >
            <span class="text-lg leading-none">&larr;</span>
            <span>Back to HQ</span>
          </button>
          <div class="flex flex-col gap-0.5">
            <div class="flex items-center gap-2">
              <p class="text-sm font-semibold text-slate-900">QuickQuote &bull; New Estimate</p>
              <span
                class="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-inner"
              >
                Draft
              </span>
            </div>
            <p class="text-xs text-slate-500">Fast ballpark builder for a lead - confidence: early estimate</p>
          </div>
        </div>
        <div class="flex flex-col items-start gap-1 text-right text-xs text-slate-500 sm:items-end">
          <span class="rounded-full border border-blue-100 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
            Prototype Only
          </span>
          <span class="text-[11px] text-slate-500">Wire up later; logs actions for now</span>
        </div>
      </header>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-4 flex items-center justify-between gap-3">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Lead &amp; Job Overview</p>
            <h2 class="text-lg font-semibold text-slate-900">Sarah Thompson - Maple St Deck</h2>
          </div>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 shadow-inner">
            QuickQuote only
          </span>
        </div>

        <div class="grid gap-5 md:grid-cols-2">
          <div class="space-y-3">
            <div class="space-y-1">
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">Client Name</label>
              <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 shadow-inner">
                Sarah Thompson
              </div>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</label>
              <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 shadow-inner">
                sarah@example.com
              </div>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</label>
              <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 shadow-inner">
                (843) 555-0123
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <div class="space-y-1">
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">Job Type</label>
              <div
                class="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm"
              >
                <span>Deck - Composite</span>
                <span class="text-slate-400">&darr;</span>
              </div>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">Location</label>
              <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 shadow-inner">
                482 Maple St, Seattle, WA
              </div>
            </div>
            <div class="space-y-1">
              <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">Source</label>
              <div
                class="inline-flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm"
              >
                <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-inner">
                  QuickQuote portal
                </span>
                <span class="text-xs text-blue-600">Lead intake</span>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 shadow-inner">
          QuickQuote is a fast ballpark estimate. Final price is confirmed after site visit and SmartProposal.
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">Estimate Options</h3>
            <p class="text-sm text-slate-600">Offer simple choices your client can understand.</p>
          </div>
          <span class="text-xs text-slate-500">Confidence hint: quick range, not final scope</span>
        </div>

        <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="option in options"
            :key="option.id"
            class="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
          >
            <div class="flex items-center justify-between gap-2">
              <span
                class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800 shadow-inner"
              >
                {{ option.label }}
              </span>
              <label class="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <input v-model="option.include" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-blue-600" />
                Include in estimate
              </label>
            </div>

            <p class="text-sm text-slate-600">{{ option.description }}</p>

            <div class="space-y-1">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Base price</p>
              <div
                class="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 shadow-inner"
              >
                <span class="text-slate-500">$</span>
                <input
                  v-model.number="option.basePrice"
                  type="number"
                  min="0"
                  class="w-full bg-transparent text-right text-sm font-semibold text-slate-900 outline-none"
                />
              </div>
            </div>

            <ul class="space-y-1 text-sm text-slate-600">
              <li v-for="item in option.lineItems" :key="item" class="flex items-start gap-2">
                <span class="mt-1 h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                <span>{{ item }}</span>
              </li>
            </ul>

            <button
              type="button"
              class="text-sm font-semibold text-blue-600 underline-offset-4 transition hover:underline"
              @click="
                noteVisibility[option.id] = !noteVisibility[option.id];
                logAction('Toggle note', { id: option.id, open: noteVisibility[option.id] });
              "
            >
              {{ noteVisibility[option.id] ? "Hide note" : "Add note" }}
            </button>

            <textarea
              v-if="noteVisibility[option.id]"
              v-model="option.notes"
              rows="2"
              class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-blue-300 focus:outline-none"
              placeholder="Add a quick note about materials or scope..."
            />
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-3 space-y-1">
          <h3 class="text-lg font-semibold text-slate-900">Adjustments &amp; Ranges</h3>
          <p class="text-sm text-slate-600">Use ranges to give the client a realistic window without overpromising.</p>
        </div>

        <div class="space-y-3">
          <div
            v-for="option in options"
            :key="option.id"
            class="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-3 py-3 shadow-inner sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="flex items-center gap-2">
              <span
                class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm"
              >
                {{ option.label }}
              </span>
              <span class="text-xs text-slate-500">{{ option.include ? "Showing to client" : "Hidden" }}</span>
            </div>

            <div class="flex flex-1 flex-wrap items-center gap-3 sm:justify-end">
              <label class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Low
                <div
                  class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm"
                >
                  <span class="text-slate-500">$</span>
                  <input
                    v-model.number="option.lowEstimate"
                    type="number"
                    min="0"
                    class="w-24 bg-transparent text-right text-sm font-semibold text-slate-900 outline-none"
                  />
                </div>
              </label>
              <label class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                High
                <div
                  class="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm"
                >
                  <span class="text-slate-500">$</span>
                  <input
                    v-model.number="option.highEstimate"
                    type="number"
                    min="0"
                    class="w-24 bg-transparent text-right text-sm font-semibold text-slate-900 outline-none"
                  />
                </div>
              </label>
              <span class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                +/- 5-10% range
              </span>
            </div>
          </div>
        </div>

        <div class="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 shadow-inner">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Displayed estimate range for client:</p>
          <p class="mt-1 text-sm font-semibold text-slate-900">
            {{ rangeSummary }}
          </p>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">Visit &amp; Deposit (Preview Only)</h3>
            <p class="text-sm text-slate-600">Prep the handoff to SmartProposal without committing anything live.</p>
          </div>
          <span class="text-xs text-slate-500">Pure UI - hooks later</span>
        </div>

        <div class="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 shadow-inner sm:flex-row sm:items-center sm:justify-between">
          <div class="flex flex-col">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Next Site Visit</p>
            <p class="text-sm font-semibold text-slate-900">{{ nextVisit }}</p>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
            @click="logAction('Edit site visit clicked', nextVisit)"
          >
            Edit
          </button>
        </div>

        <div class="mt-4 space-y-2">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Deposit Type</p>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold shadow-sm transition"
              :class="
                depositMode === 'flat'
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              "
              @click="depositMode = 'flat'; logAction('Deposit mode changed', 'flat')"
            >
              Flat {{ formatCurrency(flatDeposit) }} deposit
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold shadow-sm transition"
              :class="
                depositMode === 'percent'
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              "
              @click="depositMode = 'percent'; logAction('Deposit mode changed', 'percent')"
            >
              {{ percentDeposit }}% of selected option
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold shadow-sm transition"
              :class="
                depositMode === 'none'
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              "
              @click="depositMode = 'none'; logAction('Deposit mode changed', 'none')"
            >
              No deposit for QuickQuote
            </button>
          </div>
        </div>

        <p class="mt-3 text-sm text-slate-600">{{ depositDescription }}</p>
      </section>
    </div>

    <footer
      class="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/90 px-4 py-3 shadow-[0_-4px_14px_rgba(15,23,42,0.06)] backdrop-blur sm:px-6 lg:px-8"
    >
      <div class="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-xs text-slate-500">Prototype only. No real emails or texts are sent.</p>
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            @click="logAction('Save draft clicked', { options, depositMode })"
          >
            Save Draft
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700"
            @click="logAction('Preview QuickQuote clicked')"
          >
            Preview Client View
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100"
            @click="logAction('Send QuickQuote clicked', { options })"
          >
            Send QuickQuote
          </button>
        </div>
      </div>
    </footer>
  </div>
</template>
