<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  projectName: string;
  projectLocation: string;
  confirmed: boolean;
}>();

const statusLabel = computed(() => (props.confirmed ? "Ready to start" : "Awaiting schedule"));
const statusClass = computed(() =>
  props.confirmed
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-amber-200 bg-amber-50 text-amber-700"
);
</script>

<template>
  <header class="flex items-start justify-between gap-3">
    <div>
      <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Client dashboard</p>
      <h1 class="text-2xl font-semibold text-slate-900">Your Project Dashboard</h1>
      <p class="mt-1 text-sm text-slate-500">Everything about your project, in one place.</p>
      <p class="text-xs text-slate-400">{{ projectName }} • {{ projectLocation }}</p>
    </div>
    <span
      class="rounded-full border px-3 py-1 text-xs font-semibold shadow-inner"
      :class="statusClass"
    >
      {{ statusLabel }}
    </span>
  </header>
</template>
