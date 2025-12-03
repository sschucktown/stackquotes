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

function handleSelect(id: string) {
  emit("select-package", id);
}
</script>

<template>
  <section class="space-y-3">
    <div class="flex items-baseline justify-between">
      <h2 class="text-sm font-semibold text-slate-800">Choose Your Package</h2>
      <p class="text-xs text-slate-500">Tap a card to select an option</p>
    </div>

    <div class="space-y-3">
      <button
        v-for="pkg in proposal.packages"
        :key="pkg.id"
        type="button"
        @click="handleSelect(pkg.id)"
        class="w-full rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:shadow-md focus:outline-none"
        :class="[
          selectedPackageId === pkg.id ? themeClasses.accentBorder : 'border-slate-200',
          pkg.isRecommended ? 'relative border-2' : ''
        ]"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-[0.7rem] font-semibold uppercase tracking-wide text-slate-500">
              {{ pkg.tier }}
            </p>
            <h3 class="text-base font-semibold text-slate-900">{{ pkg.label }}</h3>
            <p class="mt-1 text-xs text-slate-500">{{ pkg.description }}</p>
          </div>

          <div class="text-right">
            <p class="text-sm font-semibold text-slate-900">{{ currency(pkg.priceTotal) }}</p>
            <p v-if="pkg.monthlyEstimate" class="mt-1 text-[0.7rem] text-slate-500">
              ~{{ currency(pkg.monthlyEstimate) }}/mo with financing
            </p>
          </div>
        </div>

        <ul class="mt-3 space-y-1 text-xs text-slate-600">
          <li v-for="b in pkg.bullets" :key="b" class="flex gap-2">
            <span class="mt-[3px] h-[5px] w-[5px] flex-none rounded-full bg-slate-300" />
            <span>{{ b }}</span>
          </li>
        </ul>

        <div class="mt-3 flex items-center justify-between text-[0.7rem]">
          <div class="flex items-center gap-2">
            <span
              class="inline-flex h-5 w-5 items-center justify-center rounded-full border"
              :class="selectedPackageId === pkg.id ? themeClasses.accentBorder : 'border-slate-300'"
            >
              <span v-if="selectedPackageId === pkg.id" class="h-3 w-3 rounded-full" :class="themeClasses.accentBg" />
            </span>
            <span class="font-medium" :class="selectedPackageId === pkg.id ? themeClasses.accent : 'text-slate-600'">
              {{ selectedPackageId === pkg.id ? "Selected" : "Tap to select this option" }}
            </span>
          </div>

          <div
            v-if="pkg.isRecommended"
            class="rounded-full px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide"
            :class="themeClasses.accentSoftBg"
          >
            Most popular
          </div>
        </div>
      </button>
    </div>
  </section>
</template>
