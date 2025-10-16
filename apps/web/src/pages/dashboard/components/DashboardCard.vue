<template>
  <button
    type="button"
    class="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
    @click="$emit('click')"
  >
    <div class="flex items-start justify-between gap-2">
      <div>
        <p class="text-sm font-medium text-slate-500">{{ title }}</p>
        <p class="text-2xl font-semibold text-slate-900">
          <template v-if="currency !== undefined">{{ formattedCurrency }}</template>
          <template v-else>{{ value }}</template>
        </p>
      </div>
      <div class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <component :is="iconComponent" class="h-5 w-5" />
      </div>
    </div>
    <p class="mt-3 text-xs text-slate-500">{{ subtitle }}</p>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  DocumentDuplicateIcon,
  CheckCircleIcon,
  TrophyIcon,
  CurrencyDollarIcon,
} from "@heroicons/vue/24/outline";

const props = withDefaults(
  defineProps<{
    title: string;
    subtitle: string;
    value?: number | string;
    currency?: number;
    icon?: "quotes" | "check" | "trophy" | "cash";
  }>(),
  {
    value: 0,
    icon: "quotes",
  }
);

defineEmits<{
  (e: "click"): void;
}>();

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const formattedCurrency = computed(() =>
  props.currency !== undefined ? formatter.format(props.currency) : undefined
);

const iconMap = {
  quotes: DocumentDuplicateIcon,
  check: CheckCircleIcon,
  trophy: TrophyIcon,
  cash: CurrencyDollarIcon,
} as const;

const iconComponent = computed(() => iconMap[props.icon] ?? iconMap.quotes);
</script>
