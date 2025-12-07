<script setup lang="ts">
import { computed } from "vue";
import LineItemRow from "./LineItemRow.vue";
import { useOptionTotals } from "./useOptionTotals";
import type { LineItem, OptionKey, ProposalOption } from "./types";

const props = defineProps<{
  optionKey: OptionKey;
  option: ProposalOption;
  accent: {
    pill: string;
    ring: string;
    text: string;
    chip: string;
  };
}>();

const emit = defineEmits<{
  (e: "update:label", value: string): void;
  (e: "update:item", payload: { id: string; field: keyof LineItem; value: unknown }): void;
  (e: "toggle", payload: { id: string; value: boolean }): void;
  (e: "remove", id: string): void;
  (e: "add-line-item", target: OptionKey): void;
}>();

const optionRef = computed(() => props.option);
const totals = useOptionTotals(optionRef);

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const marginToneClass = computed(() => {
  if (totals.marginNudge.value === "warn") return "text-rose-600 bg-rose-50 border-rose-100";
  if (totals.marginNudge.value === "great") return "text-emerald-700 bg-emerald-50 border-emerald-100";
  return "text-slate-700 bg-slate-50 border-slate-200";
});
</script>

<template>
  <div
    class="rounded-2xl border bg-white px-4 py-4 shadow-sm transition hover:shadow-md sm:px-6 sm:py-5"
    :class="accent.ring"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-center gap-3">
        <span class="h-10 w-10 rounded-full text-sm font-semibold uppercase tracking-wide text-white shadow-inner" :class="accent.pill">
          {{ option.label.slice(0, 1) }}
        </span>
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Option</p>
          <input
            :value="option.label"
            class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-base font-semibold text-slate-900 outline-none ring-0 transition focus:border-slate-300 focus:bg-white focus:shadow-sm"
            @input="emit('update:label', ($event.target as HTMLInputElement).value)"
          />
          <p class="mt-1 text-xs font-medium" :class="accent.text">{{ optionKey.toUpperCase() }}</p>
        </div>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
        @click="emit('add-line-item', optionKey)"
      >
        <span class="text-base leading-none">+</span>
        Add line item
      </button>
    </div>

    <div class="mt-4 grid gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 sm:grid-cols-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Price</p>
        <p class="text-xl font-bold text-slate-900">{{ formatCurrency(totals.totalPrice.value) }}</p>
      </div>
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Total Cost</p>
        <p class="text-xl font-semibold text-slate-800">{{ formatCurrency(totals.totalCost.value) }}</p>
      </div>
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Margin</p>
        <div class="flex items-center gap-2">
          <p class="text-xl font-semibold text-slate-900">{{ totals.marginPct.value }}%</p>
          <span class="rounded-full px-2 py-0.5 text-[11px] font-semibold" :class="accent.chip">Target 40%+</span>
        </div>
      </div>
    </div>

    <div class="mt-2 rounded-xl border text-sm shadow-inner" :class="marginToneClass">
      <div class="flex items-center gap-2 px-3 py-2">
        <span class="text-lg leading-none">⏱</span>
        <p class="font-semibold">{{ totals.marginNudgeMsg.value }}</p>
      </div>
    </div>

    <div class="mt-4 space-y-2">
      <LineItemRow
        v-for="item in option.items"
        :key="item.id"
        :item="item"
        :accent-text="accent.text"
        @update="(payload) => emit('update:item', { id: item.id, field: payload.field, value: payload.value })"
        @toggle="(val) => emit('toggle', { id: item.id, value: val })"
        @remove="emit('remove', item.id)"
      />
    </div>
  </div>
</template>
