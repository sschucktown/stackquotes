<script setup lang="ts">
const props = defineProps<{
  totalPrice: number;
  totalCost: number;
  marginPct: number;
}>();

const barWidth = (pct: number) => `${Math.min(100, Math.max(10, pct))}%`;
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-slate-900">Mini-ProfitPulse</h3>
      <span class="text-xs text-slate-500">Prototype</span>
    </div>
    <div class="mt-3 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
      <div class="flex items-center justify-between text-sm">
        <span class="text-slate-600">Total Cost Basis</span>
        <span class="font-semibold text-slate-900">{{ totalCost.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) }}</span>
      </div>
      <div class="flex items-center justify-between text-sm">
        <span class="text-slate-600">Total Price</span>
        <span class="font-semibold text-slate-900">{{ totalPrice.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) }}</span>
      </div>
      <div class="flex items-center justify-between text-sm">
        <span class="text-slate-600">Estimated Margin</span>
        <span class="font-semibold text-emerald-700">{{ marginPct.toFixed(0) }}%</span>
      </div>
      <div class="mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          class="h-3 bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-300"
          :style="{ width: barWidth(marginPct) }"
        ></div>
      </div>
    </div>
  </section>
</template>
