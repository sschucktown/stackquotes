<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { ProposalOption } from "../optionsData";
import OptionUpgrades from "./OptionUpgrades.vue";
import ImagePreviewSwap from "./ImagePreviewSwap.vue";

const props = defineProps<{
  option: ProposalOption;
  selected: boolean;
  totalPrice: number;
  selectedUpgrades: string[];
}>();

const emit = defineEmits<{
  (e: "select", id: string): void;
  (e: "toggle-upgrade", id: string): void;
}>();

const expanded = ref(false);
const previewSrc = ref(props.option.baseImage);

watch(
  () => props.selectedUpgrades,
  (list) => {
    const withImage = props.option.upgrades.find((u) => list.includes(u.id) && u.image);
    previewSrc.value = withImage?.image || props.option.baseImage;
  },
  { immediate: true }
);

const cardClasses = computed(() =>
  props.selected
    ? "border-emerald-500 ring-2 ring-emerald-200 scale-[1.02] shadow-[0_2px_16px_rgba(16,185,129,0.15)]"
    : "border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
);

const toggleDetails = () => {
  expanded.value = !expanded.value;
};
</script>

<template>
  <article
    class="relative flex min-w-[280px] flex-col gap-3 rounded-2xl border bg-white px-4 py-4 transition-all duration-300 ease-out lg:min-w-[340px]"
    :class="cardClasses"
    @click="emit('select', option.id)"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="space-y-1">
        <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{{ option.label }}</p>
        <p class="text-sm font-semibold text-slate-800">{{ option.tagline }}</p>
        <p class="text-xs text-slate-500">{{ option.description }}</p>
      </div>
      <div class="flex flex-col items-end gap-1">
        <span
          v-if="option.badge"
          class="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700"
        >
          {{ option.badge }}
        </span>
        <Transition name="fade-scale" mode="out-in">
          <div
            :key="totalPrice"
            class="text-2xl font-bold"
            :class="selected ? 'text-emerald-600' : 'text-slate-900'"
          >
            {{ totalPrice.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) }}
          </div>
        </Transition>
      </div>
    </div>

    <ImagePreviewSwap :src="previewSrc" :alt="option.label" />

    <div class="space-y-1 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 shadow-inner">
      <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Highlights</p>
      <ul class="space-y-1 text-sm text-slate-800">
        <li v-for="item in option.included.slice(0, 2)" :key="item" class="flex items-start gap-2">
          <span class="mt-1 text-emerald-500">✓</span>
          <span>{{ item }}</span>
        </li>
      </ul>
      <button
        type="button"
        class="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
        @click.stop="toggleDetails"
      >
        {{ expanded ? "Hide details" : "Show more details" }}
        <span aria-hidden="true">{{ expanded ? "↑" : "↓" }}</span>
      </button>
    </div>

    <Transition name="fade-slide">
      <div v-if="expanded" class="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3 shadow-inner">
        <div class="space-y-1">
          <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">What's included</p>
          <ul class="space-y-1 text-sm text-slate-800">
            <li v-for="item in option.included" :key="item" class="flex items-start gap-2">
              <span class="mt-1 h-1.5 w-1.5 rounded-full bg-slate-300"></span>
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
        <div class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Upgrades</p>
          <OptionUpgrades
            :upgrades="option.upgrades"
            :selected-ids="selectedUpgrades"
            @toggle-upgrade="emit('toggle-upgrade', $event)"
          />
        </div>
      </div>
    </Transition>

    <div class="flex items-center justify-between text-xs text-slate-500">
      <span>Client-facing price only. Taxes handled at approval.</span>
      <button
        type="button"
        class="rounded-full px-3 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50"
        @click.stop="emit('select', option.id)"
      >
        Select
      </button>
    </div>
  </article>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.18s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
