<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import AdvancedEditor from "./AdvancedEditor.vue";
import ProposalCard from "./ProposalCard.vue";
import UpgradeSelector from "./UpgradeSelector.vue";
import { buildClientCopy } from "./ClientCopyGenerator";
import { buildProposalFromTemplate } from "./SummaryGenerator";
import type { LineItem, OptionKey, ProposalOption } from "./types";

const router = useRouter();

const template = reactive({
  client: {
    name: "Sarah Thompson",
    email: "sarah.t@example.com",
    phone: "(415) 555-2109",
  },
  location: "San Mateo, CA",
  jobType: "Deck",
  subtype: "Composite surface",
  visitNotes: "Walked the yard, confirmed access on north side. Prefers hidden fasteners.",
  quickQuoteRange: "$18,600 - $22,400",
  baseScope: ["Structural framing", "Standard rails", "Stairs + landings"],
  baseLineItems: [
    { id: "b1", name: "Framing & footings", cost: 4200, price: 7600, desc: "Pressure-treated structure" },
    { id: "b2", name: "Standard railing", cost: 1100, price: 1800, desc: "Code-compliant rail system" },
    { id: "b3", name: "Stairs & landings", cost: 900, price: 1600, desc: "Two flights with landings" },
  ] as LineItem[],
  upgrades: [
    {
      id: "up1",
      label: "Composite surface",
      desc: "Low-maintenance boards with hidden fasteners.",
      appliesTo: ["better", "best"],
      scopeAdd: ["Composite decking surface", "Hidden fasteners"],
      lineItems: [
        { id: "up1a", name: "Composite decking", cost: 1800, price: 3400, desc: "Capped composite boards" },
        { id: "up1b", name: "Hidden fasteners", cost: 280, price: 640, desc: "Clean finish" },
      ],
    },
    {
      id: "up2",
      label: "Aluminum railing",
      desc: "Sleek black rail for durability.",
      appliesTo: ["better", "best"],
      scopeAdd: ["Powder-coated aluminum railing"],
      lineItems: [{ id: "up2a", name: "Aluminum rail kit", cost: 900, price: 1700, desc: "Black finish" }],
    },
    {
      id: "up3",
      label: "Lighting package",
      desc: "Stair + perimeter lights for safety.",
      appliesTo: ["best"],
      scopeAdd: ["Integrated stair lighting"],
      lineItems: [{ id: "up3a", name: "Lighting kit", cost: 320, price: 820, desc: "Warm white LEDs" }],
    },
    {
      id: "up4",
      label: "Premium glass rail",
      desc: "Frameless glass for clear views.",
      appliesTo: ["best"],
      scopeAdd: ["Frameless glass railing"],
      lineItems: [{ id: "up4a", name: "Glass panels", cost: 1800, price: 3600, desc: "Tempered glass system" }],
    },
  ],
  deposit: { mode: "percent", percent: 15, flat: 0 },
});

const selectedUpgrades = reactive<Record<OptionKey, string[]>>({
  good: template.upgrades.filter((u) => u.appliesTo?.includes("good")).map((u) => u.id),
  better: template.upgrades.filter((u) => u.appliesTo?.includes("better")).map((u) => u.id),
  best: template.upgrades.filter((u) => u.appliesTo?.includes("best")).map((u) => u.id),
});

const proposal = computed(() => buildProposalFromTemplate(template, selectedUpgrades));
const clientCopy = computed(() => buildClientCopy(proposal.value.options));

const upgradeModalOpen = ref(false);
const activeUpgradeOption = ref<OptionKey | null>(null);

const advancedOpen = ref(false);
const advancedOption = ref<ProposalOption | null>(null);

const primaryPreviewOption = ref<OptionKey>("better");

const accents: Record<OptionKey, string> = {
  good: "bg-slate-800",
  better: "bg-blue-600",
  best: "bg-emerald-600",
};

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const openUpgradeModal = (option: OptionKey) => {
  activeUpgradeOption.value = option;
  upgradeModalOpen.value = true;
};

const handleToggleUpgrade = (payload: { option: OptionKey; id: string; value: boolean }) => {
  const list = selectedUpgrades[payload.option];
  const exists = list.includes(payload.id);
  if (payload.value && !exists) {
    list.push(payload.id);
  }
  if (!payload.value && exists) {
    const idx = list.indexOf(payload.id);
    if (idx >= 0) list.splice(idx, 1);
  }
};

const openAdvanced = (optionKey: OptionKey) => {
  const option = proposal.value.options[optionKey];
  advancedOption.value = {
    label: option.label,
    items: option.items,
  };
  advancedOpen.value = true;
};

const closeAdvanced = () => {
  advancedOpen.value = false;
};

const previewClientView = () => {
  const payload = {
    proposal: proposal.value,
    copy: clientCopy.value,
    primary: primaryPreviewOption.value,
  };
  const encoded = encodeURIComponent(JSON.stringify(payload));
  router.push({
    path: "/prototype/smartproposal/client",
    query: { payload: encoded, option: primaryPreviewOption.value },
  });
};

const saveDraft = () => {
  console.log("[SmartProposal] Save draft (prototype)", { proposal: proposal.value, copy: clientCopy.value });
};

const sendProposal = () => {
  console.log("[SmartProposal] Send proposal (prototype)", { proposal: proposal.value, copy: clientCopy.value });
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
                <p class="text-lg font-semibold text-slate-900">SmartProposal Builder</p>
                <span
                  class="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-inner"
                >
                  Prototype Only
                </span>
              </div>
              <p class="text-sm text-slate-500">Simple toggles. We handle the math behind the scenes.</p>
            </div>
          </div>
          <div class="flex flex-col items-end gap-1 text-right">
            <span class="text-sm font-semibold text-slate-900">{{ template.client.name }}</span>
            <p class="text-xs text-slate-500">{{ template.jobType }} · {{ template.subtype }}</p>
            <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 shadow-inner">
              QuickQuote: {{ template.quickQuoteRange }}
            </span>
          </div>
        </div>
      </header>

      <section
        class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:shadow-md sm:px-6 sm:py-5"
      >
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-3">
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-inner">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Client</p>
              <p class="text-sm font-semibold text-slate-900">{{ template.client.name }}</p>
              <p class="text-sm text-slate-600">{{ template.client.email }}</p>
              <p class="text-sm text-slate-600">{{ template.client.phone }}</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-inner">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Location</p>
              <p class="text-sm font-medium text-slate-800">{{ template.location }}</p>
            </div>
          </div>
          <div class="space-y-3">
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-inner">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Visit notes</p>
              <p class="text-sm text-slate-700">{{ template.visitNotes }}</p>
            </div>
            <div class="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-inner">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Base scope</p>
              <ul class="mt-1 space-y-1 text-sm text-slate-800">
                <li v-for="item in template.baseScope" :key="item" class="flex items-start gap-2">
                  <span class="mt-1 h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div class="flex items-center justify-between gap-3">
        <div class="text-sm text-slate-600">
          Toggle upgrades per option. Pricing and margins stay hidden unless you open the advanced editor.
        </div>
        <div class="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
          <span class="text-[11px] uppercase tracking-[0.08em] text-slate-500">Preview option</span>
          <div class="flex items-center gap-1">
            <button
              v-for="key in ['good','better','best']"
              :key="key"
              type="button"
              class="rounded-full px-2 py-0.5 capitalize transition"
              :class="primaryPreviewOption === key ? 'bg-slate-900 text-white shadow' : 'bg-white text-slate-700 border border-slate-200'"
              @click="primaryPreviewOption = key as OptionKey"
            >
              {{ key }}
            </button>
          </div>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-3">
        <ProposalCard
          option-key="good"
          :option="proposal.options.good"
          :accent="accents.good"
          @edit="openUpgradeModal('good')"
          @advanced="openAdvanced('good')"
        />
        <ProposalCard
          option-key="better"
          :option="proposal.options.better"
          :accent="accents.better"
          @edit="openUpgradeModal('better')"
          @advanced="openAdvanced('better')"
        />
        <ProposalCard
          option-key="best"
          :option="proposal.options.best"
          :accent="accents.best"
          @edit="openUpgradeModal('best')"
          @advanced="openAdvanced('best')"
        />
      </div>

      <section class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Client copy</p>
            <h3 class="text-lg font-semibold text-slate-900">{{ clientCopy.headline }}</h3>
            <p class="text-sm text-slate-600">{{ clientCopy.paragraph }}</p>
          </div>
          <div class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
            Deposit preview: {{ formatCurrency(proposal.deposit.amount) }}
          </div>
        </div>
        <ul class="mt-3 space-y-2 text-sm text-slate-800">
          <li v-for="item in clientCopy.bullets" :key="item" class="flex items-start gap-2">
            <span class="mt-1 h-1.5 w-1.5 rounded-full bg-slate-300"></span>
            <span>{{ item }}</span>
          </li>
        </ul>
      </section>
    </div>

    <footer
      class="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-4px_14px_rgba(15,23,42,0.06)] backdrop-blur sm:px-6 lg:px-8"
    >
      <div class="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="space-y-0.5 text-xs text-slate-500">
          <p>Prototype only. Pricing and margins are handled automatically.</p>
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

    <UpgradeSelector
      :open="upgradeModalOpen"
      :option-key="activeUpgradeOption"
      :upgrades="template.upgrades"
      :selected="activeUpgradeOption ? selectedUpgrades[activeUpgradeOption] : []"
      @close="upgradeModalOpen = false"
      @toggle="handleToggleUpgrade"
    />

    <AdvancedEditor :open="advancedOpen" :option="advancedOption" @close="closeAdvanced" />
  </div>
</template>
