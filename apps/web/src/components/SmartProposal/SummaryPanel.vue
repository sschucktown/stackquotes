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
  <aside class="order-last h-full w-full rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm lg:order-none lg:sticky lg:top-4 lg:max-w-[360px]">
    <div class="flex items-center justify-between gap-2">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Selected</p>
        <p class="text-lg font-semibold text-slate-900">{{ selected?.label || "Choose an option" }}</p>
        <p class="text-sm text-slate-600">{{ selected?.subtitle }}</p>
      </div>
      <p class="text-2xl font-bold text-slate-900">{{ selected ? currency(selected.price) : "--" }}</p>
    </div>

    <div class="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-inner">
      <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Deposit</p>
      <p class="text-sm font-semibold text-slate-800">{{ depositPercent }}% at approval (est.)</p>
      <p class="text-sm text-emerald-700">{{ currency(depositAmount) }} due at approval</p>
    </div>

    <div class="sticky bottom-4 mt-5 space-y-3">
      <button
        type="button"
        class="inline-flex w-full items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700"
        @click="emit('approve')"
      >
        Approve & Sign
      </button>
      <button
        type="button"
        class="inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
        @click="emit('question')"
      >
        Ask a question
      </button>
      <p class="text-[11px] text-slate-500">Nothing is final until you sign. Approving here just tells your contractor which option you like.</p>
    </div>
  </aside>
</template>
