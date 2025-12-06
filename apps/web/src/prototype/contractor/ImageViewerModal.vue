<template>
  <Transition name="fade">
    <div
      v-if="file"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 px-4 py-6 backdrop-blur"
    >
      <div class="w-full max-w-5xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-6">
          <div>
            <p class="text-sm font-semibold text-slate-900">{{ file.name }}</p>
            <p class="text-xs text-slate-500">{{ file.uploadedBy }} • {{ file.uploadedAt }} • {{ file.sizeLabel }}</p>
          </div>
          <button
            class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            @click="$emit('close')"
          >
            Close
          </button>
        </div>

        <div class="max-h-[75vh] overflow-auto px-4 py-6 sm:px-6">
          <div v-if="file.kind === 'image'" class="flex justify-center">
            <img :src="file.url" :alt="file.name" class="max-h-[70vh] rounded-xl shadow" />
          </div>
          <div
            v-else-if="file.kind === 'document'"
            class="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-slate-600"
          >
            <div class="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
              <span class="text-sm font-semibold">PDF</span>
            </div>
            <p class="text-sm font-semibold text-slate-900">{{ file.name }}</p>
            <p class="text-xs text-slate-500">Preview not available in prototype.</p>
          </div>
          <div
            v-else-if="file.kind === 'video'"
            class="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-inner"
          >
            <div class="mb-3 flex items-center gap-2">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                ▶
              </div>
              <div>
                <p class="text-sm font-semibold text-slate-900">{{ file.name }}</p>
                <p class="text-xs text-slate-500">Prototype video placeholder</p>
              </div>
            </div>
            <div class="aspect-video rounded-xl bg-slate-900/60"></div>
          </div>
          <div v-else class="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
            Preview not available for this file type.
          </div>

          <div class="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 shadow-inner">
            <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span class="rounded-full bg-slate-100 px-2 py-0.5 font-semibold">Uploaded by {{ file.uploadedBy }}</span>
              <span>•</span>
              <span>{{ file.uploadedAt }}</span>
              <span v-if="file.folder">• Folder: {{ file.folder }}</span>
            </div>
            <p v-if="file.note" class="mt-2 text-sm text-slate-700">Note: {{ file.note }}</p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { PrototypeFile } from "@/prototype/stores/files";

defineProps<{
  file: PrototypeFile | null;
}>();

defineEmits<{
  (e: "close"): void;
}>();
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
