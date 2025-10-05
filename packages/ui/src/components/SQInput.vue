ï»¿<template>
  <label class="flex flex-col gap-1 text-sm font-medium text-slate-700">
    <span v-if="label">{{ label }}<span v-if="required" class="text-red-500">*</span></span>
    <input
      v-bind="$attrs"
      :value="modelValue"
      :placeholder="placeholder"
      :class="inputClasses"
      @input="onInput"
    />
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
  required?: boolean;
  size?: "sm" | "md" | "lg";
}>();

const emit = defineEmits<{ (e: 'update:modelValue', value: string | number): void }>();

const inputClasses = computed(() =>
  clsx(
    "w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sq-primary focus:outline-none focus:ring-2 focus:ring-sq-primary/40 disabled:cursor-not-allowed disabled:bg-slate-100",
    {
      sm: "py-1.5",
      md: "py-2",
      lg: "py-2.5",
    }[props.size ?? "md"],
    props.error && "border-red-400 focus:border-red-500 focus:ring-red-200"
  )
);

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit("update:modelValue", target.value);
};
</script>
