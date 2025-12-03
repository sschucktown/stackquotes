<script setup lang="ts">
import { computed } from "vue";
import type { PackageOption, ProposalData } from "../data/mockProposal";

const props = defineProps<{
  open: boolean;
  selectedPackage: PackageOption | null;
  proposal: ProposalData;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "complete"): void;
}>();

const depositFormatted = computed(() => {
  if (!props.selectedPackage) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(props.selectedPackage.depositAmount);
});
</script>

<template>
  <div v-if="open && selectedPackage" class="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/50 px-4">
    <div class="w-full max-w-sm rounded-2xl bg-white p-5 text-sm shadow-xl">
      <h2 class="text-base font-semibold text-slate-900">Demo Payment Flow</h2>
      <p class="mt-1 text-xs text-slate-500">This is a prototype — no real payment will be processed.</p>

      <div class="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
        <p class="font-semibold text-slate-800">
          {{ proposal.contractorBrand.name }}
        </p>
        <p class="mt-1">
          Package:
          <span class="font-medium">
            {{ selectedPackage.label }}
          </span>
        </p>
        <p class="mt-1">
          Deposit due now:
          <span class="font-semibold">
            {{ depositFormatted }}
          </span>
        </p>
      </div>

      <div class="mt-4 flex flex-col gap-2 text-xs text-slate-600">
        <button
          type="button"
          class="w-full rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          @click="emit('complete')"
        >
          Simulate Successful Payment
        </button>
        <button
          type="button"
          class="w-full rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          @click="emit('close')"
        >
          Cancel
        </button>
      </div>

      <p class="mt-3 text-[0.65rem] text-slate-400">
        In the real app, this step would open a secure payment screen (Stripe, Wisetack, etc.).
      </p>
    </div>
  </div>
</template>
