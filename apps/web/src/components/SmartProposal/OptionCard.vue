<script setup lang="ts">
import type { OptionKey } from "@/stores/smartProposalPrototype";

const props = defineProps<{
  optionKey: OptionKey;
  label: string;
  subtitle: string;
  price: number;
  confidence: string;
  scope: string[];
  onCustomize?: () => void;
}>();

const emit = defineEmits<{
  (e: "customize"): void;
}>();

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
</script>

<template>
  <div
    class="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
    :class="optionKey === 'best' ? 'bg-emerald-50/60' : ''"
  >
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{{ label }}</p>
        <p class="text-xs text-slate-500">{{ subtitle }}</p>
        <transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 translate-y-1"
          enter-to-class="opacity-100 translate-y-0"
        >
          <div :key="price" class="mt-1 flex items-center gap-2">
            <p class="text-2xl font-bold tracking-tight text-slate-900">{{ formatCurrency(price) }}</p>
            <span class="text-xs text-slate-400" title="Client-facing price. Internal margins are hidden.">ⓘ</span>
          </div>
        </transition>
      </div>
      <transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
      >
        <span
          :key="confidence"
          class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 shadow-inner"
        >
          {{ confidence }}
        </span>
      </transition>
    </div>

    <div class="mt-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 shadow-inner">
      <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Scope snapshot</p>
      <ul class="mt-2 space-y-1 text-sm text-slate-800">
        <li v-for="item in scope.slice(0, 5)" :key="item" class="flex items-start gap-2">
          <span class="mt-1 h-1.5 w-1.5 rounded-full bg-slate-300"></span>
          <span>{{ item }}</span>
        </li>
        <li v-if="scope.length > 5" class="text-xs text-slate-500">+ more included</li>
      </ul>
    </div>

    <div class="mt-3 flex items-center gap-2 rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100 px-3 py-3 shadow-inner">
      <div class="h-10 w-10 rounded-xl bg-slate-200/70"></div>
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Preview</p>
        <p class="text-sm font-semibold text-slate-800 leading-relaxed">Photo collage (coming soon)</p>
      </div>
    </div>

    <div class="mt-auto flex items-center justify-between pt-3">
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        @click="emit('customize')"
      >
        Customize
      </button>
    </div>
  </div>
</template>
