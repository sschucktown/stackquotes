<template>
  <div class="w-full">
    <div class="relative">
      <SQInput
        v-model="internalQuery"
        :placeholder="placeholder"
        :label="label"
        @input="onInput"
      />
      <div
        v-if="open && results.length"
        class="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
      >
        <ul class="max-h-64 overflow-y-auto divide-y divide-slate-100">
          <li
            v-for="entry in results"
            :key="entry.template.id"
            class="cursor-pointer p-3 hover:bg-slate-50"
            @click="select(entry.template)"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-2">
                <span class="inline-flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-slate-600">🔧</span>
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-slate-800">{{ entry.template.item_label }}</span>
                  <span v-if="entry.template.description" class="text-xs text-slate-500 line-clamp-1">
                    {{ entry.template.description }}
                  </span>
                </div>
              </div>
              <div v-if="entry.avg !== null" class="text-xs font-semibold text-slate-600">
                {{ formatRange(entry.template) }}
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { TradeTemplate } from "@modules/quickquote/stores/quoteStore";

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    results: Array<{ template: TradeTemplate; score: number; avg?: number | null }>;
    placeholder?: string;
    label?: string;
  }>(),
  {
    modelValue: "",
    placeholder: "Search tasks, materials, or templates",
    label: "Search / Add Item",
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "select", template: TradeTemplate): void;
}>();

const internalQuery = ref(props.modelValue ?? "");
const open = ref(false);

watch(
  () => props.modelValue,
  (v) => {
    if (v !== undefined && v !== internalQuery.value) internalQuery.value = v;
  }
);

const results = computed(() => props.results ?? []);

let timer: number | undefined;
const onInput = () => {
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    emit("update:modelValue", internalQuery.value);
    open.value = internalQuery.value.trim().length > 0 && results.value.length > 0;
  }, 150);
};

const select = (tpl: TradeTemplate) => {
  emit("select", tpl);
  internalQuery.value = "";
  emit("update:modelValue", "");
  open.value = false;
};

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const formatRange = (tpl: TradeTemplate) => {
  const low = tpl.default_cost_low ?? null;
  const high = tpl.default_cost_high ?? null;
  if (typeof low === "number" && typeof high === "number") return `${currency.format(low)}–${currency.format(high)}`;
  if (typeof low === "number") return currency.format(low);
  if (typeof high === "number") return currency.format(high);
  return "";
};
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

