<template>
  <button
    type="button"
    class="group transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    :class="wrapperClass"
    :title="variant === 'desktop' && collapsed ? label : undefined"
    @click="$emit('click')"
  >
    <component
      :is="icon"
      :class="iconClass"
    />
    <span
      v-if="variant === 'desktop' && !collapsed"
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
    collapsed?: boolean;
  }>(),
  {
    active: false,
    variant: "mobile",
    collapsed: false,
  }
);

defineEmits<{
  (e: "click"): void;
}>();

const wrapperClass = computed(() => {
  if (props.variant === "desktop") {
    return [
      "flex w-full items-center gap-3 rounded-xl px-3 py-2 transition",
      props.collapsed ? "justify-center px-2" : "",
      props.active
        ? "border-l-4 border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
        : "border-l-4 border-transparent text-slate-600 hover:border-blue-200 hover:bg-slate-50 hover:text-slate-700",
    ];
  }
  return [
    "flex w-full flex-col items-center gap-1 rounded-lg px-3 py-2 transition",
    props.active
      ? "text-blue-600"
      : "text-slate-500 hover:text-slate-700",
  ];
});

const iconClass = computed(() => {
  if (props.variant === "desktop") {
    return [
      "h-5 w-5 transition",
      props.active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600",
    ];
  }
  return [
    "h-5 w-5 transition",
    props.active ? "text-blue-600" : "text-slate-400",
  ];
});

const labelClass = computed(() =>
  props.active ? "text-blue-700" : "text-slate-600 group-hover:text-slate-700"
);
</script>
