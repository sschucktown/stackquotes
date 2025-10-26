<template>
  <div
    class="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 shadow-sm sm:flex-row sm:items-center sm:justify-between"
  >
    <span class="text-sm">{{ message }}</span>
    <button
      type="button"
      class="inline-flex items-center rounded-lg bg-[#2563eb] px-3 py-2 text-xs font-semibold text-white shadow transition hover:bg-[#1d4ed8]"
      @click="$emit('upgrade')"
    >
      Upgrade to Pro
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string;
}>();

defineEmits<{
  (event: "upgrade"): void;
}>();
</script>

