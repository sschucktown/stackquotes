<script setup lang="ts">
import type { QuickQuoteAddOn } from "@/stores/quickQuotePrototype";

const props = defineProps<{
  addOns: QuickQuoteAddOn[];
}>();

const emit = defineEmits<{
  (e: "toggle", payload: { id: string; value: boolean }): void;
  (e: "update", payload: { id: string; field: "price" | "cost" | "notes"; value: unknown }): void;
}>();
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h3 class="text-lg font-semibold text-slate-900">Add-Ons</h3>
        <p class="text-sm text-slate-500">Optional upsells that adjust the ballpark automatically.</p>
      </div>
      <span class="text-xs text-slate-500">Prefilled from template</span>
    </div>

    <div class="mt-3 space-y-3">
      <div
        v-for="addOn in addOns"
        :key="addOn.id"
        class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 shadow-inner transition hover:-translate-y-[1px] hover:shadow-md"
      >
        <div class="flex flex-wrap items-center gap-3">
          <label class="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <input
              :checked="addOn.enabled"
              type="checkbox"
              class="h-4 w-4 rounded border-slate-300 text-blue-600"
              @change="emit('toggle', { id: addOn.id, value: ($event.target as HTMLInputElement).checked })"
            />
            {{ addOn.label }}
          </label>
          <span class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">Add-on</span>
        </div>
        <div class="mt-3 grid gap-3 sm:grid-cols-3">
          <div class="flex flex-col gap-1">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Price</p>
            <div class="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-inner">
              <span class="text-slate-500">$</span>
              <input
                :value="addOn.price"
                type="number"
                min="0"
                class="w-full bg-transparent text-right text-sm font-semibold text-slate-900 outline-none"
                @input="emit('update', { id: addOn.id, field: 'price', value: ($event.target as HTMLInputElement).value })"
              />
            </div>
          </div>
          <div class="flex flex-col gap-1">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Cost (internal)</p>
            <div class="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-inner">
              <span class="text-slate-500">$</span>
              <input
                :value="addOn.cost"
                type="number"
                min="0"
                class="w-full bg-transparent text-right text-sm font-semibold text-slate-900 outline-none"
                @input="emit('update', { id: addOn.id, field: 'cost', value: ($event.target as HTMLInputElement).value })"
              />
            </div>
          </div>
          <div class="flex flex-col gap-1">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Notes</p>
            <input
              :value="addOn.notes"
              type="text"
              placeholder="Optional note"
              class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-blue-300 focus:outline-none"
              @input="emit('update', { id: addOn.id, field: 'notes', value: ($event.target as HTMLInputElement).value })"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
