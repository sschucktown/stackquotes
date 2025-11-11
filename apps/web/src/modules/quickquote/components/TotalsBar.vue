<template>
  <div class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <div class="flex items-center justify-between">
      <span class="text-sm text-slate-500">Subtotal</span>
      <span class="text-lg font-semibold text-slate-900">{{ currency(subtotal) }}</span>
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
  total: number;
}>();

const currency = (value: number) => `$${value.toFixed(2)}`;
</script>
