<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  InformationCircleIcon,
} from "@heroicons/vue/24/outline";
import { addTimelineEvent } from "@/prototype/contractor/usePrototypeEvents";
import MiniProfitPulse from "@/components/quickquote/MiniProfitPulse.vue";
import ConfidenceMeter from "@/components/quickquote/ConfidenceMeter.vue";
import ClientSummaryBox from "@/components/quickquote/ClientSummaryBox.vue";

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

const costBasis = reactive<Record<QQOption["id"], number>>({
  good: 9500,
  better: 11800,
  best: 14500,
});

const costTouched = reactive<Record<QQOption["id"], boolean>>({
  good: false,
  better: false,
  best: false,
});

const optionExpanded = ref<Record<QQOption["id"], boolean>>({
  good: true,
  better: false,
  best: false,
});

const rangeTouched = reactive<Record<QQOption["id"], { low: boolean; high: boolean }>>({
  good: { low: false, high: false },
  better: { low: false, high: false },
  best: { low: false, high: false },
});

const rangesOpen = ref(true);

const depositMode = ref<"none" | "flat" | "percent">("none");
const flatDeposit = ref(1000);
const percentDeposit = ref(20);
const nextVisit = ref("Tomorrow at 3 PM");
const baseChangePulse = ref(0);

const router = useRouter();

const draftStore = reactive<{
  lastSavedAt: string | null;
  payload: unknown;
}>({
  lastSavedAt: null,
  payload: null,
});

const clientSummary = ref("");
const clientSummaryEdited = ref(false);

const logAction = (label: string, payload?: unknown) => {
  console.log("[QuickQuoteBuilder]", label, payload);
};

const formatCurrency = (value: number): string =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const formatDisplayTime = (date: Date): string =>
  date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

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

const markRangeTouched = (id: QQOption["id"], field: "low" | "high") => {
  rangeTouched[id][field] = true;
};

const applyQuickRange = (option: QQOption, percent: number) => {
  const base = option.basePrice || 0;
  const delta = Math.abs(percent);
  rangeTouched[option.id].low = true;
  rangeTouched[option.id].high = true;
  option.lowEstimate = Math.max(0, Math.round(base * (1 - delta)));
  option.highEstimate = Math.max(0, Math.round(base * (1 + delta)));
  logAction("Quick range applied", { id: option.id, percent });
};

const getFormSnapshot = () => ({
  options: options.value.map((option) => ({ ...option })),
  depositMode: depositMode.value,
  flatDeposit: flatDeposit.value,
  percentDeposit: percentDeposit.value,
  nextVisit: nextVisit.value,
  costBasis: { ...costBasis },
  summary: clientSummary.value,
});

const saveDraft = () => {
  draftStore.payload = getFormSnapshot();
  draftStore.lastSavedAt = new Date().toISOString();
  logAction("Save draft clicked", draftStore.payload);
};

const previewClientView = () => {
  logAction("Preview QuickQuote clicked");
  router.push("/prototype/quickquote-client-preview");
};

const sendQuickQuote = () => {
  const sentAt = new Date();
  addTimelineEvent({
    type: "quickquote",
    title: "QuickQuote sent",
    meta: "QuickQuote",
    description: "Prototype QuickQuote sent to Sarah Thompson.",
    time: formatDisplayTime(sentAt),
    icon: "Sparkles",
  });
  logAction("Send QuickQuote clicked", { sentAt: sentAt.toISOString(), payload: getFormSnapshot() });
  router.push("/prototype/hq");
};

const jobType = "Deck - Composite";
const materials = "your chosen materials";

const generateSummary = () => {
  const included = options.value.filter((option) => option.include);
  const goodLow = included.length ? Math.min(...included.map((o) => o.lowEstimate)) : options.value[0].lowEstimate;
  const bestHigh = included.length ? Math.max(...included.map((o) => o.highEstimate)) : options.value[options.value.length - 1].highEstimate;
  return (
    `For your ${jobType}, we've prepared Good, Better, and Best options with a range from ${formatCurrency(goodLow)}-${formatCurrency(bestHigh)}. ` +
    `These numbers reflect typical projects of this size using ${materials}. ` +
    "Final price will be confirmed after an on-site visit. " +
    "We aim to give you a realistic window without overpricing or underpricing."
  );
};

watch(
  () => options.value.map((option) => option.basePrice),
  (prices) => {
    options.value.forEach((option, index) => {
      const base = prices[index] ?? option.basePrice;
      if (!rangeTouched[option.id].low) {
        option.lowEstimate = Math.max(0, Math.round(base * 0.93));
      }
      if (!rangeTouched[option.id].high) {
        option.highEstimate = Math.max(0, Math.round(base * 1.07));
      }
    });
    baseChangePulse.value++;
  },
  { immediate: true }
);

watch(
  options,
  () => {
    if (!clientSummaryEdited.value) {
      clientSummary.value = generateSummary();
    }
  },
  { deep: true, immediate: true }
);
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
              @click="logAction('Back to HQ')"
            >
              <span class="text-lg leading-none">&larr;</span>
              <span>Back to HQ</span>
            </button>
            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-2">
                <p class="text-lg font-semibold text-slate-900">QuickQuote</p>
                <span
                  class="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-inner"
                >
                  Draft
                </span>
              </div>
              <p class="text-sm text-slate-500">New estimate builder &bull; confidence: early estimate only</p>
            </div>
          </div>
          <div class="flex flex-col items-start gap-1 text-right text-xs text-slate-500 sm:items-end">
            <span class="rounded-full border border-blue-100 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
              Prototype Only
            </span>
            <span class="text-[11px] text-slate-500">Actions are wired to logs + prototype stores</span>
          </div>
        </div>
      </header>

      <section
        class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:shadow-md sm:px-6 sm:py-5"
      >
        <div class="mb-3 flex items-center justify-between gap-3">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Lead &amp; Job Overview</p>
            <h2 class="text-lg font-semibold text-slate-900">Sarah Thompson - Maple St Deck</h2>
          </div>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 shadow-inner">
            QuickQuote only
          </span>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
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

      <section
        class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:shadow-md sm:px-6 sm:py-5"
      >
        <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-semibold text-slate-900">Estimate Options</h3>
              <InformationCircleIcon
                class="h-4 w-4 text-slate-400"
                title="Material choice - Site conditions - Permit requirements - Labor complexity"
              />
            </div>
            <p class="text-sm text-slate-500">Offer simple choices your client can understand.</p>
          </div>
          <span class="text-xs text-slate-500">Confidence hint: quick range, not final scope</span>
        </div>

        <div class="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="option in options"
            :key="option.id"
            class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md sm:px-5"
          >
            <div class="flex items-center gap-3">
              <span
                class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800 shadow-inner"
              >
                {{ option.label }}
              </span>
              <button
                type="button"
                class="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 sm:hidden"
                @click="optionExpanded[option.id] = !optionExpanded[option.id]"
              >
                <ChevronDownIcon
                  class="h-4 w-4 transition"
                  :class="optionExpanded[option.id] ? 'rotate-180' : 'rotate-0'"
                />
              </button>
              <label class="relative inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-700">
                <input v-model="option.include" type="checkbox" class="peer sr-only" />
                <span
                  class="flex h-5 w-9 items-center rounded-full border border-slate-300 bg-slate-100 px-1 transition peer-checked:border-blue-500 peer-checked:bg-blue-600"
                >
                  <span
                    class="h-3.5 w-3.5 rounded-full bg-white shadow-sm transition peer-checked:translate-x-4"
                  ></span>
                </span>
                <span class="hidden sm:inline">Include in estimate</span>
                <span class="sm:hidden">Include</span>
              </label>
            </div>

            <div
              :class="[
                'flex flex-col gap-3 sm:gap-4 overflow-hidden transition-all duration-300 sm:max-h-none sm:overflow-visible sm:opacity-100 sm:transition-none',
                optionExpanded[option.id] ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 sm:opacity-100',
              ]"
            >
              <p class="text-sm text-slate-600">{{ option.description }}</p>

              <div class="space-y-1">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Base price</p>
                <div
                  class="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold tracking-tight text-slate-900 shadow-inner"
                >
                  <span class="text-slate-500">$</span>
                  <input
                    v-model.number="option.basePrice"
                    type="number"
                    min="0"
                    class="w-full bg-transparent text-right text-sm font-bold tracking-tight text-slate-900 outline-none"
                  />
                </div>
              </div>

              <ul class="space-y-2 text-sm text-slate-600">
                <li v-for="item in option.lineItems" :key="item" class="flex items-start gap-2">
                  <CheckCircleIcon class="mt-[2px] h-3.5 w-3.5 text-emerald-500" />
                  <span>{{ item }}</span>
                </li>
              </ul>

              <button
                type="button"
                class="text-xs font-semibold text-blue-600 underline-offset-4 hover:underline"
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
        </div>
      </section>

      <MiniProfitPulse
        :options="options"
        :cost-basis="costBasis"
        :touched="costTouched"
        class="transition-all duration-300 ease-out"
        @update-cost-basis="
          costBasis[$event.id] = $event.value;
          costTouched[$event.id] = true;
          logAction('Cost basis updated', $event);
        "
      />

      <section
        class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:shadow-md sm:px-6 sm:py-5"
      >
        <button
          type="button"
          class="flex w-full items-center justify-between text-left"
          @click="rangesOpen = !rangesOpen"
        >
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-semibold text-slate-900">Adjustments &amp; Ranges</h3>
              <InformationCircleIcon
                class="h-4 w-4 text-slate-400"
                title="Material choice - Site conditions - Permit requirements - Labor complexity"
              />
            </div>
            <p class="text-sm text-slate-500">Use ranges to give the client a realistic window without overpromising.</p>
          </div>
          <ChevronDownIcon
            class="h-5 w-5 text-slate-500 transition"
            :class="rangesOpen ? 'rotate-180' : 'rotate-0'"
          />
        </button>

        <div
          :class="[
            'mt-3 space-y-3 overflow-hidden transition-all duration-300',
            rangesOpen ? 'max-h-[1500px] opacity-100' : 'max-h-0 opacity-0',
          ]"
        >
          <div
            v-for="option in options"
            :key="option.id"
            class="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 shadow-inner sm:flex-row sm:items-center sm:justify-between"
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
                  class="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold tracking-tight text-slate-900 shadow-inner"
                >
                  <span class="text-slate-500">$</span>
                  <input
                    v-model.number="option.lowEstimate"
                    type="number"
                    min="0"
                    class="w-24 bg-transparent text-right text-sm font-bold tracking-tight text-slate-900 outline-none"
                    @input="markRangeTouched(option.id, 'low')"
                  />
                </div>
              </label>
              <label class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                High
                <div
                  class="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold tracking-tight text-slate-900 shadow-inner"
                >
                  <span class="text-slate-500">$</span>
                  <input
                    v-model.number="option.highEstimate"
                    type="number"
                    min="0"
                    class="w-24 bg-transparent text-right text-sm font-bold tracking-tight text-slate-900 outline-none"
                    @input="markRangeTouched(option.id, 'high')"
                  />
                </div>
              </label>
              <div class="flex flex-wrap items-center gap-2">
                <button
                  v-for="percent in [-0.1, -0.05, 0.05, 0.1]"
                  :key="percent"
                  type="button"
                  class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
                  @click="applyQuickRange(option, percent)"
                >
                  {{ percent > 0 ? `+${Math.round(percent * 100)}%` : `${Math.round(percent * 100)}%` }}
                </button>
                <span class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                  +/- 5-10% range
                </span>
              </div>
            </div>
          </div>

          <div class="rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">Displayed estimate range for client:</span>
            <div class="mt-1">{{ rangeSummary }}</div>
          </div>
        </div>

        <div class="mt-4 space-y-2">
          <div class="flex items-center gap-2">
            <h4 class="text-sm font-semibold text-slate-900">Confidence</h4>
            <InformationCircleIcon
              class="h-4 w-4 text-slate-400"
              title="Tighter ranges increase confidence. Wide ranges reduce confidence."
            />
          </div>
          <div class="space-y-3">
            <ConfidenceMeter
              v-for="option in options"
              :key="option.id"
              :label="option.label"
              :low="option.lowEstimate"
              :high="option.highEstimate"
              :base="option.basePrice"
              :pulse-key="baseChangePulse"
            />
          </div>
        </div>

        <ClientSummaryBox
          class="mt-4"
          :summary="clientSummary"
          :manual="clientSummaryEdited"
          @update:summary="clientSummary = $event"
          @manual-edit="clientSummaryEdited = true"
          @regenerate="
            clientSummaryEdited = false;
            clientSummary = generateSummary();
          "
        />
      </section>

      <section
        class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:shadow-md sm:px-6 sm:py-5"
      >
        <div class="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">Visit &amp; Deposit (Preview Only)</h3>
            <p class="text-sm text-slate-500">Prep the handoff to SmartProposal without committing anything live.</p>
          </div>
          <span class="text-[11px] text-slate-500">Pure UI - prototype only</span>
        </div>

        <div class="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 shadow-inner sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-2">
            <div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-700 shadow-inner">
              <CalendarDaysIcon class="h-5 w-5" />
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Next Site Visit</p>
              <p class="text-sm font-semibold text-slate-900">
                <span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm">{{ nextVisit }}</span>
              </p>
            </div>
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
              class="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm transition"
              :class="
                depositMode === 'flat'
                  ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              "
              @click="depositMode = 'flat'; logAction('Deposit mode changed', 'flat')"
            >
              Flat {{ formatCurrency(flatDeposit) }}
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm transition"
              :class="
                depositMode === 'percent'
                  ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              "
              @click="depositMode = 'percent'; logAction('Deposit mode changed', 'percent')"
            >
              {{ percentDeposit }}% of selected option
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm transition"
              :class="
                depositMode === 'none'
                  ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              "
              @click="depositMode = 'none'; logAction('Deposit mode changed', 'none')"
            >
              No deposit
            </button>
          </div>
        </div>

        <div class="mt-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-sm text-slate-600">{{ depositDescription }}</p>
          <p class="text-[11px] text-slate-500">Prototype only</p>
        </div>
      </section>
    </div>

    <footer
      class="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-4px_14px_rgba(15,23,42,0.06)] backdrop-blur sm:px-6 lg:px-8"
    >
      <div class="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="space-y-0.5 text-xs text-slate-500">
          <p>Prototype only. No real emails or texts are sent.</p>
          <p v-if="draftStore.lastSavedAt">Draft saved {{ formatDisplayTime(new Date(draftStore.lastSavedAt)) }}</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            @click="saveDraft"
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
        </div>
      </div>
    </footer>
  </div>
</template>
