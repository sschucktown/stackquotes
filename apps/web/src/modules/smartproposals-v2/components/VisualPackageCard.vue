<template>
  <button
    type="button"
    class="group flex h-full w-full flex-col justify-between rounded-2xl border bg-white text-left shadow-sm transition duration-200 ease-out hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    :class="[
      selected ? 'scale-[1.02] ring-[var(--spv2-primary)]' : 'scale-100',
      disabled ? 'cursor-default' : 'cursor-pointer',
    ]"
    :style="cardStyle"
    :disabled="disabled"
    role="radio"
    :aria-checked="selected"
    :aria-pressed="selected"
    :aria-disabled="disabled"
    @click="emit('select')"
  >
    <div class="flex flex-col gap-4 px-4 pt-4 sm:flex-row sm:items-start sm:gap-5">
      <div class="flex flex-none items-start gap-3 sm:w-48">
        <div class="mt-2">
          <span
            class="inline-flex h-5 w-5 items-center justify-center rounded-full border-2 transition"
            :style="radioStyle"
            :class="selected ? '' : 'border-slate-300 bg-white group-hover:border-blue-400'"
          >
            <span
              class="h-2.5 w-2.5 rounded-full bg-white transition-opacity"
              :class="selected ? 'opacity-100' : 'opacity-0'"
            />
          </span>
        </div>
        <div class="flex-1">
          <div class="overflow-hidden rounded-xl bg-slate-50 p-2">
            <img
              v-if="pkg.imageUrl"
              :src="pkg.imageUrl"
              :alt="pkg.title"
              class="h-28 w-full object-contain sm:h-32"
              loading="lazy"
            />
            <div
              v-else
              class="flex h-28 w-full items-center justify-center text-sm text-slate-400 sm:h-32"
            >
              Package visual
            </div>
          </div>
        </div>
      </div>

      <div class="flex flex-1 flex-col gap-2">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {{ pkg.label }}
        </p>
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="text-lg font-semibold leading-snug text-slate-900">
            {{ pkg.title }}
          </h3>
          <span
            v-if="pkg.badgeLabel || pkg.isRecommended"
            class="rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white shadow-sm"
          >
            {{ pkg.badgeLabel || "Recommended" }}
          </span>
        </div>
        <p v-if="pkg.subtitle" class="text-sm text-slate-500">
          {{ pkg.subtitle }}
        </p>
      </div>

      <div class="flex flex-none flex-col items-end gap-2 sm:w-28">
        <div
          v-if="pkg.metricLabel && pkg.metricValue"
          class="rounded-xl border border-slate-200 bg-slate-900 px-3 py-2 text-right text-xs text-slate-100 shadow-sm"
        >
          <div class="text-[10px] uppercase tracking-[0.18em] text-slate-400">
            {{ pkg.metricLabel }}
          </div>
          <div class="text-base font-semibold">
            {{ pkg.metricValue }}
          </div>
        </div>

        <img
          v-if="pkg.secondaryImageUrl"
          :src="pkg.secondaryImageUrl"
          alt=""
          class="hidden h-12 w-12 rounded-lg object-contain sm:block"
          loading="lazy"
        />
      </div>
    </div>

    <ul class="mt-4 space-y-1 px-4 text-sm text-slate-600">
      <li
        v-for="(bullet, idx) in pkg.bullets"
        :key="idx"
        class="flex gap-2"
      >
        <span class="mt-1 h-1.5 w-1.5 flex-none rounded-full" :style="{ backgroundColor: accentColor }" />
        <span>{{ bullet }}</span>
      </li>
    </ul>

    <div class="mt-4 border-t border-slate-100 px-4 py-3">
      <div class="flex items-baseline justify-between gap-4">
        <div>
          <div class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Investment
          </div>
          <div class="text-xl font-semibold text-slate-900">
            {{ formatCurrency(pkg.price) }}
          </div>
        </div>
        <div v-if="depositDisplay" class="text-right">
          <div class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Deposit
          </div>
          <div class="text-sm font-medium text-slate-900">
            {{ depositDisplay }}
          </div>
        </div>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { VisualPackage } from "../types";

const props = defineProps<{
  pkg: VisualPackage;
  selected: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{ (e: "select"): void }>();

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const formatCurrency = (value: number) => currencyFormatter.format(value || 0);

const accentColor = "var(--spv2-primary, #2563eb)";

const cardStyle = computed(() =>
  props.selected
    ? { borderColor: accentColor, boxShadow: "0 16px 40px rgba(0,0,0,0.08)" }
    : { borderColor: "#e2e8f0" }
);

const radioStyle = computed(() =>
  props.selected
    ? { borderColor: accentColor, backgroundColor: accentColor }
    : { borderColor: "#cbd5e1", backgroundColor: "#fff" }
);

const depositDisplay = computed(() => {
  const { depositPercent, depositAmount, price } = props.pkg;
  if (depositPercent != null) {
    const amount = props.pkg.depositAmount ?? (price * depositPercent) / 100;
    return `${depositPercent}% (~${formatCurrency(amount)})`;
  }
  if (depositAmount != null) {
    return formatCurrency(depositAmount);
  }
  return null;
});
</script>
