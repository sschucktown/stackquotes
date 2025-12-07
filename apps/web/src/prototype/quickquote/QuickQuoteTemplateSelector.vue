<script setup lang="ts">
import { useRouter } from "vue-router";
import { SparklesIcon, CheckCircleIcon } from "@heroicons/vue/24/outline";

type Template = {
  id: string;
  title: string;
  description: string;
  basePrice: number;
  costBasis: number;
  scope: string[];
  recommendedAddOns: { label: string }[];
  complexity: "Low" | "Medium" | "High";
};

const router = useRouter();

const templates: Template[] = [
  {
    id: "deck-12x12-pt",
    title: "12x12 Pressure-Treated Deck",
    description: "Starter layout with straightforward framing and standard rails.",
    basePrice: 14800,
    costBasis: 9500,
    scope: ["Standard framing", "Basic rails", "Simple stairs"],
    recommendedAddOns: [{ label: "Composite Upgrade" }, { label: "Lighting Package" }],
    complexity: "Low",
  },
  {
    id: "deck-16x20-composite",
    title: "16x20 Composite Deck",
    description: "Composite surface with upgraded rails and skirt boards.",
    basePrice: 19800,
    costBasis: 11800,
    scope: ["Composite surface", "Hidden fasteners", "Upgraded rails"],
    recommendedAddOns: [{ label: "Premium Rails" }, { label: "Lighting Package" }],
    complexity: "Medium",
  },
  {
    id: "deck-resurface",
    title: "Deck Resurfacing",
    description: "Replace surface and rails while reusing solid framing.",
    basePrice: 17200,
    costBasis: 11000,
    scope: ["Demo old surface", "Inspect framing", "New surface + rails"],
    recommendedAddOns: [{ label: "Fascia Wrap" }, { label: "Lighting Package" }],
    complexity: "Medium",
  },
  {
    id: "wrap-around",
    title: "Wrap-Around Deck",
    description: "Expanded wrap with extra footings and fascia upgrades.",
    basePrice: 24800,
    costBasis: 15500,
    scope: ["Multi-side layout", "Extra footings", "Premium fascia"],
    recommendedAddOns: [{ label: "Lighting Package" }, { label: "Premium Rails" }],
    complexity: "High",
  },
  {
    id: "stair-replacement",
    title: "Stair Replacement",
    description: "Focused repair to replace failing stairs and rails.",
    basePrice: 8600,
    costBasis: 5200,
    scope: ["New stringers", "Treads + rails", "Safety-focused finish"],
    recommendedAddOns: [{ label: "Lighting Package" }, { label: "Composite Upgrade" }],
    complexity: "Low",
  },
];

const goToTemplate = (templateId: string) => {
  router.push({ name: "QuickQuoteBuilder", query: { template: templateId } });
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <div class="fade-in mx-auto flex max-w-4xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <header
        class="rounded-2xl border border-slate-200/80 bg-white px-4 py-4 shadow-sm transition hover:shadow-md sm:px-6 sm:py-5"
      >
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 shadow-inner transition hover:bg-slate-200"
              @click="router.push('/prototype/hq')"
            >
              <span class="text-lg leading-none">&larr;</span>
              <span>Back to HQ</span>
            </button>
            <div>
              <h1 class="text-lg font-semibold text-slate-900">Choose a Job Template</h1>
              <p class="text-sm text-slate-500">Start with a proven base and tweak only what you need.</p>
            </div>
          </div>
          <div class="flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-inner">
            Deck Templates
          </div>
        </div>
      </header>

      <section
        class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:shadow-md sm:px-6 sm:py-5"
      >
        <div class="mb-4 flex items-center justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Templates</p>
            <p class="text-sm text-slate-500">Pick the closest fit and we will pre-fill your QuickQuote.</p>
          </div>
          <SparklesIcon class="h-5 w-5 text-emerald-500" />
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <button
            v-for="template in templates"
            :key="template.id"
            type="button"
            class="flex h-full flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
            @click="goToTemplate(template.id)"
          >
            <div class="flex items-start justify-between gap-2">
              <div>
                <h3 class="text-base font-semibold text-slate-900">{{ template.title }}</h3>
                <p class="text-sm text-slate-600">{{ template.description }}</p>
              </div>
              <CheckCircleIcon class="h-5 w-5 text-emerald-500" />
            </div>
            <ul class="space-y-1 text-sm text-slate-600">
              <li v-for="item in template.scope" :key="item" class="flex items-start gap-2">
                <span class="mt-1 h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                <span>{{ item }}</span>
              </li>
            </ul>
            <div class="mt-auto flex items-center justify-between gap-3">
              <span
                class="rounded-full px-3 py-1 text-xs font-semibold shadow-inner"
                :class="{
                  'border border-emerald-200 bg-emerald-50 text-emerald-700': template.complexity === 'Low',
                  'border border-amber-200 bg-amber-50 text-amber-700': template.complexity === 'Medium',
                  'border border-rose-200 bg-rose-50 text-rose-700': template.complexity === 'High',
                }"
              >
                Complexity: {{ template.complexity }}
              </span>
              <span class="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm">
                Use Template
              </span>
            </div>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.fade-in {
  animation: fadeIn 0.25s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
