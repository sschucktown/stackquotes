<template>
  <span :class="badgeClasses">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import clsx from "clsx";

type Tone = "default" | "success" | "warning" | "danger";

const props = withDefaults(
  defineProps<{
    tone?: Tone;
  }>(),
  {
    tone: "default",
  }
);

const palette: Record<Tone, string> = {
  default: "bg-slate-100 text-slate-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
};

const badgeClasses = computed(() =>
  clsx(
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium uppercase tracking-wide",
    palette[props.tone]
  )
);
</script>
