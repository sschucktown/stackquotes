<template>
  <div
    class="group relative flex w-[88vw] snap-start overflow-hidden rounded-[18px] transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F62FE] focus-visible:ring-offset-2 md:w-full"
    :class="[
      isSelected
        ? 'border-2 border-[#0F62FE] shadow-xl -translate-y-1 scale-[1.02] md:scale-[1.03]'
        : 'border border-transparent shadow-lg hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-xl',
    ]"
    role="radio"
    :aria-checked="isSelected"
    tabindex="0"
    :style="cardStyle"
    @click="emit('select')"
    @keydown.space.prevent="emit('select')"
    @keydown.enter.prevent="emit('select')"
  >
    <div class="flex w-full flex-col gap-5 p-6 sm:flex-row sm:items-start">
      <div class="relative flex w-[120px] flex-none flex-col">
        <span
          class="absolute -left-1.5 -top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full border-2 bg-white text-transparent shadow-sm transition duration-[120ms] ease-out"
          :class="isSelected ? 'border-[#0F62FE] shadow-md' : 'border-slate-200 group-hover:border-blue-400'"
        >
          <span
            class="h-3 w-3 rounded-full transition-opacity duration-[120ms] ease-out"
            :class="isSelected ? 'bg-[#0F62FE] opacity-100' : 'bg-blue-500 opacity-0 group-hover:opacity-60'"
          />
        </span>
        <div class="relative aspect-square overflow-hidden rounded-[12px] bg-white shadow-sm ring-1 ring-slate-100">
          <img
            v-if="imageUrl"
            :src="imageUrl"
            :alt="title"
            class="h-full w-full object-cover"
            loading="lazy"
          />
          <div v-else class="flex h-full w-full items-center justify-center text-sm text-slate-400">
            Package visual
          </div>
        </div>
      </div>

      <div class="flex flex-1 flex-col gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <span class="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            {{ tierLabel }}
          </span>
          <span
            v-if="isSelected"
            class="rounded-full bg-[#0F62FE] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-sm"
          >
            Selected
          </span>
        </div>

        <div class="space-y-1">
          <h2 class="text-2xl font-bold leading-tight text-slate-900">
            {{ title }}
          </h2>
          <p v-if="tagline" class="text-base font-medium text-slate-600">
            {{ tagline }}
          </p>
        </div>

        <ul class="space-y-1.5 text-sm text-slate-700">
          <li
            v-for="(bullet, idx) in bullets"
            :key="idx"
            class="flex items-start gap-2"
          >
            <span class="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-blue-500" aria-hidden="true" />
            <span class="leading-snug">{{ bullet }}</span>
          </li>
        </ul>

        <div class="flex flex-wrap items-end justify-between gap-4 border-t border-white/70 pt-4">
          <div>
            <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Price
            </div>
            <div class="text-[32px] font-semibold leading-none text-slate-900">
              {{ formatCurrency(price) }}
            </div>
          </div>
          <div v-if="depositText" class="text-right text-sm text-slate-500">
            {{ depositText }}
          </div>
        </div>

        <div class="flex justify-end">
          <span
            class="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-base font-semibold transition"
            :class="ctaClass"
          >
            Select {{ tierLabel }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

type Tier = "good" | "better" | "best";

const props = defineProps<{
  title: string;
  tagline?: string;
  price: number;
  deposit?: number;
  bullets: string[];
  imageUrl?: string;
  isSelected?: boolean;
  tier?: Tier;
}>();

const emit = defineEmits<{
  (e: "select"): void;
}>();

const tierMeta = computed(() => {
  const tier: Tier = props.tier ?? "good";

  const map: Record<
    Tier,
    { gradient: string; label: string; ctaClass: string }
  > = {
    good: {
      gradient: "linear-gradient(135deg, #ffffff 0%, #f7f9fb 100%)",
      label: "Good",
      ctaClass:
        "border border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-white/80",
    },
    better: {
      gradient: "linear-gradient(135deg, #ffffff 0%, #eef5ff 100%)",
      label: "Better",
      ctaClass:
        "border border-[#0F62FE] bg-white text-[#0F62FE] hover:bg-[#0F62FE]/5",
    },
    best: {
      gradient: "linear-gradient(135deg, #ffffff 0%, #e8f0ff 100%)",
      label: "Best",
      ctaClass:
        "border border-[#0F62FE] bg-[#0F62FE] text-white shadow-md hover:bg-[#0d55e5]",
    },
  };

  return map[tier];
});

const cardStyle = computed(() => ({
  backgroundImage: tierMeta.value.gradient,
}));

const tierLabel = computed(() => tierMeta.value.label);

const ctaClass = computed(() => tierMeta.value.ctaClass);

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const formatCurrency = (value?: number) => currencyFormatter.format(value ?? 0);

const depositText = computed(() => {
  if (props.deposit == null) return null;
  const amount = (props.price || 0) * (props.deposit / 100);
  return `${props.deposit}% down (~${formatCurrency(amount)})`;
});

const isSelected = computed(() => Boolean(props.isSelected));
const bullets = computed(() => props.bullets || []);
const imageUrl = computed(() => props.imageUrl || "");
const title = computed(() => props.title);
const tagline = computed(() => props.tagline);
</script>
