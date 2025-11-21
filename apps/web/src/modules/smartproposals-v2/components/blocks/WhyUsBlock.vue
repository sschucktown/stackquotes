<template>
  <section class="space-y-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
    <div class="flex flex-col gap-1">
      <p :class="fontClasses.accent">Why choose us</p>
      <h2 :class="fontClasses.heading" class="text-2xl">A builder obsessed with detail</h2>
    </div>
    <p :class="fontClasses.body" class="text-base leading-relaxed">
      {{ store.whyUsText }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSpv2Store } from "../../stores/useSpv2Store";
import { getFontPresetClasses } from "../../utils/theme";

const store = useSpv2Store();
const fontClasses = computed(() => getFontPresetClasses(store.brand.fontPreset));
</script>
