<script setup lang="ts">
import type { PackageOption, ProposalData } from "../data/mockProposal";

const props = defineProps<{
  proposal: ProposalData;
  selectedPackage: PackageOption | null;
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
  <div class="pointer-events-none fixed inset-x-0 bottom-0 z-20">
    <div class="mx-auto flex max-w-3xl justify-center px-4 pb-4 sm:px-6 lg:px-8">
      <div class="pointer-events-auto w-full rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
        <div class="flex items-center justify-between gap-3">
          <div class="flex flex-1 flex-col">
            <p class="text-xs font-semibold text-slate-700">
              {{ selectedPackage ? selectedPackage.label : "Select a package to continue" }}
            </p>
            <p v-if="selectedPackage" class="text-[0.7rem] text-slate-500">
              Deposit due today:
              <span class="font-semibold text-slate-800">
                {{ currency(selectedPackage.depositAmount) }}
              </span>
            </p>
            <p v-else class="text-[0.7rem] text-slate-500">
              Tap one of the options above to see deposit and monthly estimate.
            </p>
          </div>

          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50"
            :class="themeClasses.accentBg"
            :disabled="!selectedPackage"
            @click="emit('pay')"
          >
            {{ selectedPackage ? "Approve & Pay Deposit" : "Choose an Option" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
