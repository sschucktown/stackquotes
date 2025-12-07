<script setup lang="ts">
import { computed } from "vue";
import { CheckCircleIcon } from "@heroicons/vue/24/outline";

type OptionInput = {
  id: "good" | "better" | "best";
  label: string;
  basePrice: number;
};

const props = defineProps<{
  options: OptionInput[];
  costBasis: Record<OptionInput["id"], number>;
  touched: Record<OptionInput["id"], boolean>;
}>();

const emit = defineEmits<{
  (e: "updateCostBasis", payload: { id: OptionInput["id"]; value: number }): void;
}>();

const sparklineMap: Record<OptionInput["id"], string> = {
  good: "M2 12 C6 10, 10 6, 14 8 S22 12, 26 7",
  better: "M2 10 C6 12, 10 11, 14 13 S22 16, 26 14",
  best: "M2 14 C6 13, 10 10, 14 12 S22 15, 26 9",
};

const rows = computed(() =>
  props.options.map((option) => {
    const basis = props.costBasis[option.id] ?? 0;
    const profit = Math.max(0, option.basePrice - basis);
    const margin = option.basePrice > 0 ? (profit / option.basePrice) * 100 : 0;
    let status: "high" | "medium" | "low" = "low";
    if (margin >= 35) status = "high";
    else if (margin >= 20) status = "medium";
    return { ...option, basis, profit, margin, status };
  })
);

const statusDot = (status: "high" | "medium" | "low") => {
  if (status === "high") return "bg-emerald-500";
  if (status === "medium") return "bg-amber-400";
  return "bg-rose-400";
};
</script>

<template>
  <section
    class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition-all duration-300 hover:shadow-md sm:px-6 sm:py-5"
  >
    <div class="mb-3 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <h3 class="text-lg font-semibold text-slate-900">Mini-ProfitPulse</h3>
        <CheckCircleIcon class="h-4 w-4 text-emerald-500" />
      </div>
      <span class="text-xs text-slate-500">Prototype snapshot</span>
    </div>
    <div class="space-y-3">
      <div
        v-for="row in rows"
        :key="row.id"
        class="flex flex-col gap-2 rounded-xl border px-3 py-2 transition"
        :class="touched[row.id] ? 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-slate-50/80'"
      >
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold text-slate-900">{{ row.label }}</span>
          <span class="h-2 w-2 rounded-full" :class="statusDot(row.status)" />
          <span class="text-xs text-slate-500">{{ row.margin.toFixed(0) }}% margin</span>
          <svg viewBox="0 0 28 18" class="ml-auto h-4 w-12 text-emerald-500">
            <path :d="sparklineMap[row.id]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <div class="text-lg font-semibold text-slate-900">
            +{{ row.profit.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) }}
          </div>
          <div class="text-xs text-slate-500">Cost basis</div>
          <div class="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-1.5 shadow-inner">
            <span class="text-slate-500">$</span>
            <input
              :value="row.basis"
              type="number"
              min="0"
              class="w-24 bg-transparent text-right text-sm font-semibold text-slate-900 outline-none"
              @input="emit('updateCostBasis', { id: row.id, value: Number(($event.target as HTMLInputElement).value || 0) })"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
