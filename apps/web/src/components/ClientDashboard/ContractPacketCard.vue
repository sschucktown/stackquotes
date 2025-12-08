<script setup lang="ts">
import { computed } from "vue";
import { CalendarDaysIcon, ClipboardDocumentCheckIcon } from "@heroicons/vue/24/outline";

const props = defineProps<{
  price: number;
  deposit: number;
  startDate: string;
  depositPaid?: boolean;
}>();

const emit = defineEmits<{
  (event: "download"): void;
}>();

const currency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const depositStatus = computed(() => (props.depositPaid ? "Paid" : "Due at scheduling"));
const depositBadgeClass = computed(() =>
  props.depositPaid ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-600 border border-slate-200"
);
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Contract packet</p>
        <p class="text-sm text-slate-600">Your confirmed scope, price, and deposit.</p>
      </div>
      <ClipboardDocumentCheckIcon class="h-6 w-6 text-slate-700" />
    </div>

    <div class="mt-4 grid gap-4 sm:grid-cols-3">
      <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
        <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Price</p>
        <p class="text-sm font-semibold text-slate-900">{{ currency(props.price) }}</p>
      </div>
      <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
        <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Deposit</p>
        <div class="flex items-center justify-between gap-2">
          <p class="text-sm font-semibold" :class="props.depositPaid ? 'text-emerald-700' : 'text-slate-900'">
            {{ currency(props.deposit) }}
          </p>
          <span class="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold" :class="depositBadgeClass">
            {{ depositStatus }}
          </span>
        </div>
      </div>
      <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
        <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Start date</p>
        <div class="mt-1 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <CalendarDaysIcon class="h-4 w-4 text-slate-700" />
          <span>{{ props.startDate }}</span>
        </div>
      </div>
    </div>

    <div class="mt-4 flex justify-end">
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow transition-all duration-150 hover:bg-slate-800 hover:shadow-md"
        @click="emit('download')"
      >
        Download contract packet PDF
      </button>
    </div>
  </section>
</template>
