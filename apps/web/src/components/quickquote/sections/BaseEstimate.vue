<script setup lang="ts">
const props = defineProps<{
  basePrice: number;
  baseCost: number;
  margin: number;
  marginPct: number;
}>();

const emit = defineEmits<{
  (e: "update:basePrice", value: number): void;
  (e: "update:baseCost", value: number): void;
}>();

const marginTone = (pct: number) => {
  if (pct >= 30) return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (pct >= 20) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-rose-700 bg-rose-50 border-rose-200";
};
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h3 class="text-lg font-semibold text-slate-900">Base Estimate</h3>
        <p class="text-sm text-slate-500">Single price with quick internal cost view.</p>
      </div>
    </div>

    <div class="mt-3 grid gap-4 sm:grid-cols-3">
      <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 shadow-inner">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Base Price</p>
        <div class="mt-2 flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold tracking-tight text-slate-900 shadow-inner">
          <span class="text-slate-500">$</span>
          <input
            :value="basePrice"
            type="number"
            min="0"
            class="w-full bg-transparent text-right text-sm font-bold tracking-tight text-slate-900 outline-none"
            @input="emit('update:basePrice', Number(($event.target as HTMLInputElement).value || 0))"
          />
        </div>
      </div>
      <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 shadow-inner">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Cost Basis (Internal)</p>
        <div class="mt-2 flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-inner">
          <span class="text-slate-500">$</span>
          <input
            :value="baseCost"
            type="number"
            min="0"
            class="w-full bg-transparent text-right text-sm font-semibold text-slate-900 outline-none"
            @input="emit('update:baseCost', Number(($event.target as HTMLInputElement).value || 0))"
          />
        </div>
      </div>
      <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 shadow-inner">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Margin</p>
        <div
          class="mt-2 rounded-xl border px-3 py-2 text-sm font-semibold shadow-inner"
          :class="marginTone(marginPct)"
        >
          <p class="text-base font-semibold">{{ margin.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) }}</p>
          <p class="text-xs">~{{ marginPct.toFixed(0) }}% est.</p>
        </div>
      </div>
    </div>
  </section>
</template>
