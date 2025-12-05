<template>
  <Transition name="modal">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 px-3 pb-3 md:items-center md:px-4 md:pb-0"
    >
      <div
        class="w-full max-w-md transform rounded-t-3xl bg-white shadow-2xl transition md:rounded-2xl"
      >
        <div class="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">Add File</p>
            <h3 class="text-lg font-semibold text-slate-900">New Upload</h3>
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

        <div class="space-y-5 px-5 py-5">
          <div
            class="flex h-40 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-600 transition hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-inner"
          >
            <div class="flex flex-col items-center gap-2 text-center">
              <div class="rounded-full bg-white px-4 py-2 text-lg shadow-inner">📁</div>
              <p class="text-sm font-semibold">Drag a file here or click to select</p>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-600">File Type</p>
            <div class="flex flex-wrap items-center gap-2">
              <button
                v-for="option in typeOptions"
                :key="option.value"
                class="rounded-full border px-4 py-2 text-sm font-semibold transition"
                :class="selectedType === option.value
                  ? option.active
                  : option.inactive"
                @click="selectedType = option.value"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <div class="space-y-2">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-600">Preview</p>
            <div
              class="flex h-32 items-center justify-center rounded-xl border border-slate-200 shadow-inner"
              :class="previewClass"
            >
              <template v-if="selectedType === 'image'">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h12" />
                  <path d="m21 15-3.5-3.5a2 2 0 0 0-2.9 0L9 18" />
                  <path d="m17 18 2 2 4-4" />
                  <circle cx="9" cy="9" r="2" />
                </svg>
              </template>
              <template v-else-if="selectedType === 'video'">
                <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/80 text-violet-600 shadow-lg ring-2 ring-violet-100">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-8 w-8" fill="currentColor">
                    <path d="m9 7 8 5-8 5V7Z" />
                  </svg>
                </div>
              </template>
              <template v-else>
                <div class="flex h-16 w-12 items-center justify-center rounded-xl bg-white/85 text-slate-700 shadow-inner ring-1 ring-slate-200">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M7 3h7l4 4v14H7z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14 3v4h4" />
                  </svg>
                </div>
              </template>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-600" for="filename">Filename</label>
            <input
              id="filename"
              v-model="filename"
              type="text"
              class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-inner focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
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
              @click="handleClose"
            >
              Add File
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

type FileType = "image" | "video" | "document";

const props = defineProps<{
  show: boolean;
  onClose?: () => void;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const selectedType = ref<FileType>("image");
const filename = ref("new_file");

const typeOptions = [
  {
    label: "Image",
    value: "image" as FileType,
    active: "bg-blue-600 text-white shadow-md border border-blue-600",
    inactive: "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
  },
  {
    label: "Video",
    value: "video" as FileType,
    active: "bg-violet-600 text-white shadow-md border border-violet-600",
    inactive: "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
  },
  {
    label: "Document",
    value: "document" as FileType,
    active: "bg-slate-800 text-white shadow-md border border-slate-800",
    inactive: "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
  }
];

const previewClass = computed(() => {
  if (selectedType.value === "video") return "bg-violet-900/80 text-white";
  if (selectedType.value === "document") return "bg-slate-100 text-slate-700";
  return "bg-slate-200 text-slate-600";
});

const handleClose = () => {
  emit("close");
  props.onClose?.();
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
