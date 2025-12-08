<script setup lang="ts">
const props = defineProps<{
  steps?: string[];
}>();

const defaultSteps = ["Schedule proposed", "Awaiting your confirmation", "Deposit due at scheduling"];
</script>

<template>
  <ul class="space-y-3 text-sm text-slate-700">
    <li
      v-for="step in props.steps || defaultSteps"
      :key="step"
      class="flex items-start gap-3"
    >
      <span class="mt-[6px] h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
      <div>
        <p class="font-semibold text-slate-900">{{ step }}</p>
      </div>
    </li>
  </ul>
</template>
