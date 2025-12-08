<script setup lang="ts">
import { defineProps } from "vue";

const props = defineProps<{
  title: string;
  subtitle?: string;
}>();
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-sm font-semibold text-slate-900">{{ props.title }}</p>
        <p v-if="props.subtitle" class="text-xs text-slate-500">{{ props.subtitle }}</p>
      </div>
    </div>
    <div class="mt-3 space-y-2">
      <slot />
    </div>
  </section>
</template>
