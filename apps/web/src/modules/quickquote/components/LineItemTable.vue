<template>
  <section
    class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 flex flex-col gap-4"
  >
    <div class="flex items-center justify-between gap-3">
      <div>
        <p
          class="text-xs font-semibold uppercase tracking-wide text-slate-500"
        >
          Scope
        </p>
        <h2 class="mt-1 text-sm font-semibold text-slate-900">Line Items</h2>
      </div>
      <SQButton
        type="button"
        size="sm"
        variant="ghost"
        class="rounded-full"
        @click="add"
      >
        + Add Line Item
      </SQButton>
    </div>

    <div
      v-if="!items.length"
      class="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-sm text-slate-500"
    >
      Start by adding your first line item.
    </div>

    <div v-else class="space-y-3">
      <div
        class="hidden grid-cols-[minmax(0,1.5fr)_minmax(0,2fr)_90px_110px_110px] gap-3 text-xs font-medium text-slate-500 sm:grid"
      >
        <span>Title</span>
        <span>Description</span>
        <span class="text-right">Qty</span>
        <span class="text-right">Unit</span>
        <span class="text-right">Total</span>
      </div>

      <div class="space-y-3">
        <div
          v-for="(item, index) in items"
          :key="item.id"
          class="rounded-2xl border border-slate-200 bg-white/60 p-3 shadow-sm"
        >
          <div
            class="grid gap-3 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,2fr)_90px_110px_110px]"
          >
            <SQInput
              :model-value="item.title"
              label="Title"
              placeholder="e.g., Demolition & Haul Away"
              @update:model-value="
                (value) =>
                  onUpdate(item.id, {
                    title: typeof value === 'string' ? value : String(value ?? ''),
                  })
              "
            />
            <SQTextarea
              :model-value="item.description"
              label="Description"
              rows="2"
              placeholder="Short detail for this line item"
              @update:model-value="
                (value) =>
                  onUpdate(item.id, {
                    description:
                      typeof value === 'string' ? value : String(value ?? ''),
                  })
              "
            />
            <SQInput
              :model-value="item.quantity"
              label="Qty"
              type="number"
              min="0"
              step="0.1"
              inputmode="decimal"
              class="sm:text-right"
              @update:model-value="
                (value) => onUpdateQuantity(item.id, value as string | number | null | undefined)
              "
            />
            <SQInput
              :model-value="item.unit_price"
              label="Unit Price"
              type="number"
              min="0"
              step="0.01"
              inputmode="decimal"
              class="sm:text-right"
              @update:model-value="
                (value) => onUpdateUnitPrice(item.id, value as string | number | null | undefined)
              "
            />
            <div class="flex flex-col gap-1 text-sm text-slate-700">
              <span class="text-xs font-medium text-slate-500">Total</span>
              <div
                class="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-right text-sm font-semibold text-slate-900"
              >
                {{ currency(item.total) }}
              </div>
            </div>
          </div>

          <div class="mt-3 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2 text-xs text-slate-500">
              <button
                type="button"
                class="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
                :disabled="index === 0"
                @click="move(index, index - 1)"
              >
                ↑
              </button>
              <button
                type="button"
                class="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
                :disabled="index === items.length - 1"
                @click="move(index, index + 1)"
              >
                ↓
              </button>
            </div>
            <SQButton
              type="button"
              variant="ghost"
              size="sm"
              class="text-xs text-red-500 hover:text-red-600"
              @click="remove(item.id)"
            >
              Remove
            </SQButton>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import SQButton from "@stackquotes/ui/components/SQButton.vue";
import SQInput from "@stackquotes/ui/components/SQInput.vue";
import SQTextarea from "@stackquotes/ui/components/SQTextarea.vue";
import {
  useQuickQuoteStore,
  type QuickQuoteLineItem,
} from "@modules/quickquote/stores/useQuickQuoteStore";

const store = useQuickQuoteStore();

const items = computed<QuickQuoteLineItem[]>(() => store.current?.line_items ?? []);

const add = () => {
  store.addLineItem();
};

const remove = (id: string) => {
  store.removeLineItem(id);
};

const move = (fromIndex: number, toIndex: number) => {
  store.reorderLineItem(fromIndex, toIndex);
};

const onUpdate = (id: string, patch: Partial<QuickQuoteLineItem>) => {
  store.updateLineItem(id, patch);
};

const toNumber = (value: string | number | null | undefined): number => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const onUpdateQuantity = (
  id: string,
  value: string | number | null | undefined
) => {
  const quantity = toNumber(value);
  store.updateLineItem(id, { quantity });
};

const onUpdateUnitPrice = (
  id: string,
  value: string | number | null | undefined
) => {
  const unit_price = toNumber(value);
  store.updateLineItem(id, { unit_price });
};

const currency = (value: number) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  return formatter.format(value || 0);
};
</script>

