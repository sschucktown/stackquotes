<template>
  <label class="flex flex-col gap-1 text-sm font-medium text-slate-700">
    <span v-if="label">{{ label }}</span>
    <textarea
      v-bind="$attrs"
      :value="modelValue"
      :rows="rows"
      :placeholder="placeholder"
      :class="textareaClasses"
      @input="onInput"
    />
    <small v-if="hint" class="text-xs font-normal text-slate-500">{{ hint }}</small>
    <small v-if="error" class="text-xs font-normal text-red-500">{{ error }}</small>
  </label>
</template>

<script setup lang="ts">
import { computed } from "vue";
import clsx from "clsx";

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    label?: string;
    placeholder?: string;
    hint?: string;
    error?: string;
    rows?: number;
  }>(),
  {
    rows: 4,
  }
);

const emit = defineEmits<["update:modelValue"]>();

const textareaClasses = computed(() =>
  clsx(
    "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sq-primary focus:outline-none focus:ring-2 focus:ring-sq-primary/40",
    props.error && "border-red-400 focus:border-red-500 focus:ring-red-200"
  )
);

const onInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  emit("update:modelValue", target.value);
};
</script>
