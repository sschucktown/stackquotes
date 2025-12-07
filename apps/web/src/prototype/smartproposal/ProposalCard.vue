<script setup lang="ts">
import type { OptionKey } from "./types";

const props = defineProps<{
  optionKey: OptionKey;
  option: {
    label: string;
    price: number;
    scopeSummary: string[];
  };
  accent: string;
  premium?: boolean;
  onEdit?: () => void;
  onAdvanced?: () => void;
}>();

const emit = defineEmits<{
  (e: "edit"): void;
  (e: "advanced"): void;
}>();

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
</script>

<template>
  <div
    class="flex h-full flex-col rounded-2xl border border-slate-200 p-4 shadow-sm transition hover:shadow-md sm:p-5"
    :class="premium ? 'bg-emerald-50/60' : 'bg-white'"
  >
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{{ option.label }}</p>
        <p class="text-xs text-slate-500">
          {{ optionKey === "good" ? "Essential Option" : optionKey === "better" ? "Comfort Option" : "Premium Option" }}
        </p>
        <div class="mt-1 flex items-center gap-2">
          <p class="text-2xl font-bold tracking-tight text-slate-900">{{ formatCurrency(option.price) }}</p>
          <span class="text-xs text-slate-400" title="Client-facing price. Internal margins are hidden.">ⓘ</span>
        </div>
        <p class="text-xs text-slate-400">Margin locked <span aria-label="Locked" title="Clients never see margin.">🔒</span></p>
      </div>
      <div class="flex flex-col items-end gap-2">
        <span class="rounded-full px-3 py-1 text-xs font-semibold text-white shadow-inner" :class="accent">
          {{ optionKey }}
        </span>
        <button
          type="button"
          class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          @click="emit('edit')"
        >
          Edit options
        </button>
      </div>
    </div>

    <div class="mt-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 shadow-inner">
      <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Scope snapshot</p>
      <ul class="mt-2 space-y-1 text-sm text-slate-800">
        <li v-for="item in option.scopeSummary.slice(0, 3)" :key="item" class="flex items-start gap-2">
          <span class="mt-1 h-1.5 w-1.5 rounded-full bg-slate-300"></span>
          <span>{{ item }}</span>
        </li>
        <li v-if="option.scopeSummary.length > 3" class="text-xs text-slate-500">+ more included</li>
      </ul>
    </div>

    <div class="mt-3 grid gap-2 sm:grid-cols-2">
      <div class="flex items-center gap-2 rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100 px-3 py-3 shadow-inner">
        <div class="h-10 w-10 rounded-xl bg-slate-200/70"></div>
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Preview</p>
          <p class="text-sm font-semibold text-slate-800 leading-relaxed">Photo collage (coming soon)</p>
        </div>
      </div>
      <div class="flex items-center justify-end gap-2 text-xs">
        <button
          type="button"
          class="text-xs font-semibold text-slate-400 underline-offset-4 hover:text-slate-600"
          @click="emit('advanced')"
        >
          Advanced (optional)
        </button>
      </div>
    </div>
  </div>
</template>
