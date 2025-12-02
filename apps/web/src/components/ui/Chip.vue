<template>
  <span
    class="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
  >
    <span v-if="icon" class="text-sm">{{ icon }}</span>
    <span>{{ label }}</span>
  </span>
</template>

<script setup lang="ts">
defineProps<{
  icon?: string;
  label: string;
}>();
</script>
