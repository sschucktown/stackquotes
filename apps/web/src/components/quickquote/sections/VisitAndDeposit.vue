<script setup lang="ts">
const props = defineProps<{
  nextVisit: string;
  depositMode: "none" | "flat" | "percent";
  flatDeposit: number;
  percentDeposit: number;
  depositDescription: string;
}>();

const emit = defineEmits<{
  (e: "update:depositMode", value: "none" | "flat" | "percent"): void;
  (e: "editVisit"): void;
}>();
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
    <div class="mb-3 flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold text-slate-900">Visit &amp; Deposit (Preview)</h3>
        <p class="text-sm text-slate-500">Lightweight preview for client-facing flow.</p>
      </div>
      <span class="text-xs text-slate-500">Prototype only</span>
    </div>

    <div class="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 shadow-inner sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Next Site Visit</p>
        <p class="text-sm font-semibold text-slate-900">{{ nextVisit }}</p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
        @click="emit('editVisit')"
      >
        Edit
      </button>
    </div>

    <div class="mt-4 space-y-2">
      <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Deposit Options</p>
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold shadow-sm transition"
          :class="depositMode === 'flat' ? 'border-emerald-300 bg-emerald-100 text-emerald-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'"
          @click="emit('update:depositMode', 'flat')"
        >
          Flat {{ flatDeposit.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) }}
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold shadow-sm transition"
          :class="depositMode === 'percent' ? 'border-emerald-300 bg-emerald-100 text-emerald-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'"
          @click="emit('update:depositMode', 'percent')"
        >
          {{ percentDeposit }}% of estimate
        </button>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold shadow-sm transition"
          :class="depositMode === 'none' ? 'border-emerald-300 bg-emerald-100 text-emerald-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'"
          @click="emit('update:depositMode', 'none')"
        >
          No deposit
        </button>
      </div>
      <p class="text-sm text-slate-600">{{ depositDescription }}</p>
    </div>
  </section>
</template>
