ï»¿<template>
  <label class="flex flex-col gap-1 text-sm font-medium text-slate-700">
    <span v-if="label">{{ label }}</span>
    <select
      v-bind="$attrs"
      :value="modelValue"
      :class="selectClasses"
      @change="onChange"
    >
      <option v-if="placeholder" disabled value="">{{ placeholder }}</option>
      <slot />
    </select>
    <small v-if="hint" class="text-xs font-normal text-slate-500">{{ hint }}</small>
    <small v-if="error" class="text-xs font-normal text-red-500">{{ error }}</small>
  </label>
</template>

<script setup lang="ts">
import { computed } from "vue";
import clsx from "clsx";

const props = defineProps<{
  modelValue?: string | number;
  label?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', value: string | number): void }>();

const selectClasses = computed(() =>
  clsx(
    "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-sq-primary focus:outline-none focus:ring-2 focus:ring-sq-primary/40",
    props.error && "border-red-400 focus:border-red-500 focus:ring-red-200"
  )
);

const onChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit("update:modelValue", target.value);
};
</script>
