<script setup lang="ts">
const props = defineProps<{
  summary: string;
  manual: boolean;
}>();

const emit = defineEmits<{
  (e: "update:summary", value: string): void;
  (e: "manual-edit"): void;
  (e: "regenerate"): void;
}>();
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
    <div class="mb-2 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <h4 class="text-lg font-semibold text-slate-900">Client Summary (Preview Only)</h4>
      </div>
      <button
        v-if="manual"
        type="button"
        class="text-xs font-semibold text-blue-600 underline-offset-4 hover:underline"
        @click="emit('regenerate')"
      >
        Regenerate
      </button>
    </div>
    <textarea
      :value="summary"
      rows="5"
      class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-blue-300 focus:outline-none"
      placeholder="Generated summary will appear here..."
      @input="emit('update:summary', ($event.target as HTMLTextAreaElement).value); emit('manual-edit')"
    />
  </div>
</template>
