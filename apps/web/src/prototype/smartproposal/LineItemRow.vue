<script setup lang="ts">
import { computed } from "vue";
import type { LineItem } from "./types";

const props = defineProps<{
  item: LineItem;
  accentText?: string;
}>();

const emit = defineEmits<{
  (e: "update", payload: { field: keyof LineItem; value: unknown }): void;
  (e: "toggle", value: boolean): void;
  (e: "remove"): void;
}>();

const formatMargin = computed(() => {
  const price = Number(props.item.price) || 0;
  const cost = Number(props.item.cost) || 0;
  if (price <= 0) return 0;
  return Math.round(((price - cost) / price) * 100);
});

const priceTone = computed(() => {
  if (formatMargin.value < 35) return "text-rose-600 bg-rose-50";
  if (formatMargin.value < 45) return "text-amber-700 bg-amber-50";
  return "text-emerald-700 bg-emerald-50";
});

const handleInput = (field: keyof LineItem, value: string) => {
  emit("update", { field, value: field === "name" || field === "desc" || field === "category" ? value : Number(value) });
};
</script>

<template>
  <div
    class="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-inner transition hover:border-slate-300 hover:shadow-sm"
    :class="item.included === false ? 'opacity-60' : ''"
  >
    <div class="flex flex-wrap items-start justify-between gap-2">
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border border-slate-200 transition"
          :class="item.included === false ? 'bg-slate-100' : 'bg-emerald-100'"
          role="switch"
          :aria-checked="item.included !== false"
          @click="emit('toggle', item.included === false ? true : false)"
        >
          <span
            class="absolute left-1 top-1 h-3 w-3 rounded-full bg-white shadow transition"
            :class="item.included === false ? '' : 'translate-x-4'"
          />
        </button>
        <input
          :value="item.name"
          class="min-w-[180px] rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm font-semibold text-slate-900 outline-none focus:border-slate-300 focus:bg-white"
          placeholder="Line item name"
          @input="handleInput('name', ($event.target as HTMLInputElement).value)"
        />
        <span
          class="rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
          :class="accentText || 'text-slate-600'"
        >
          {{ item.category || "scope" }}
        </span>
      </div>
      <button
        type="button"
        class="text-xs font-semibold text-slate-500 underline-offset-4 hover:text-rose-600 hover:underline"
        @click="emit('remove')"
      >
        Remove
      </button>
    </div>

    <div class="mt-2 grid gap-2 sm:grid-cols-4">
      <textarea
        :value="item.desc"
        class="sm:col-span-2 min-h-[44px] resize-none rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-sm text-slate-700 outline-none focus:border-slate-300 focus:bg-white"
        placeholder="Description (optional)"
        @input="handleInput('desc', ($event.target as HTMLTextAreaElement).value)"
      />
      <div class="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <label class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Cost</label>
        <input
          :value="item.cost"
          type="number"
          min="0"
          class="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 outline-none focus:border-slate-300"
          @input="handleInput('cost', ($event.target as HTMLInputElement).value)"
        />
      </div>
      <div class="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
        <label class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Price</label>
        <input
          :value="item.price"
          type="number"
          min="0"
          class="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 outline-none focus:border-slate-300"
          @input="handleInput('price', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>

    <div class="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
      <div class="flex items-center gap-2">
        <span class="rounded-full border px-2 py-0.5" :class="priceTone">Margin {{ formatMargin }}%</span>
        <span v-if="item.included === false" class="text-amber-600">Excluded from totals</span>
      </div>
      <div class="flex items-center gap-1 text-slate-500">
        <span class="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
        Inline edit updates totals live
      </div>
    </div>
  </div>
</template>
