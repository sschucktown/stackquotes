<template>
  <button
    type="button"
    class="group flex h-full w-full flex-col overflow-hidden rounded-[18px] border transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F62FE] focus-visible:ring-offset-2"
    :class="[
      selected
        ? 'border-2 border-[#0F62FE] shadow-xl shadow-slate-900/10 -translate-y-1 scale-[1.01]'
        : 'border border-slate-200 shadow-lg shadow-slate-900/5 hover:-translate-y-1 hover:shadow-xl',
      disabled ? 'cursor-default opacity-80' : 'cursor-pointer',
    ]"
    role="radio"
    :aria-checked="selected"
    :disabled="disabled"
    @click="handleSelect"
    @keydown.enter.prevent="handleSelect"
    @keydown.space.prevent="handleSelect"
  >
    <div class="relative h-48 w-full overflow-hidden bg-white/30">
      <div
        class="absolute inset-0"
        :class="accentBackground"
      />
      <img
        v-if="heroImage"
        :src="heroImage"
        :alt="option.title || option.name"
        class="relative z-10 h-full w-full object-cover"
        loading="lazy"
      />
      <div
        v-else
        class="relative z-10 flex h-full w-full items-center justify-center bg-white/10 text-sm font-semibold uppercase tracking-[0.2em] text-white/70"
      >
        Visual coming soon
      </div>
      <div
        class="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-black/12 to-black/18"
      />
      <div class="absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 shadow-sm">
        <span class="inline-flex h-2 w-2 rounded-full bg-[#0F62FE]" />
        {{ tierLabel }}
      </div>
      <div
        class="absolute right-4 top-4 z-20 rounded-full border border-white/70 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700 shadow-sm"
        v-if="selected"
      >
        Selected
      </div>
    </div>

    <div class="flex flex-1 flex-col gap-4 p-5">
      <div class="space-y-1">
        <h3 class="text-lg font-semibold leading-tight text-slate-900">
          {{ option.title || option.name }}
        </h3>
        <p v-if="option.summary" class="text-sm text-slate-600">
          {{ option.summary }}
        </p>
      </div>

      <ul class="space-y-2 text-sm text-slate-700">
        <li
          v-for="(bullet, idx) in bulletItems"
          :key="idx"
          class="flex items-start gap-2"
        >
          <span class="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-[#0F62FE]" aria-hidden="true" />
          <span class="leading-snug">{{ bullet }}</span>
        </li>
      </ul>

      <div class="mt-auto space-y-2 rounded-2xl bg-white/70 p-4 shadow-inner shadow-slate-900/5 ring-1 ring-white/60">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Investment</p>
            <p class="text-2xl font-semibold text-slate-900">
              {{ currency(option.subtotal) }}
            </p>
            <p v-if="monthlyDisplay" class="text-xs font-medium text-slate-600">
              {{ monthlyDisplay }}
            </p>
          </div>
          <div class="text-right text-sm text-slate-500" v-if="depositText">
            {{ depositText }}
          </div>
        </div>
        <div class="flex justify-end">
          <span
            class="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition"
            :class="ctaClass"
          >
            {{ selected ? "Selected" : "Select" }} {{ tierLabel }}
          </span>
        </div>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ProposalOption } from "@stackquotes/types";
import {
  getDefaultVisualAsset,
  resolveTierFromAbstractKey,
  resolveTradeFromAbstractKey,
  type ProposalTier,
  type ProposalTrade,
} from "../utils/visualAssets";

const props = defineProps<{
  option: ProposalOption;
  trade: ProposalTrade;
  tier: ProposalTier;
  selected: boolean;
  disabled?: boolean;
  monthlyPayment?: number | null;
  depositText?: string | null;
}>();

const emit = defineEmits<{ (e: "select"): void }>();

const resolvedTrade = computed<ProposalTrade>(() => {
  const abstractKey = props.option.visual?.abstract_key;
  return resolveTradeFromAbstractKey(abstractKey ?? props.trade);
});

const resolvedTier = computed<ProposalTier>(() => {
  const abstractKey = props.option.visual?.abstract_key;
  if (abstractKey) return resolveTierFromAbstractKey(abstractKey);
  return props.tier;
});

const asset = computed(() => getDefaultVisualAsset(resolvedTrade.value, resolvedTier.value));

const heroImage = computed(() => props.option.visual?.custom_image_url || asset.value.abstractImageSrc);

const accentBackground = computed(() => {
  const accent = props.option.visual?.accent_key;
  const gradient = accent && accent.startsWith("from-") ? accent : asset.value.accentClass;
  return `bg-gradient-to-br ${gradient}`;
});

const tierLabel = computed(() => {
  const label = props.option.name || props.tier;
  return label;
});

const bulletItems = computed(() => {
  if (props.option.summary) return [props.option.summary];
  const items = props.option.lineItems ?? [];
  if (items.length) {
    return items
      .slice(0, 4)
      .map((entry) => entry.description)
      .filter(Boolean);
  }
  return [];
});

const currency = (n: number | null | undefined) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    Number(n ?? 0)
  );

const monthlyDisplay = computed(() => {
  if (props.monthlyPayment == null) return null;
  if (!Number.isFinite(props.monthlyPayment)) return null;
  return `${currency(props.monthlyPayment)} / mo`;
});

const ctaClass = computed(() =>
  props.selected
    ? "bg-[#0F62FE] text-white shadow-md shadow-blue-600/25"
    : "bg-white text-[#0F62FE] ring-1 ring-[#0F62FE] hover:bg-[#0F62FE]/5"
);

const handleSelect = () => {
  if (props.disabled) return;
  emit("select");
};
</script>
