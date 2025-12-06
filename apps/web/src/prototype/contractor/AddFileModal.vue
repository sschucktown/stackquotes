<template>
  <Transition name="fade">
    <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6">
      <div class="w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5">
          <div>
            <p class="text-xs uppercase tracking-[0.08em] text-slate-500">Prototype</p>
            <h2 class="text-lg font-semibold text-slate-900">Add File</h2>
          </div>
          <button
            class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            @click="$emit('close')"
          >
            Cancel
          </button>
        </div>

        <div class="space-y-4 px-4 py-4 sm:px-5">
          <div class="grid gap-3 sm:grid-cols-2">
            <div class="space-y-1">
              <label class="text-xs font-semibold text-slate-600">File name</label>
              <input
                v-model="name"
                type="text"
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Measurements.pdf"
              />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-semibold text-slate-600">File type</label>
              <select
                v-model="kind"
                class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="image">Image</option>
                <option value="document">Document</option>
                <option value="video">Video</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <div class="space-y-1">
              <label class="text-xs font-semibold text-slate-600">Folder (optional)</label>
              <input
                v-model="folder"
                type="text"
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Measurements"
              />
            </div>
            <div class="space-y-1">
              <label class="text-xs font-semibold text-slate-600">Size label</label>
              <input
                v-model="sizeLabel"
                type="text"
                class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="2.4 MB"
              />
            </div>
          </div>

          <div class="space-y-1">
            <label class="text-xs font-semibold text-slate-600">Note (optional)</label>
            <textarea
              v-model="note"
              rows="3"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Add a quick note about this file..."
            ></textarea>
          </div>

          <div
            class="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center"
          >
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700">
              ⬆
            </div>
            <p class="mt-2 text-sm font-semibold text-slate-900">Drop file here or click to simulate upload</p>
            <p class="text-xs text-slate-500">Prototype only — no real upload</p>
          </div>

          <div class="flex flex-wrap items-center justify-end gap-2">
            <button
              class="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              @click="$emit('close')"
            >
              Cancel
            </button>
            <button
              class="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-60"
              :disabled="!name"
              @click="submit"
            >
              Add File (Prototype)
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { FileKind } from "@/prototype/stores/files";
import { addMockFile } from "@/prototype/stores/files";

const emit = defineEmits<{
  (e: "close"): void;
}>();

const name = ref("");
const kind = ref<FileKind>("document");
const folder = ref("");
const sizeLabel = ref("");
const note = ref("");

function submit() {
  if (!name.value) return;
  addMockFile({
    name: name.value,
    kind: kind.value,
    folder: folder.value || undefined,
    sizeLabel: sizeLabel.value || undefined,
    note: note.value || undefined,
  });
  emit("close");
}
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
