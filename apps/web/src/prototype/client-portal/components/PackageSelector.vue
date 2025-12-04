<script setup lang="ts">
import type { ProposalData } from "../data/mockProposal";

const props = defineProps<{
  proposal: ProposalData;
  themeClasses: {
    accent: string;
    accentBg: string;
    accentSoftBg: string;
    accentBorder: string;
  };
  selectedPackageId: string | null;
}>();

const emit = defineEmits<{
  (e: "select-package", id: string): void;
}>();

const currency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const cardRefs: Record<string, HTMLButtonElement | null> = {};

function handleSelect(id: string) {
  emit("select-package", id);
  const el = cardRefs[id];
  if (el && typeof el.scrollIntoView === "function") {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}
</script>

<template>
  <section class="mt-16 space-y-4">
    <div>
      <h2 class="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 mb-2">Choose Your Package</h2>
      <p class="text-sm text-slate-500 mb-4">Good / Better / Best packages designed to fit how you want to use your space.</p>
    </div>

    <div class="space-y-5">
      <button
        v-for="pkg in proposal.packages"
        :key="pkg.id"
        :ref="(el) => (cardRefs[pkg.id] = el as HTMLButtonElement | null)"
        type="button"
        @click="handleSelect(pkg.id)"
        class="group relative w-full rounded-3xl border border-slate-200 bg-white p-7 text-left shadow-lg transition-all duration-300 ease-out hover:shadow-xl hover:scale-[1.01] hover:bg-slate-50 origin-center sm:p-8 focus:outline-none"
        :class="[
          selectedPackageId === pkg.id
            ? 'border-2 border-blue-500 bg-blue-50/40 shadow-[0_0_0_4px_rgba(59,130,246,0.18)] scale-[1.015]'
            : '',
          pkg.isRecommended ? 'relative' : ''
        ]"
      >
        <div
          v-if="pkg.isRecommended"
          class="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-lg absolute top-4 right-4"
        >
          Most Popular
        </div>

        <div class="flex items-start justify-between gap-4">
          <div class="space-y-1.5">
            <p class="text-[0.8rem] font-semibold uppercase tracking-wide text-slate-500">
              {{ pkg.tier }}
            </p>
            <h3 class="text-base sm:text-lg font-semibold text-slate-900">{{ pkg.label }}</h3>
            <p class="text-sm leading-relaxed text-slate-700">{{ pkg.description }}</p>
          </div>

          <div class="text-right space-y-1">
            <p class="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{{ currency(pkg.priceTotal) }}</p>
            <p v-if="pkg.monthlyEstimate" class="text-xs text-slate-500 mt-1">
              ~{{ currency(pkg.monthlyEstimate) }}/mo with financing
            </p>
          </div>
        </div>

        <ul class="mt-6 space-y-2 text-sm text-slate-700">
          <li v-for="b in pkg.bullets" :key="b" class="flex gap-2 leading-relaxed">
            <span class="mt-[6px] h-[6px] w-[6px] flex-none rounded-full bg-slate-300" />
            <span>{{ b }}</span>
          </li>
        </ul>

        <div class="mt-6 flex items-center justify-between text-[0.85rem]">
          <div class="flex items-center gap-3">
            <span
              class="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-slate-300 transition-all duration-300"
              :class="selectedPackageId === pkg.id ? 'border-blue-500' : 'border-slate-300'"
            >
              <span
                v-if="selectedPackageId === pkg.id"
                class="h-3.5 w-3.5 rounded-full bg-blue-500 transition-all duration-300"
              />
            </span>
            <span class="font-medium" :class="selectedPackageId === pkg.id ? 'text-blue-600' : 'text-slate-700'">
              {{ selectedPackageId === pkg.id ? "Selected" : "Tap to select this option" }}
            </span>
          </div>
        </div>
      </button>
    </div>
  </section>
</template>
