<template>
  <span
    class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em]"
    :class="badgeClass"
  >
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  variant?: "solid" | "subtle" | "outline";
  tone?: "amber" | "blue" | "slate";
}>();

const badgeClass = computed(() => {
  const tone = props.tone || "slate";
  const base = {
    amber: {
      solid: "bg-amber-500 text-slate-900",
      subtle: "bg-amber-100 text-amber-700",
      outline: "border border-amber-400 text-amber-700",
    },
    blue: {
      solid: "bg-blue-600 text-white",
      subtle: "bg-blue-100 text-blue-700",
      outline: "border border-blue-400 text-blue-700",
    },
    slate: {
      solid: "bg-slate-900 text-white",
      subtle: "bg-slate-100 text-slate-700",
      outline: "border border-slate-300 text-slate-700",
    },
  } as const;
  const variant = props.variant || "subtle";
  return base[tone][variant];
});
</script>
