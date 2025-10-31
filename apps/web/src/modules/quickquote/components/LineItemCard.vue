<template>
  <div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-[1.5fr_repeat(2,_1fr)] sm:items-start">
      <SQInput
        :model-value="model.label"
        label="Item"
        placeholder="e.g. Composite decking, 10x12"
        @update:model-value="(v) => update({ label: String(v ?? '') })"
      />
      <SQInput
        :model-value="model.quantity"
        label="Qty"
        type="number"
        min="0"
        step="0.1"
        @update:model-value="onQuantity"
      />
      <SQInput
        :model-value="model.unitPrice"
        label="Unit Price"
        type="number"
        min="0"
        step="0.01"
        @update:model-value="onUnit"
      />
    </div>
    <div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
      <SQTextarea
        :model-value="model.notes ?? ''"
        label="Notes"
        placeholder="Add scope details, materials, exclusions, or assumptions"
        rows="2"
        @update:model-value="(v) => update({ notes: String(v ?? '') })"
      />
      <div class="flex items-start justify-between gap-3 sm:flex-col sm:items-end">
        <div class="flex flex-col">
          <span class="text-xs font-medium text-slate-600">Total</span>
          <span class="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">
            {{ currency(model.quantity * model.unitPrice) }}
          </span>
        </div>
        <button
          type="button"
          class="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-500"
          aria-label="Remove"
          @click="$emit('remove')"
        >
          &times;
        </button>
      </div>
    </div>
  </div>
  
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { QuickQuoteItem } from "@modules/quickquote/stores/quoteStore";

const props = defineProps<{ modelValue: QuickQuoteItem }>();
const emit = defineEmits<{ (e: 'update:modelValue', value: QuickQuoteItem): void; (e: 'remove'): void }>();

const round2 = (n: number) => Math.round(n * 100) / 100;
const currencyFmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const currency = (n: number) => currencyFmt.format(n || 0);

const model = computed(() => props.modelValue);

const update = (patch: Partial<QuickQuoteItem>) => {
  const next: QuickQuoteItem = {
    ...model.value,
    ...patch,
  };
  const q = typeof next.quantity === 'number' && Number.isFinite(next.quantity) ? next.quantity : 0;
  const u = typeof next.unitPrice === 'number' && Number.isFinite(next.unitPrice) ? next.unitPrice : 0;
  next.total = round2(q * u);
  emit('update:modelValue', next);
};

const onQuantity = (v: string | number | null | undefined) => {
  const parsed = typeof v === 'string' ? parseFloat(v) : Number(v ?? 0);
  update({ quantity: Number.isFinite(parsed) ? parsed : 0 });
};

const onUnit = (v: string | number | null | undefined) => {
  const parsed = typeof v === 'string' ? parseFloat(v) : Number(v ?? 0);
  update({ unitPrice: Number.isFinite(parsed) ? parsed : 0 });
};
</script>

