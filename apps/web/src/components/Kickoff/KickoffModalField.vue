<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label: string;
    hint?: string;
    required?: boolean;
  }>(),
  {
    hint: "",
    required: false,
  }
);
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <label class="text-sm font-semibold text-slate-900">
        {{ props.label }}
        <span v-if="props.required" class="text-amber-600">*</span>
      </label>
      <span v-if="props.hint" class="text-xs text-slate-500">{{ props.hint }}</span>
    </div>
    <slot />
  </div>
</template>
