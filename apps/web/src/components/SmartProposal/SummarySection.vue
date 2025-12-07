<script setup lang="ts">
const props = defineProps<{
  summary: string;
  manual: boolean;
}>();

const emit = defineEmits<{
  (e: "update:summary", value: string): void;
  (e: "regenerate"): void;
}>();
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Client Copy</p>
        <p class="text-sm text-slate-600">This client-friendly summary updates automatically unless edited.</p>
      </div>
      <button
        type="button"
        class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        @click="emit('regenerate')"
      >
        Regenerate
      </button>
    </div>
    <textarea
      :value="props.summary"
      class="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-relaxed text-slate-800 outline-none focus:border-slate-300 focus:bg-white"
      rows="4"
      @input="emit('update:summary', ($event.target as HTMLTextAreaElement).value)"
    />
    <p v-if="props.manual" class="mt-1 text-xs text-slate-500">Manual edits locked auto-updates.</p>
  </div>
</template>
