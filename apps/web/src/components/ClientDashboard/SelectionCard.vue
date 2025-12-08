<script setup lang="ts">
import { ArrowTopRightOnSquareIcon } from "@heroicons/vue/24/outline";

const props = defineProps<{
  optionLabel: string;
  price: number;
}>();

const emit = defineEmits<{
  (event: "viewProposal"): void;
  (event: "viewApproval"): void;
}>();

const currency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Chosen option</p>
        <p class="text-lg font-semibold text-slate-900">{{ props.optionLabel }}</p>
      </div>
      <p class="text-2xl font-bold text-slate-900">{{ currency(props.price) }}</p>
    </div>
    <div class="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"
        @click="emit('viewProposal')"
      >
        View proposal
        <ArrowTopRightOnSquareIcon class="h-4 w-4" />
      </button>
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-800 transition hover:border-slate-300 hover:bg-white"
        @click="emit('viewApproval')"
      >
        View signed approval
        <ArrowTopRightOnSquareIcon class="h-4 w-4" />
      </button>
    </div>
  </section>
</template>
