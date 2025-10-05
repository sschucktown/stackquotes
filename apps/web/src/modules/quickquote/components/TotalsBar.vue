<template>
  <div class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="flex items-center justify-between">
      <span class="text-sm text-slate-500">Subtotal</span>
      <span class="text-lg font-semibold text-slate-900">{{ currency(subtotal) }}</span>
    </div>

    <div class="flex items-center justify-between">
      <div>
        <span class="text-sm text-slate-500">Tax</span>
        <div class="mt-1 text-xs text-slate-400">{{ (taxRate * 100).toFixed(2) }}%</div>
      </div>
      <span class="text-lg font-semibold text-slate-900">{{ currency(tax) }}</span>
    </div>

    <div>
      <SQInput
        :model-value="taxRate"
        label="Tax Rate"
        type="number"
        min="0"
        max="1"
        step="0.01"
        hint="0.00 - 1.00"
        @update:model-value="(value) => $emit('update:taxRate', Number(value))"
      />
    </div>

    <div class="flex items-center justify-between border-t border-slate-200 pt-4">
      <span class="text-base font-semibold text-slate-700">Total</span>
      <span class="text-2xl font-bold text-slate-900">{{ currency(total) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  subtotal: number;
  tax: number;
  total: number;
  taxRate: number;
}>();

const currency = (value: number) => `$${value.toFixed(2)}`;
</script>
