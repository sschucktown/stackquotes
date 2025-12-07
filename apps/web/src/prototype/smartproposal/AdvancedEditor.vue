<script setup lang="ts">
import type { ProposalOption } from "./types";

const props = defineProps<{
  open: boolean;
  option: ProposalOption | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
</script>

<template>
  <div v-if="open && option" class="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 backdrop-blur" @click.self="emit('close')">
    <div class="w-full max-w-4xl rounded-t-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:rounded-2xl sm:mt-10">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Advanced editor</p>
          <h3 class="text-lg font-semibold text-slate-900">{{ option.label }} details</h3>
          <p class="text-sm text-slate-600">Internal only. Clients never see this view.</p>
        </div>
        <button
          type="button"
          class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          @click="emit('close')"
        >
          Close
        </button>
      </div>

      <div class="mt-4 overflow-hidden rounded-xl border border-slate-200">
        <div class="grid grid-cols-4 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          <span>Line item</span>
          <span>Cost</span>
          <span>Price</span>
          <span>Margin</span>
        </div>
        <div class="divide-y divide-slate-100">
          <div
            v-for="item in option.items || []"
            :key="item.id"
            class="grid grid-cols-4 items-center px-3 py-2 text-sm text-slate-800"
          >
            <div class="flex flex-col">
              <span class="font-semibold">{{ item.name }}</span>
              <span class="text-xs text-slate-500">{{ item.desc }}</span>
            </div>
            <span>{{ formatCurrency(Number(item.cost) || 0) }}</span>
            <span class="font-semibold">{{ formatCurrency(Number(item.price) || 0) }}</span>
            <span class="text-sm font-semibold text-slate-700">
              {{
                (Number(item.price) || 0) > 0
                  ? Math.round(((Number(item.price) - Number(item.cost || 0)) / Number(item.price)) * 100)
                  : 0
              }}%
            </span>
          </div>
        </div>
        <div class="grid grid-cols-4 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900">
          <span>Totals</span>
          <span>{{ formatCurrency((option.items || []).reduce((sum, item) => sum + Number(item.cost || 0), 0)) }}</span>
          <span>{{ formatCurrency((option.items || []).reduce((sum, item) => sum + Number(item.price || 0), 0)) }}</span>
          <span class="text-emerald-700">
            {{
              (() => {
                const cost = (option.items || []).reduce((sum, item) => sum + Number(item.cost || 0), 0);
                const price = (option.items || []).reduce((sum, item) => sum + Number(item.price || 0), 0);
                return price > 0 ? Math.round(((price - cost) / price) * 100) : 0;
              })()
            }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
