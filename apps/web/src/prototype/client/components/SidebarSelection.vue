<script setup lang="ts">
import type { ProposalOption, Upgrade } from "../optionsData";

const props = defineProps<{
  option: ProposalOption;
  upgrades: Upgrade[];
  totalPrice: number;
  todayDue: number;
  atCompletion: number;
  highlight?: boolean;
}>();

const emit = defineEmits<{
  (e: "approve"): void;
  (e: "question"): void;
}>();
</script>

<template>
  <div
    class="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-[0_2px_16px_rgba(0,0,0,0.06)] transition-all duration-300 will-change-transform"
    :class="highlight ? 'translate-y-[-2px] ring-2 ring-emerald-300 shadow-[0_18px_50px_rgba(16,185,129,0.22)]' : ''"
  >
    <p class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Your selection</p>
    <div class="mt-2 flex items-center justify-between">
      <div>
        <p class="text-sm font-semibold text-slate-900">{{ option.label }}</p>
        <p class="text-xs text-slate-600">{{ option.tagline }}</p>
      </div>
      <Transition name="fade-price" mode="out-in">
        <div
          :key="props.totalPrice"
          class="text-2xl font-bold text-emerald-600"
          aria-live="polite"
        >
          {{ props.totalPrice.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) }}
        </div>
      </Transition>
    </div>

    <div class="mt-3 space-y-1 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 shadow-inner">
      <div class="flex items-center justify-between text-sm font-semibold text-slate-800">
        <span>Due today (estimate)</span>
        <span>{{ props.todayDue.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) }}</span>
      </div>
      <div class="flex items-center justify-between text-sm text-slate-600">
        <span>At completion</span>
        <span>{{ props.atCompletion.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) }}</span>
      </div>
    </div>

    <div class="mt-3 space-y-2">
      <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Chosen upgrades</p>
      <div v-if="upgrades.length" class="flex flex-wrap gap-2">
        <span
          v-for="item in upgrades"
          :key="item.id"
          class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-inner"
        >
          {{ item.label }}
        </span>
      </div>
      <p v-else class="text-sm text-slate-500">No upgrades added. You can still choose the base option.</p>
    </div>

    <div class="mt-3 space-y-2">
      <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Milestones</p>
      <ul class="space-y-2 text-sm">
        <li class="flex items-center gap-2">
          <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
          <span>Choose your option</span>
        </li>
        <li class="flex items-center gap-2 text-slate-600">
          <span class="h-2 w-2 rounded-full bg-slate-300"></span>
          <span>We schedule and build</span>
        </li>
        <li class="flex items-center gap-2 text-slate-600">
          <span class="h-2 w-2 rounded-full bg-slate-300"></span>
          <span>You enjoy + we warranty</span>
        </li>
      </ul>
    </div>

    <div class="mt-4 space-y-2">
      <button
        type="button"
        class="flex w-full items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700"
        @click="emit('approve')"
      >
        Approve this option
      </button>
      <button
        type="button"
        class="flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
        @click="emit('question')"
      >
        Ask a question
      </button>
      <p class="text-[11px] text-slate-500">
        Nothing is final until you sign. Approving here just tells your contractor which option you like.
      </p>
    </div>
  </div>
</template>

<style scoped>
.fade-price-enter-active,
.fade-price-leave-active {
  transition: all 0.2s ease;
}
.fade-price-enter-from,
.fade-price-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
