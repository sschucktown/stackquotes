<script setup lang="ts">
import { computed, reactive, ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  CalendarDaysIcon,
  InformationCircleIcon,
  SparklesIcon,
} from "@heroicons/vue/24/outline";

type AddOn = {
  id: string;
  label: string;
  price: number;
  cost: number;
  enabled: boolean;
  notes?: string;
};

type TemplateConfig = {
  id: string;
  title: string;
  description: string;
  basePrice: number;
  costBasis: number;
  scope: string[];
  recommendedAddOns: AddOn[];
  complexity: "Low" | "Medium" | "High";
};

const templates: TemplateConfig[] = [
  {
    id: "deck-12x12-pt",
    title: "12x12 Pressure-Treated Deck",
    description: "Starter layout for fast installs and simple framing.",
    basePrice: 14800,
    costBasis: 9500,
    scope: ["Standard framing", "Basic rails", "Simple stairs"],
    recommendedAddOns: [
      { id: "composite-upgrade", label: "Composite Upgrade", price: 3200, cost: 1800, enabled: false },
      { id: "lighting", label: "Lighting Package", price: 1200, cost: 500, enabled: false },
    ],
    complexity: "Low",
  },
  {
    id: "deck-16x20-composite",
    title: "16x20 Composite Deck",
    description: "Composite surface, upgraded rails, skirt boards.",
    basePrice: 19800,
    costBasis: 11800,
    scope: ["Composite surface", "Hidden fasteners", "Upgraded rails"],
    recommendedAddOns: [
      { id: "premium-rails", label: "Premium Rails", price: 1500, cost: 700, enabled: true },
      { id: "lighting", label: "Lighting Package", price: 1400, cost: 600, enabled: false },
    ],
    complexity: "Medium",
  },
  {
    id: "deck-resurface",
    title: "Deck Resurfacing",
    description: "Replace boards and rails, reuse sound framing.",
    basePrice: 17200,
    costBasis: 11000,
    scope: ["Demo old surface", "Inspect framing", "New rails + surface"],
    recommendedAddOns: [
      { id: "fascia", label: "Fascia Wrap", price: 900, cost: 350, enabled: false },
      { id: "lighting", label: "Lighting Package", price: 1100, cost: 450, enabled: false },
    ],
    complexity: "Medium",
  },
  {
    id: "wrap-around",
    title: "Wrap-Around Deck",
    description: "Expanded layout with additional footings and fascia.",
    basePrice: 24800,
    costBasis: 15500,
    scope: ["Multi-side layout", "Extra footings", "Premium fascia"],
    recommendedAddOns: [
      { id: "lighting", label: "Lighting Package", price: 1600, cost: 700, enabled: true },
      { id: "premium-rails", label: "Premium Rails", price: 1800, cost: 900, enabled: true },
    ],
    complexity: "High",
  },
  {
    id: "stair-replacement",
    title: "Stair Replacement",
    description: "Focused repair to replace failing stairs and rails.",
    basePrice: 8600,
    costBasis: 5200,
    scope: ["New stringers", "Treads + rails", "Safety-focused finish"],
    recommendedAddOns: [
      { id: "lighting", label: "Lighting Package", price: 800, cost: 300, enabled: false },
      { id: "composite-upgrade", label: "Composite Upgrade", price: 1400, cost: 700, enabled: false },
    ],
    complexity: "Low",
  },
];

const props = defineProps<{
  prefillTemplate?: string;
}>();

const router = useRouter();
const route = useRoute();

const lead = reactive({
  name: "Sarah Thompson",
  email: "sarah@example.com",
  phone: "(843) 555-0123",
  location: "482 Maple St, Seattle, WA",
  jobType: "Deck",
  subtype: "Composite",
  source: "QuickQuote portal",
});

const basePrice = ref(18600);
const baseCost = ref(11800);
const scopeItems = ref<string[]>(["Composite surface", "Hidden fasteners", "Upgraded rails"]);

const addOns = ref<AddOn[]>([
  { id: "composite-upgrade", label: "Composite Upgrade", price: 3200, cost: 1800, enabled: true },
  { id: "lighting", label: "Lighting Package", price: 1200, cost: 500, enabled: false },
  { id: "premium-rails", label: "Premium Rails", price: 1500, cost: 700, enabled: false },
]);

const templateApplied = ref<TemplateConfig | null>(null);
const clientSummary = ref("");
const clientSummaryEdited = ref(false);
const depositMode = ref<"none" | "flat" | "percent">("none");
const flatDeposit = ref(1000);
const percentDeposit = ref(20);
const nextVisit = ref("Tomorrow at 3 PM");

const rangeVariance = 0.12;

const totalAddOnPrice = computed(() =>
  addOns.value.filter((item) => item.enabled).reduce((sum, item) => sum + (item.price || 0), 0)
);
const totalAddOnCost = computed(() =>
  addOns.value.filter((item) => item.enabled).reduce((sum, item) => sum + (item.cost || 0), 0)
);

const totalPrice = computed(() => basePrice.value + totalAddOnPrice.value);
const totalCost = computed(() => baseCost.value + totalAddOnCost.value);
const margin = computed(() => totalPrice.value - totalCost.value);
const marginPct = computed(() => (totalPrice.value > 0 ? Math.max(0, (margin.value / totalPrice.value) * 100) : 0));

const lowEstimate = computed(() => Math.round(totalPrice.value * (1 - rangeVariance)));
const highEstimate = computed(() => Math.round(totalPrice.value * (1 + rangeVariance)));

const confidenceLevel = computed(() => "High");

const depositDescription = computed(() => {
  switch (depositMode.value) {
    case "flat":
      return `Client will see a ${formatCurrency(flatDeposit.value)} target deposit when converted to SmartProposal.`;
    case "percent":
      return `Client will see ${percentDeposit.value}% of the estimate as a target deposit.`;
    default:
      return "This QuickQuote only previews pricing. Deposit is added later.";
  }
});

const formatCurrency = (value: number): string =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const logAction = (label: string, payload?: unknown) => {
  console.log("[QuickQuoteBuilder]", label, payload);
};

const applyTemplate = (templateId: string | undefined) => {
  const match = templates.find((t) => t.id === templateId);
  if (!match) return;
  templateApplied.value = match;
  basePrice.value = match.basePrice;
  baseCost.value = match.costBasis;
  scopeItems.value = [...match.scope];
  addOns.value = match.recommendedAddOns.map((item) => ({ ...item, notes: item.notes || "" }));
  clientSummaryEdited.value = false;
  clientSummary.value = buildClientSummary();
  logAction("Template applied", match.id);
};

const handleTemplateSwitch = () => {
  router.push({ name: "QuickQuoteTemplateSelector" });
};

const buildClientSummary = () =>
  `Based on your ${lead.jobType.toLowerCase()} scope, materials, and similar projects, your ballpark estimate is between ${formatCurrency(
    lowEstimate.value
  )} and ${formatCurrency(highEstimate.value)}. Final pricing is confirmed after an on-site visit.`;

watch([lowEstimate, highEstimate], () => {
  if (!clientSummaryEdited.value) {
    clientSummary.value = buildClientSummary();
  }
});

onMounted(() => {
  const templateFromRoute = (route.query.template as string) || props.prefillTemplate;
  applyTemplate(templateFromRoute);
  if (!clientSummary.value) {
    clientSummary.value = buildClientSummary();
  }
});

const saveDraft = () => {
  const payload = {
    lead,
    basePrice: basePrice.value,
    baseCost: baseCost.value,
    addOns: addOns.value,
    lowEstimate: lowEstimate.value,
    highEstimate: highEstimate.value,
    templateApplied: templateApplied.value?.id,
  };
  logAction("Save draft", payload);
};

const previewClientView = () => {
  const mockId = "demo";
  router.push({
    path: `/quickquote/${mockId}/preview`,
    query: {
      low: lowEstimate.value,
      high: highEstimate.value,
      job: `${lead.jobType} - ${lead.subtype}`,
    },
  });
  logAction("Preview Client View", { low: lowEstimate.value, high: highEstimate.value });
};

const sendQuickQuote = () => {
  logAction("Send QuickQuote", {
    total: totalPrice.value,
    range: [lowEstimate.value, highEstimate.value],
    addOns: addOns.value,
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
              <span>Back to HQ</span>
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
              <p class="text-sm text-slate-500">Fast ballpark with range, add-ons, and visit preview.</p>
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
            <h2 class="text-lg font-semibold text-slate-900">{{ lead.name }} - {{ lead.jobType }} ({{ lead.subtype }})</h2>
          </div>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 shadow-inner">
            Source: {{ lead.source }}
          </span>
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
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Job Type</p>
              <p class="text-sm font-semibold text-slate-900">{{ lead.jobType }} - {{ lead.subtype }}</p>
            </div>
            <div class="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-sm shadow-inner">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Scope Notes</p>
              <ul class="mt-1 space-y-1 text-sm text-slate-700">
                <li v-for="item in scopeItems" :key="item" class="flex items-start gap-2">
                  <span class="mt-1 h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div
          v-if="templateApplied"
          class="mt-3 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 shadow-inner"
        >
          <div class="flex items-center gap-2">
            <SparklesIcon class="h-4 w-4" />
            <span>Prefilled from template: <strong>{{ templateApplied.title }}</strong></span>
          </div>
          <button
            type="button"
            class="text-xs font-semibold text-emerald-800 underline-offset-4 hover:underline"
            @click="handleTemplateSwitch"
          >
            Switch Template
          </button>
        </div>
      </section>

      <section
        class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:shadow-md sm:px-6 sm:py-5"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">Base Estimate</h3>
            <p class="text-sm text-slate-500">Single price with a quick internal cost view.</p>
          </div>
          <InformationCircleIcon class="h-5 w-5 text-slate-400" />
        </div>

        <div class="mt-3 grid gap-4 sm:grid-cols-3">
          <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 shadow-inner">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Base Price</p>
            <div class="mt-2 flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold tracking-tight text-slate-900 shadow-inner">
              <span class="text-slate-500">$</span>
              <input
                v-model.number="basePrice"
                type="number"
                min="0"
                class="w-full bg-transparent text-right text-sm font-bold tracking-tight text-slate-900 outline-none"
              />
            </div>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 shadow-inner">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Cost Basis (Internal)</p>
            <div class="mt-2 flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-inner">
              <span class="text-slate-500">$</span>
              <input
                v-model.number="baseCost"
                type="number"
                min="0"
                class="w-full bg-transparent text-right text-sm font-semibold text-slate-900 outline-none"
              />
            </div>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 shadow-inner">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Margin (Prototype)</p>
            <p class="mt-2 text-lg font-semibold text-emerald-700">{{ formatCurrency(margin) }}</p>
            <p class="text-sm text-emerald-600">{{ marginPct.toFixed(0) }}% est.</p>
          </div>
        </div>
      </section>

      <section
        class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:shadow-md sm:px-6 sm:py-5"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">Add-Ons</h3>
            <p class="text-sm text-slate-500">Toggle optional extras to include in the ballpark.</p>
          </div>
          <InformationCircleIcon class="h-5 w-5 text-slate-400" />
        </div>

        <div class="mt-3 space-y-3">
          <div
            v-for="addOn in addOns"
            :key="addOn.id"
            class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 shadow-inner transition hover:-translate-y-[1px] hover:shadow-md"
          >
            <div class="flex flex-wrap items-center gap-3">
              <label class="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <input v-model="addOn.enabled" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-blue-600" />
                {{ addOn.label }}
              </label>
              <span class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">Add-on</span>
            </div>
            <div class="mt-3 grid gap-3 sm:grid-cols-3">
              <div class="flex flex-col gap-1">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Price</p>
                <div class="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-inner">
                  <span class="text-slate-500">$</span>
                  <input
                    v-model.number="addOn.price"
                    type="number"
                    min="0"
                    class="w-full bg-transparent text-right text-sm font-semibold text-slate-900 outline-none"
                  />
                </div>
              </div>
              <div class="flex flex-col gap-1">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Cost (internal)</p>
                <div class="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-inner">
                  <span class="text-slate-500">$</span>
                  <input
                    v-model.number="addOn.cost"
                    type="number"
                    min="0"
                    class="w-full bg-transparent text-right text-sm font-semibold text-slate-900 outline-none"
                  />
                </div>
              </div>
              <div class="flex flex-col gap-1">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</p>
                <input
                  v-model="addOn.notes"
                  type="text"
                  placeholder="Optional note"
                  class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-blue-300 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:shadow-md sm:px-6 sm:py-5"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">Estimate Summary</h3>
            <p class="text-sm text-slate-500">Range, confidence, and client-friendly copy.</p>
          </div>
          <InformationCircleIcon class="h-5 w-5 text-slate-400" />
        </div>

        <div class="mt-3 grid gap-4 lg:grid-cols-2">
          <div class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 shadow-inner">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Estimated Range</p>
            <p class="text-2xl font-bold tracking-tight text-slate-900">{{ formatCurrency(lowEstimate) }} - {{ formatCurrency(highEstimate) }}</p>
            <p class="text-sm text-slate-600">This is a ballpark. Final price is verified at the on-site visit.</p>
            <div class="flex items-center gap-2 text-sm">
              <span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">Range auto-calculated</span>
              <span class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">Includes add-ons</span>
            </div>
          </div>

          <div class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 shadow-inner">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Confidence Meter</p>
            <div class="space-y-2">
              <div class="flex items-center justify-between text-sm">
                <span class="font-semibold text-slate-900">Confidence</span>
                <span class="text-sm font-semibold text-emerald-700">{{ confidenceLevel }}</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="flex flex-1 items-center gap-1">
                  <div class="h-2 flex-1 rounded-full bg-emerald-200 animate-pulse"></div>
                  <div class="h-2 flex-1 rounded-full bg-emerald-300 animate-pulse"></div>
                  <div class="h-2 flex-1 rounded-full bg-emerald-400 animate-pulse"></div>
                </div>
                <span class="text-xs text-slate-500">Tight range</span>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <div class="mb-2 flex items-center justify-between">
            <h4 class="text-lg font-semibold text-slate-900">Client Summary</h4>
            <button
              v-if="clientSummaryEdited"
              type="button"
              class="text-xs font-semibold text-blue-600 underline-offset-4 hover:underline"
              @click="
                clientSummaryEdited = false;
                clientSummary = buildClientSummary();
              "
            >
              Regenerate
            </button>
          </div>
          <textarea
            v-model="clientSummary"
            rows="4"
            class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-blue-300 focus:outline-none"
            @input="clientSummaryEdited = true"
          />
          <p class="mt-1 text-xs text-slate-500">Auto-updates when prices change unless edited.</p>
        </div>
      </section>

      <section
        class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:shadow-md sm:px-6 sm:py-5"
      >
        <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <h3 class="text-lg font-semibold text-slate-900">Mini-ProfitPulse</h3>
              <InformationCircleIcon class="h-5 w-5 text-slate-400" />
            </div>
            <p class="text-sm text-slate-500">Base cost + add-on costs vs. estimated margin.</p>
            <div class="mt-3 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-600">Base Cost</span>
                <span class="font-semibold text-slate-900">{{ formatCurrency(baseCost) }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-600">Add-on Costs</span>
                <span class="font-semibold text-slate-900">{{ formatCurrency(totalAddOnCost) }}</span>
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="text-slate-600">Estimated Margin</span>
                <span class="font-semibold text-emerald-700">{{ formatCurrency(margin) }} ({{ marginPct.toFixed(0) }}%)</span>
              </div>
              <div class="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  class="h-3 bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-300"
                  :style="{ width: `${Math.min(100, Math.max(10, marginPct))}%` }"
                ></div>
              </div>
            </div>
          </div>

          <div class="flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
            <div class="mb-2 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-semibold text-slate-900">Visit &amp; Deposit (Preview)</h3>
                <CalendarDaysIcon class="h-5 w-5 text-blue-600" />
              </div>
              <span class="text-xs text-slate-500">Prototype only</span>
            </div>
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Next Site Visit</p>
                  <p class="text-sm font-semibold text-slate-900">{{ nextVisit }}</p>
                </div>
                <button
                  type="button"
                  class="text-xs font-semibold text-blue-600 underline-offset-4 hover:underline"
                  @click="logAction('Edit visit', nextVisit)"
                >
                  Edit
                </button>
              </div>
              <div class="space-y-2">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Deposit Options</p>
                <div class="flex flex-wrap gap-2">
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold shadow-sm transition"
                    :class="depositMode === 'flat' ? 'border-emerald-300 bg-emerald-100 text-emerald-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'"
                    @click="depositMode = 'flat'"
                  >
                    Flat {{ formatCurrency(flatDeposit) }}
                  </button>
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold shadow-sm transition"
                    :class="depositMode === 'percent' ? 'border-emerald-300 bg-emerald-100 text-emerald-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'"
                    @click="depositMode = 'percent'"
                  >
                    {{ percentDeposit }}% of estimate
                  </button>
                  <button
                    type="button"
                    class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold shadow-sm transition"
                    :class="depositMode === 'none' ? 'border-emerald-300 bg-emerald-100 text-emerald-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'"
                    @click="depositMode = 'none'"
                  >
                    No deposit
                  </button>
                </div>
                <p class="text-sm text-slate-600">{{ depositDescription }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
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
