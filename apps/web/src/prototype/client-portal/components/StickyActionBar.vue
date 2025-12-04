<script setup lang="ts">
import type { PackageOption, ProposalData } from "../data/mockProposal";

const props = defineProps<{
  proposal: ProposalData;
  selectedPackage: PackageOption | null;
  show?: boolean;
  themeClasses: {
    accent: string;
    accentBg: string;
    accentSoftBg: string;
    accentBorder: string;
  };
}>();

const emit = defineEmits<{
  (e: "pay"): void;
}>();

const currency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
</script>

<template>
  <div v-if="show" class="pointer-events-none fixed inset-x-0 bottom-0 z-50 pb-[env(safe-area-inset-bottom)]">
    <div class="mx-auto max-w-lg px-4 pb-4 sm:max-w-3xl sm:px-6 lg:px-0">
      <div
        class="pointer-events-auto flex items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.12)] supports-[padding:env(safe-area-inset-bottom)]:pb-[env(safe-area-inset-bottom)]"
      >
        <div class="flex flex-col text-left">
          <p class="text-sm font-medium text-slate-900">
            {{ selectedPackage ? selectedPackage.label : "Ready when you are" }}
          </p>
          <p class="text-xs text-slate-500">
            <span v-if="selectedPackage">
              Deposit: {{ currency(selectedPackage.depositAmount) }}
            </span>
            <span v-else>Scroll back up to pick Good, Better, or Best.</span>
          </p>
        </div>

        <button
          type="button"
          class="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:opacity-80"
          :class="themeClasses.accentBg"
          @click="emit('pay')"
        >
          {{ selectedPackage ? "Approve & Pay Deposit" : "Choose a package" }}
        </button>
      </div>
    </div>
  </div>
</template>
