<script setup lang="ts">
const props = defineProps<{
  selected:
    | {
        key: string;
        label: string;
        subtitle?: string;
        price: number;
      }
    | undefined;
  depositPercent: number;
  depositAmount: number;
  currency: (value: number) => string;
}>();

const emit = defineEmits<{
  (e: "approve"): void;
  (e: "question"): void;
}>();
</script>

<template>
  <aside
    class="order-last h-full w-full rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur-sm transition-all duration-200 ease-out lg:order-none lg:sticky lg:top-6 lg:max-w-[360px]"
  >
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Selected</p>
        <p class="text-xl font-semibold text-slate-900">{{ selected?.label || "Choose an option" }}</p>
        <p class="text-sm text-slate-600">{{ selected?.subtitle || "Tap a card to see details." }}</p>
      </div>
      <div class="text-right">
        <p class="text-xs font-medium text-slate-500">Estimate</p>
        <p class="text-2xl font-bold text-slate-900">{{ selected ? currency(selected.price) : "--" }}</p>
      </div>
    </div>

    <div class="mt-4 space-y-4 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-4 shadow-inner">
      <div class="space-y-1">
        <p class="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Deposit</p>
        <p class="text-sm font-semibold text-slate-800">{{ depositPercent }}% at approval (est.)</p>
        <p class="text-sm text-emerald-700">{{ currency(depositAmount) }} due at approval</p>
      </div>
      <div class="h-px bg-slate-200"></div>
      <div class="space-y-2">
        <p class="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Upgrades</p>
        <ul class="space-y-1.5 text-sm text-slate-700">
          <li class="flex items-start gap-2">
            <span class="mt-[7px] h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>{{ selected?.subtitle || "Balanced finish and materials" }}</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="mt-[7px] h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>{{ depositPercent }}% to schedule and lock in materials</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="mt-[7px] h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Final walkthrough before remaining balance</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="sticky bottom-4 mt-5 space-y-3">
      <button
        type="button"
        class="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all duration-200 ease-out hover:-translate-y-[1px] hover:bg-emerald-700"
        @click="emit('approve')"
      >
        Approve &amp; Sign
      </button>
      <button
        type="button"
        class="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm transition-all duration-200 ease-out hover:-translate-y-[1px] hover:bg-slate-50"
        @click="emit('question')"
      >
        Ask a question
      </button>
      <p class="text-[11px] text-slate-500">Nothing is final until you sign. Approving here just tells your contractor which option you like.</p>
    </div>
  </aside>
</template>
