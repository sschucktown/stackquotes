<template>
  <div class="min-h-screen bg-slate-50 text-slate-800">
    <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div class="flex items-center gap-3">
          <button
            class="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 shadow-inner transition hover:bg-slate-200"
          >
            Job Overview
          </button>
          <div class="flex items-center gap-2">
            <h1 class="text-lg font-semibold text-slate-900">{{ jobName }}</h1>
            <span class="rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1 text-xs font-semibold text-white shadow">
              In Progress
            </span>
          </div>
        </div>
        <button
          class="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 shadow-inner transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-100"
          @click="showAddFileModal = true"
        >
          <span class="flex h-6 w-6 items-center justify-center rounded-full bg-white text-blue-700 shadow-inner">+</span>
          Add File
        </button>
      </div>
    </header>

    <main class="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-3">
            <div class="rounded-xl bg-slate-50 px-3 py-2 shadow-inner">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Total</p>
              <p class="text-sm font-semibold text-slate-900">{{ totalLabel }}</p>
            </div>
            <p class="text-sm text-slate-600">Files & Photos for {{ jobName }}</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button
              v-for="filter in filters"
              :key="filter.value"
              class="rounded-full border px-3 py-1 text-xs font-semibold transition"
              :class="activeFilter === filter.value
                ? 'border-blue-200 bg-blue-600 text-white shadow'
                : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'"
              @click="setFilter(filter.value)"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-wide text-slate-500">Job Library</p>
            <h2 class="text-base font-semibold text-slate-900">Maple St Deck Files</h2>
          </div>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Demo Only</span>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            class="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-400 transition hover:-translate-y-0.5 hover:bg-slate-100"
            @click="showAddFileModal = true"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </div>
          <article
            v-for="file in visibleFiles"
            :key="file.name"
            class="group flex cursor-pointer flex-col gap-3 rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            @click="openViewer(file)"
          >
            <div
              class="relative h-36 overflow-hidden rounded-xl border border-slate-100 bg-slate-100"
            >
              <img
                :src="previewSrc(file)"
                class="h-full w-full object-cover transition duration-200 group-hover:brightness-90"
                alt=""
              />
              <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent"></div>
            </div>
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-semibold text-slate-800">{{ file.name }}</p>
                <p class="text-xs text-slate-500">Updated {{ file.updated }}</p>
              </div>
              <span
                class="rounded-full px-3 py-1 text-xs font-semibold"
                :class="badgeClasses(file.type)"
              >
                {{ typeLabel(file.type) }}
              </span>
            </div>
          </article>
        </div>
      </section>
    </main>

    <Transition name="modal">
      <div
        v-if="selectedFile"
        class="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 px-3 pb-3 md:items-center md:px-4 md:pb-0"
      >
        <div class="w-full max-w-2xl transform rounded-t-3xl bg-white shadow-2xl transition md:rounded-2xl">
          <div class="flex items-start justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">File Detail</p>
              <h3 class="text-lg font-semibold text-slate-900">{{ selectedFile?.name }}</h3>
            </div>
            <button
              class="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
              @click="closeDetail"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="m18 6-12 12" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <div class="space-y-5 px-5 py-4">
            <div
              class="flex h-64 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br"
              :class="detailGradient(selectedFile?.type)"
            >
              <template v-if="selectedFile?.type === 'image'">
                <div class="relative h-full w-full">
                  <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,#e0f2fe,transparent_35%),radial-gradient(circle_at_80%_30%,#cbd5e1,transparent_30%),radial-gradient(circle_at_50%_80%,#bfdbfe,transparent_28%)] blur-xl" />
                  <div class="absolute inset-4 rounded-2xl border border-white/50 bg-white/70 shadow-inner backdrop-blur" />
                </div>
              </template>
              <template v-else-if="selectedFile?.type === 'video'">
                <div class="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/80 text-violet-600 shadow-xl ring-2 ring-violet-100">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-10 w-10" fill="currentColor">
                    <path d="m9 7 8 5-8 5V7Z" />
                  </svg>
                </div>
              </template>
              <template v-else>
                <div class="flex h-20 w-16 items-center justify-center rounded-2xl bg-white/85 text-slate-700 shadow-xl ring-2 ring-slate-200">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M7 3h7l4 4v14H7z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14 3v4h4" />
                  </svg>
                </div>
              </template>
            </div>

            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-sm font-semibold text-slate-900">{{ selectedFile?.name }}</h4>
                <p class="text-xs text-slate-500">Created {{ selectedFile?.created }}</p>
              </div>
              <span
                class="rounded-full px-3 py-1 text-xs font-semibold"
                :class="badgeClasses(selectedFile?.type || 'image')"
              >
                {{ typeLabel(selectedFile?.type || 'image') }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <div class="space-y-1">
                <p class="font-semibold text-slate-700">Created On</p>
                <p>{{ selectedFile?.created }}</p>
              </div>
              <div class="space-y-1">
                <p class="font-semibold text-slate-700">Last Updated</p>
                <p>{{ selectedFile?.updated }}</p>
              </div>
            </div>

            <div class="flex items-center justify-end gap-3">
              <button class="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 shadow-inner transition hover:bg-blue-100">
                Replace File
              </button>
              <button class="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50">
                Remove File
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <ImageViewerModal
      :show="showViewer"
      :src="viewerSrc"
      @close="showViewer = false"
    />

    <AddFileModal
      :show="showAddFileModal"
      @close="showAddFileModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import AddFileModal from "@/prototype/contractor/AddFileModal.vue";
import ImageViewerModal from "@/prototype/contractor/ImageViewerModal.vue";

type FileType = "image" | "video" | "document";
type FilterType = FileType | "all";

type FileItem = {
  name: string;
  type: FileType;
  created: string;
  updated: string;
  src?: string;
};

const jobName = "Maple St Deck";

const filters = [
  { label: "All", value: "all" as FilterType },
  { label: "Photos", value: "image" as FilterType },
  { label: "Videos", value: "video" as FilterType },
  { label: "Documents", value: "document" as FilterType }
];

const files = ref<FileItem[]>([
  { name: "deck_before.jpg", type: "image", created: "Nov 28, 2025 at 9:12 AM", updated: "Dec 3, 2025 at 1:45 PM", src: "https://source.unsplash.com/random/640x480?deck" },
  { name: "joist_detail.jpg", type: "image", created: "Nov 29, 2025 at 2:30 PM", updated: "Dec 3, 2025 at 1:45 PM", src: "https://source.unsplash.com/random/640x480?framing" },
  { name: "material_notes.png", type: "image", created: "Nov 30, 2025 at 10:10 AM", updated: "Dec 4, 2025 at 9:05 AM", src: "https://source.unsplash.com/random/640x480?blueprint" },
  { name: "site_walk.mp4", type: "video", created: "Dec 1, 2025 at 4:22 PM", updated: "Dec 4, 2025 at 10:20 AM", src: "https://source.unsplash.com/random/640x480?jobsite" },
  { name: "measurement_sheet.pdf", type: "document", created: "Dec 1, 2025 at 8:00 AM", updated: "Dec 3, 2025 at 3:30 PM", src: "https://source.unsplash.com/random/640x480?plans" },
  { name: "ledger_inspection.jpg", type: "image", created: "Dec 2, 2025 at 11:15 AM", updated: "Dec 4, 2025 at 1:00 PM", src: "https://source.unsplash.com/random/640x480?inspection" },
  { name: "demo_area.mp4", type: "video", created: "Dec 2, 2025 at 5:45 PM", updated: "Dec 4, 2025 at 5:10 PM", src: "https://source.unsplash.com/random/640x480?demolition" },
  { name: "permit_notes.pdf", type: "document", created: "Dec 3, 2025 at 9:00 AM", updated: "Dec 4, 2025 at 6:00 PM", src: "https://source.unsplash.com/random/640x480?paperwork" }
]);

const activeFilter = ref<FilterType>("all");
const selectedFile = ref<FileItem | null>(null);
const showAddFileModal = ref(false);
const showViewer = ref(false);
const viewerSrc = ref("");

const totalLabel = computed(() => `${files.value.length} items`);

const visibleFiles = computed(() => files.value);

const setFilter = (value: FilterType) => {
  activeFilter.value = value;
};

const openDetail = (file: FileItem) => {
  selectedFile.value = file;
};

const closeDetail = () => {
  selectedFile.value = null;
};

const openViewer = (file: FileItem) => {
  viewerSrc.value = previewSrc(file);
  showViewer.value = true;
};

const previewSrc = (file: FileItem) => {
  if (file.src) return file.src;
  if (file.type === "video") return "https://source.unsplash.com/random/640x480?video";
  if (file.type === "document") return "https://source.unsplash.com/random/640x480?document";
  return "https://source.unsplash.com/random/640x480?photo";
};

const typeLabel = (type: FileType) => {
  if (type === "video") return "Video";
  if (type === "document") return "Document";
  return "Image";
};

const badgeClasses = (type: FileType) => {
  if (type === "video") return "bg-violet-50 text-violet-700 border border-violet-100";
  if (type === "document") return "bg-slate-100 text-slate-700 border border-slate-200";
  return "bg-blue-50 text-blue-700 border border-blue-100";
};

const previewGradient = (type: FileType) => {
  if (type === "video") return "from-violet-50 via-white to-slate-100";
  if (type === "document") return "from-slate-50 via-white to-slate-100";
  return "from-blue-50 via-white to-slate-100";
};

const detailGradient = (type: FileType | undefined) => {
  if (type === "video") return "from-violet-50 via-white to-slate-100";
  if (type === "document") return "from-slate-50 via-white to-slate-100";
  return "from-blue-50 via-white to-slate-100";
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
