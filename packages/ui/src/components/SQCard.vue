<template>
  <div :class="wrapperClasses">
    <header v-if="title" class="mb-3">
      <h3 class="text-base font-semibold text-slate-900">{{ title }}</h3>
      <p v-if="description" class="text-sm text-slate-500">{{ description }}</p>
    </header>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import clsx from "clsx";

const props = withDefaults(
  defineProps<{
    padded?: boolean;
    title?: string;
    description?: string;
  }>(),
  {
    padded: true,
  }
);

const wrapperClasses = computed(() =>
  clsx(
    "rounded-xl border border-slate-200 bg-white shadow-sm",
    props.padded ? "p-6" : "p-0"
  )
);
</script>
