<template>
  <div class="grid grid-cols-[2fr_repeat(3,_1fr)_40px] items-center gap-3">
    <SQInput
      :model-value="lineItem.description"
      label="Description"
      placeholder="e.g. Kitchen Remodel"
      @update:model-value="handleDescriptionChange"
    />
    <SQInput
      :model-value="lineItem.quantity"
      label="Qty"
      type="number"
      min="0"
      step="0.1"
      @update:model-value="handleQuantityChange"
    />
    <SQInput
      :model-value="lineItem.unitPrice"
      label="Unit Price"
      type="number"
      min="0"
      step="0.01"
      @update:model-value="handleUnitPriceChange"
    />
    <div class="flex flex-col gap-1 text-sm font-medium text-slate-700">
      <span>Total</span>
      <div class="rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-semibold">
        {{ currency(lineItem.quantity * lineItem.unitPrice) }}
      </div>
    </div>
    <button
      v-if="removable"
      class="mt-6 inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-500"
      type="button"
      @click="$emit('remove', lineItem.id)"
      aria-label="Remove line item"
    >
      &times;
    </button>
  </div>
</template>

<script setup lang="ts">
import type { LineItem } from "@stackquotes/types";
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    lineItem: LineItem;
    removable?: boolean;
  }>(),
  {
    removable: true,
  }
);

const emit = defineEmits<{
  (e: "update", payload: Partial<LineItem>): void;
  (e: "remove", id: string): void;
}>();

const lineItem = computed(() => props.lineItem);

const currency = (value: number) => `$${value.toFixed(2)}`;

const onUpdate = (payload: Partial<LineItem>) => {
  emit("update", { ...payload, id: lineItem.value.id });
};

const handleDescriptionChange = (value: string | number | null | undefined) => {
  onUpdate({ description: typeof value === "string" ? value : `${value ?? ""}` });
};

const roundTo = (num: number, places = 2): number => {
  const factor = Math.pow(10, places);
  // EPSILON guards against binary float imprecision nudging values down
  return Math.round((num + Number.EPSILON) * factor) / factor;
};

const handleQuantityChange = (value: string | number | null | undefined) => {
  const quantityRaw = typeof value === "string" ? parseFloat(value) : Number(value ?? 0);
  const quantity = Number.isFinite(quantityRaw) ? roundTo(quantityRaw, 2) : 0;
  onUpdate({ quantity });
};

const handleUnitPriceChange = (value: string | number | null | undefined) => {
  const raw = typeof value === "string" ? parseFloat(value) : Number(value ?? 0);
  const unitPrice = Number.isFinite(raw) ? roundTo(Math.max(0, raw), 2) : 0;
  onUpdate({ unitPrice });
};
</script>
