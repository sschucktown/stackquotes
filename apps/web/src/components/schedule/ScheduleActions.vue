<script setup lang="ts">
const props = defineProps<{
  onConfirm: () => void;
  onRequestChange: () => void;
}>();
</script>

<template>
  <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
    <button
      type="button"
      class="w-full rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:-translate-y-[1px] hover:bg-emerald-700 sm:w-auto"
      @click="props.onConfirm"
    >
      Confirm &amp; Lock In
    </button>
    <button
      type="button"
      class="w-full rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-[1px] hover:bg-slate-50 sm:w-auto"
      @click="props.onRequestChange"
    >
      Request a different date
    </button>
  </div>
</template>
