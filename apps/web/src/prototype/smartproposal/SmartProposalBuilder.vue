<script setup lang="ts">
import { computed, reactive, ref, toRef } from "vue";
import { useRouter } from "vue-router";
import AddLineItemModal from "./AddLineItemModal.vue";
import DepositPreviewCard from "./DepositPreviewCard.vue";
import OptionCard from "./OptionCard.vue";
import SummarySection from "./SummarySection.vue";
import { useOptionTotals } from "./useOptionTotals";
import type { LineItem, OptionKey, ProposalOption } from "./types";

const router = useRouter();

const lead = reactive({
  name: "Sarah Thompson",
  email: "sarah.t@example.com",
  phone: "(415) 555-2109",
  location: "San Mateo, CA",
  jobType: "Deck",
  subtype: "Composite surface",
  visitNotes: "Walked the yard, confirmed access on north side. Client prefers hidden fasteners.",
  quickQuoteRange: "$18,600 - $22,400",
});

const options = reactive<Record<OptionKey, ProposalOption>>({
  good: {
    label: "Good",
    items: [
      { id: "g1", name: "Basic Decking", cost: 2400, price: 4200, desc: "Pressure-treated framing and surface", included: true, category: "structure" },
      { id: "g2", name: "Standard Railing", cost: 800, price: 1400, desc: "Code-compliant wood railing", included: true, category: "hardware" },
    ],
  },
  better: {
    label: "Better",
    items: [
      { id: "b1", name: "Composite Decking", cost: 3800, price: 6200, desc: "Low-maintenance surface upgrade", included: true, category: "surface" },
      { id: "b2", name: "Aluminum Railing", cost: 1100, price: 1900, desc: "Powder-coated black rail", included: true, category: "hardware" },
    ],
  },
  best: {
    label: "Best",
    items: [
      { id: "bs1", name: "Premium Composite Decking", cost: 5400, price: 8600, desc: "Luxury capped boards with hidden fasteners", included: true, category: "surface" },
      { id: "bs2", name: "Glass Railing", cost: 2600, price: 4200, desc: "Frameless glass railing system", included: true, category: "upgrade" },
    ],
  },
});

const summary = ref(
  "Here are three tailored options for your project. Each includes the essentials, with upgrades shown in Better and Best."
);
const upgradeNotes = reactive([
  { id: "up1", label: "Composite upgrade", enabled: true },
  { id: "up2", label: "Railing upgrade", enabled: true },
  { id: "up3", label: "Footing upgrade", enabled: false },
]);

const depositMode = ref<"percent" | "flat" | "none">("percent");
const depositPercent = ref(15);
const depositFlat = ref(1200);

const addModalOpen = ref(false);
const primaryPreviewOption = ref<OptionKey>("better");

const accents: Record<OptionKey, { pill: string; ring: string; text: string; chip: string }> = {
  good: {
    pill: "bg-slate-800",
    ring: "border-slate-200",
    text: "text-slate-700",
    chip: "bg-slate-100 text-slate-700",
  },
  better: {
    pill: "bg-blue-600",
    ring: "border-blue-100",
    text: "text-blue-700",
    chip: "bg-blue-50 text-blue-700",
  },
  best: {
    pill: "bg-emerald-600",
    ring: "border-emerald-100",
    text: "text-emerald-700",
    chip: "bg-emerald-50 text-emerald-700",
  },
};

const optionTotals = {
  good: useOptionTotals(toRef(options, "good")),
  better: useOptionTotals(toRef(options, "better")),
  best: useOptionTotals(toRef(options, "best")),
};

const regenerateSummary = () => {
  summary.value =
    "Here are three tailored options for your project. Good covers the essentials, Better adds durability, and Best unlocks premium finishes with higher protection.";
};

const updateLabel = (optionKey: OptionKey, value: string) => {
  options[optionKey].label = value || options[optionKey].label;
};

const updateItem = (optionKey: OptionKey, payload: { id: string; field: keyof LineItem; value: unknown }) => {
  const target = options[optionKey].items.find((item) => item.id === payload.id);
  if (!target) return;
  // @ts-expect-error dynamic assignment
  target[payload.field] = payload.value as never;
};

const toggleItem = (optionKey: OptionKey, payload: { id: string; value: boolean }) => {
  const target = options[optionKey].items.find((item) => item.id === payload.id);
  if (!target) return;
  target.included = payload.value;
};

const removeItem = (optionKey: OptionKey, id: string) => {
  const list = options[optionKey].items;
  const idx = list.findIndex((item) => item.id === id);
  if (idx >= 0) list.splice(idx, 1);
};

const handleAddFromModal = (payload: { target: OptionKey | "all"; item: LineItem }) => {
  const targets: OptionKey[] = payload.target === "all" ? ["good", "better", "best"] : [payload.target];
  targets.forEach((key) => {
    const clone: LineItem = {
      ...payload.item,
      id: `${key}-${payload.item.id}`,
      included: true,
    };
    options[key].items.push(clone);
  });
};

const summaryPayload = computed(() => ({
  options: (Object.keys(options) as OptionKey[]).map((key) => ({
    key,
    label: options[key].label,
    totalPrice: optionTotals[key].totalPrice.value,
    items: options[key].items.filter((item) => item.included !== false),
  })),
  deposit: {
    mode: depositMode.value,
    percent: depositPercent.value,
    flat: depositFlat.value,
  },
  summary: summary.value,
  upgrades: upgradeNotes.filter((note) => note.enabled).map((note) => note.label),
}));

const previewBaseAmount = computed(
  () => optionTotals[primaryPreviewOption.value].totalPrice.value || optionTotals.better.totalPrice.value
);

const previewClientView = () => {
  const payload = summaryPayload.value;
  const encoded = encodeURIComponent(JSON.stringify(payload));
  router.push({
    path: "/prototype/smartproposal/client",
    query: {
      option: primaryPreviewOption.value,
      payload: encoded,
    },
  });
};

const sendProposal = () => {
  console.log("[SmartProposal] prototype send", {
    summary: summary.value,
    options: summaryPayload.value.options,
    deposit: summaryPayload.value.deposit,
  });
};

const saveDraft = () => {
  console.log("[SmartProposal] prototype save draft", summaryPayload.value);
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <div class="mx-auto flex max-w-6xl flex-col gap-4 px-4 pb-28 pt-6 sm:px-6 lg:px-8">
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
                <p class="text-lg font-semibold text-slate-900">SmartProposal Builder</p>
                <span
                  class="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-inner"
                >
                  Prototype Only
                </span>
              </div>
              <p class="text-sm text-slate-500">Build your 3-option proposal. Clients choose what fits best.</p>
            </div>
          </div>
          <div class="flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-inner">
            Tesla-style Good / Better / Best
          </div>
        </div>
      </header>

      <section
        class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:shadow-md sm:px-6 sm:py-5"
      >
        <div class="mb-3 flex items-center justify-between gap-3">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Lead overview</p>
            <h2 class="text-lg font-semibold text-slate-900">{{ lead.name }} - {{ lead.jobType }} ({{ lead.subtype }})</h2>
            <p class="text-xs text-slate-500">Visit notes: {{ lead.visitNotes }}</p>
          </div>
          <div class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 shadow-inner">
            QuickQuote: {{ lead.quickQuoteRange }}
          </div>
        </div>
        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-3">
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-inner">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Client</p>
              <p class="text-sm font-semibold text-slate-900">{{ lead.name }}</p>
              <p class="text-sm text-slate-600">{{ lead.email }}</p>
              <p class="text-sm text-slate-600">{{ lead.phone }}</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-inner">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Location</p>
              <p class="text-sm font-medium text-slate-800">{{ lead.location }}</p>
            </div>
          </div>
          <div class="space-y-3">
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-inner">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Job type</p>
              <p class="text-sm font-semibold text-slate-900">{{ lead.jobType }} - {{ lead.subtype }}</p>
            </div>
            <div class="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-inner">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Visit notes</p>
              <p class="text-sm text-slate-700">{{ lead.visitNotes }}</p>
            </div>
          </div>
        </div>
      </section>

      <div class="grid gap-4 lg:grid-cols-3">
        <OptionCard
          option-key="good"
          :option="options.good"
          :accent="accents.good"
          @update:label="(val) => updateLabel('good', val)"
          @update:item="(payload) => updateItem('good', payload)"
          @toggle="(payload) => toggleItem('good', payload)"
          @remove="(id) => removeItem('good', id)"
          @add-line-item="() => (addModalOpen.value = true)"
        />
        <OptionCard
          option-key="better"
          :option="options.better"
          :accent="accents.better"
          @update:label="(val) => updateLabel('better', val)"
          @update:item="(payload) => updateItem('better', payload)"
          @toggle="(payload) => toggleItem('better', payload)"
          @remove="(id) => removeItem('better', id)"
          @add-line-item="() => (addModalOpen.value = true)"
        />
        <OptionCard
          option-key="best"
          :option="options.best"
          :accent="accents.best"
          @update:label="(val) => updateLabel('best', val)"
          @update:item="(payload) => updateItem('best', payload)"
          @toggle="(payload) => toggleItem('best', payload)"
          @remove="(id) => removeItem('best', id)"
          @add-line-item="() => (addModalOpen.value = true)"
        />
      </div>

      <SummarySection
        :summary="summary"
        :upgrade-notes="upgradeNotes"
        @update:summary="(val) => (summary.value = val)"
        @regenerate="regenerateSummary"
        @toggle-upgrade="({ id, value }) => { const target = upgradeNotes.find((note) => note.id === id); if (target) target.enabled = value; }"
      />

      <DepositPreviewCard
        :deposit-mode="depositMode"
        :deposit-percent="depositPercent"
        :deposit-flat="depositFlat"
        :base-amount="previewBaseAmount"
      />
    </div>

    <footer
      class="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-4px_14px_rgba(15,23,42,0.06)] backdrop-blur sm:px-6 lg:px-8"
    >
      <div class="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>Prototype only. No real sends.</span>
          <div class="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
            <span class="text-[11px] font-semibold text-slate-700">Preview option</span>
            <div class="flex items-center gap-1">
              <button
                v-for="key in ['good', 'better', 'best']"
                :key="key"
                type="button"
                class="rounded-full px-2 py-0.5 text-xs font-semibold capitalize transition"
                :class="primaryPreviewOption === key ? 'bg-slate-900 text-white shadow' : 'bg-white text-slate-700 border border-slate-200'"
                @click="primaryPreviewOption.value = key as OptionKey"
              >
                {{ key }}
              </button>
            </div>
          </div>
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
            @click="sendProposal"
          >
            Send Proposal
          </button>
        </div>
      </div>
    </footer>

    <AddLineItemModal :open="addModalOpen" @close="addModalOpen.value = false" @add="handleAddFromModal" />
  </div>
</template>
