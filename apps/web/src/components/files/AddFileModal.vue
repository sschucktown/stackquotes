<template>
  <Transition name="modal">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 px-3 pb-3 backdrop-blur-sm md:items-center md:px-4 md:pb-0"
    >
      <div class="w-full max-w-lg transform rounded-t-3xl bg-white shadow-2xl transition md:rounded-2xl">
        <div class="flex items-start justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Add File</p>
            <h3 class="text-lg font-semibold text-slate-900">Upload to Project</h3>
          </div>
          <button
            class="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
            @click="handleClose"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="m18 6-12 12" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-5 px-6 py-5">
          <div class="space-y-2">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-600">File Category</p>
            <div class="flex flex-wrap items-center gap-2">
              <button
                v-for="option in categories"
                :key="option.value"
                class="rounded-full border px-4 py-2 text-sm font-semibold transition"
                :class="selectedType === option.value ? option.active : option.inactive"
                @click="selectedType = option.value"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <div
            class="flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-600 transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-inner"
          >
            <div class="flex flex-col items-center gap-2 text-center">
              <div class="rounded-full bg-white px-4 py-2 text-lg shadow-inner">📁</div>
              <p class="text-sm font-semibold">Drag a file here or click to select</p>
              <p class="text-xs text-slate-500">Prototype only — no actual upload</p>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-600" for="file-name">File Name</label>
            <input
              id="file-name"
              v-model="fileName"
              type="text"
              class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-inner focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="deck_notes"
            />
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button
              class="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
              @click="handleClose"
            >
              Cancel
            </button>
            <button
              class="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-blue-700"
              @click="handleAdd"
            >
              Add File to Project
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from "vue";

type FileType = "image" | "document" | "video";

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "add", file: { name: string; type: FileType; thumbnail: string }): void;
}>();

const selectedType = ref<FileType>("image");
const fileName = ref("new_file");

const categories = [
  {
    label: "Image",
    value: "image" as FileType,
    active: "bg-blue-600 text-white shadow-md border border-blue-600",
    inactive: "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
  },
  {
    label: "Document",
    value: "document" as FileType,
    active: "bg-slate-800 text-white shadow-md border border-slate-800",
    inactive: "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
  },
  {
    label: "Video",
    value: "video" as FileType,
    active: "bg-violet-600 text-white shadow-md border border-violet-600",
    inactive: "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
  }
];

const handleClose = () => {
  emit("close");
};

const handleAdd = () => {
  const placeholder =
    selectedType.value === "image"
      ? "https://placehold.co/600x400?text=Image"
      : selectedType.value === "video"
        ? "https://placehold.co/600x400?text=Video"
        : "https://placehold.co/600x400?text=Document";

  emit("add", {
    name: fileName.value || "new_file",
    type: selectedType.value,
    thumbnail: placeholder
  });
  emit("close");
};
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.98);
}
</style>
