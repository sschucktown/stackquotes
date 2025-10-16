<template>
  <button
    type="button"
    class="group transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    :class="wrapperClass"
    @click="$emit('click')"
  >
    <component
      :is="icon"
      :class="iconClass"
    />
    <span
      v-if="variant === 'desktop'"
      class="text-sm font-medium transition"
      :class="labelClass"
    >
      {{ label }}
    </span>
    <span
      v-else
      class="mt-1 text-xs font-medium"
      :class="labelClass"
    >
      {{ label }}
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed, type Component } from "vue";

const props = withDefaults(
  defineProps<{
    label: string;
    icon: Component;
    active?: boolean;
    variant?: "mobile" | "desktop";
  }>(),
  {
    active: false,
    variant: "mobile",
  }
);

defineEmits<{
  (e: "click"): void;
}>();

const wrapperClass = computed(() => {
  if (props.variant === "desktop") {
    return [
      "flex w-full items-center gap-3 rounded-xl px-3 py-2",
      props.active
        ? "bg-blue-50 text-blue-600"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
    ];
  }
  return [
    "flex w-full flex-col items-center gap-1 rounded-lg px-3 py-2",
    props.active
      ? "text-blue-600"
      : "text-slate-500 hover:text-slate-700",
  ];
});

const iconClass = computed(() => {
  if (props.variant === "desktop") {
    return [
      "h-5 w-5 transition",
      props.active ? "stroke-blue-600" : "stroke-slate-400 group-hover:stroke-slate-600",
    ];
  }
  return [
    "h-5 w-5 transition",
    props.active ? "stroke-blue-600" : "stroke-slate-400",
  ];
});

const labelClass = computed(() =>
  props.active ? "text-blue-600" : "text-slate-600 group-hover:text-slate-700"
);
</script>
