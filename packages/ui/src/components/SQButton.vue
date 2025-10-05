<template>
  <button
    :class="buttonClasses"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const props = withDefaults(
  defineProps<{
    variant?: Variant;
    size?: Size;
    block?: boolean;
    loading?: boolean;
    disabled?: boolean;
  }>(),
  {
    variant: "primary",
    size: "md",
    block: false,
    loading: false,
    disabled: false,
  }
);

const buttonClasses = computed(() =>
  clsx(
    "inline-flex items-center justify-center rounded-md font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed",
    props.block ? "w-full" : "w-auto",
    {
      primary:
        "bg-sq-primary text-white hover:bg-sq-primary-dark focus-visible:ring-sq-primary/50",
      secondary:
        "bg-white text-sq-primary border border-sq-primary hover:bg-sq-primary/5 focus-visible:ring-sq-primary/50",
      ghost:
        "bg-transparent text-sq-primary hover:bg-sq-primary/10 focus-visible:ring-sq-primary/30",
      danger:
        "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/60",
    }[props.variant],
    {
      sm: "text-xs px-3 py-1.5",
      md: "text-sm px-4 py-2",
      lg: "text-base px-6 py-3",
    }[props.size],
    props.loading && "opacity-70 pointer-events-none",
    props.disabled && "opacity-50"
  )
);
</script>

<style scoped>
:global(:root) {
  --sq-primary: #2d6ee4;
  --sq-primary-dark: #1b4db3;
}
</style>
