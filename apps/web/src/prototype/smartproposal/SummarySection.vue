<script setup lang="ts">
const props = defineProps<{
  summary: string;
  upgradeNotes: { id: string; label: string; enabled: boolean }[];
}>();

const emit = defineEmits<{
  (e: "update:summary", value: string): void;
  (e: "regenerate"): void;
  (e: "toggle-upgrade", payload: { id: string; value: boolean }): void;
}>();
</script>

<template>
  <div class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition hover:shadow-md sm:px-6 sm:py-5">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Proposal summary</p>
        <h3 class="text-lg font-semibold text-slate-900">Client-ready overview</h3>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
        @click="emit('regenerate')"
      >
        ↻ Regenerate
      </button>
    </div>

    <textarea
      :value="props.summary"
      class="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-300 focus:bg-white"
      rows="4"
      @input="emit('update:summary', ($event.target as HTMLTextAreaElement).value)"
    />

    <div class="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 shadow-inner">
      <div class="flex items-center justify-between">
        <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Upgrade notes</p>
        <span class="text-[11px] font-semibold text-slate-500">Optional upsells</span>
      </div>
      <div class="mt-2 space-y-2">
        <label
          v-for="note in props.upgradeNotes"
          :key="note.id"
          class="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm"
        >
          <span>{{ note.label }}</span>
          <input
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            :checked="note.enabled"
            @change="emit('toggle-upgrade', { id: note.id, value: ($event.target as HTMLInputElement).checked })"
          />
        </label>
      </div>
    </div>
  </div>
</template>
