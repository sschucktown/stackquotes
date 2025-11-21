<template>
  <section
    class="rounded-3xl p-8 text-white shadow-sm"
    :style="heroStyle"
  >
    <div class="flex flex-col gap-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div
            v-if="brand.logoDataUrl"
            class="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/40"
          >
            <img :src="brand.logoDataUrl" alt="Brand logo" class="h-full w-full object-contain" />
          </div>
          <div class="text-sm font-medium uppercase tracking-[0.4em] text-white/70">
            Proposal for {{ store.clientName }}
          </div>
        </div>
        <span class="rounded-full px-4 py-1 text-xs font-medium text-slate-900" :style="chipStyle">
          {{ store.jobAddress }}
        </span>
      </div>
      <div class="space-y-3">
        <h1 :class="fontClasses.heading" class="text-3xl md:text-4xl">
          {{ hero.title }}
        </h1>
        <p :class="fontClasses.body" class="max-w-3xl text-base text-white/80">
          {{ hero.subtitle }}
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-3 text-sm text-white/80">
        <div class="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2">
          <span class="h-2 w-2 rounded-full bg-emerald-300" />
          <span>Draft prepared by StackQuotes contractor portal</span>
        </div>
        <button
          type="button"
          class="rounded-full bg-white/95 px-5 py-2 text-sm font-semibold shadow ring-1 ring-black/10 transition hover:bg-white"
          :style="{ color: brand.primaryColor }"
        >
          Approve proposal
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSpv2Store } from "../../stores/useSpv2Store";
import { getFontPresetClasses } from "../../utils/theme";

const store = useSpv2Store();
const brand = computed(() => store.brand);
const hero = computed(() => store.hero);

const heroStyle = computed(() => ({
  background: `linear-gradient(135deg, ${brand.value.primaryColor}, #0b1f33)`,
}));

const chipStyle = computed(() => ({
  backgroundColor: brand.value.accentColor,
}));

const fontClasses = computed(() => getFontPresetClasses(brand.value.fontPreset));
</script>
