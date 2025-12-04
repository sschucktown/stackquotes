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
  <section class="space-y-4">
    <div class="mt-12">
      <h2 class="text-lg font-semibold tracking-tight text-slate-900">Choose Your Package</h2>
      <p class="text-sm text-slate-600">Tap a card to explore Good / Better / Best.</p>
    </div>

    <div class="space-y-4">
      <button
        v-for="pkg in proposal.packages"
        :key="pkg.id"
        :ref="(el) => (cardRefs[pkg.id] = el as HTMLButtonElement | null)"
        type="button"
        @click="handleSelect(pkg.id)"
        class="group w-full rounded-2xl border bg-white p-6 text-left shadow-md transition-all duration-300 ease-out hover:-translate-y-[2px] hover:scale-[1.01] hover:shadow-xl focus:outline-none"
        :class="[
          selectedPackageId === pkg.id
            ? `${themeClasses.accentBorder} ${themeClasses.accentSoftBg} border-2 shadow-[0_0_0_3px_rgba(59,130,246,0.15)]`
            : 'border-slate-200',
          pkg.isRecommended ? 'relative' : ''
        ]"
      >
        <div
          v-if="pkg.isRecommended"
          class="absolute right-5 top-5 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow-md"
        >
          Most Popular
        </div>

        <div class="flex items-start justify-between gap-4">
          <div class="space-y-1.5">
            <p class="text-[0.8rem] font-semibold uppercase tracking-wide text-slate-500">
              {{ pkg.tier }}
            </p>
            <h3 class="text-base font-semibold text-slate-900">{{ pkg.label }}</h3>
            <p class="text-sm leading-relaxed text-slate-700">{{ pkg.description }}</p>
          </div>

          <div class="text-right space-y-1">
            <p class="text-lg font-semibold text-slate-900">{{ currency(pkg.priceTotal) }}</p>
            <p v-if="pkg.monthlyEstimate" class="text-[0.75rem] text-slate-600">
              ~{{ currency(pkg.monthlyEstimate) }}/mo with financing
            </p>
          </div>
        </div>

        <ul class="mt-5 space-y-1.5 text-sm text-slate-700">
          <li v-for="b in pkg.bullets" :key="b" class="flex gap-2 leading-relaxed">
            <span class="mt-[5px] h-[6px] w-[6px] flex-none rounded-full bg-slate-300" />
            <span>{{ b }}</span>
          </li>
        </ul>

        <div class="mt-5 flex items-center justify-between text-[0.8rem]">
          <div class="flex items-center gap-3">
            <span
              class="inline-flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-300"
              :class="selectedPackageId === pkg.id ? themeClasses.accentBorder : 'border-slate-300'"
            >
              <span
                v-if="selectedPackageId === pkg.id"
                class="h-3.5 w-3.5 rounded-full transition-all duration-300"
                :class="themeClasses.accentBg"
              />
            </span>
            <span class="font-medium" :class="selectedPackageId === pkg.id ? themeClasses.accent : 'text-slate-700'">
              {{ selectedPackageId === pkg.id ? "Selected" : "Tap to select this option" }}
            </span>
          </div>
        </div>
      </button>
    </div>
  </section>
</template>
