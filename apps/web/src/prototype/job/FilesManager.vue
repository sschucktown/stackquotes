<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 pb-16">
    <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <div class="flex items-center gap-3">
          <button class="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 shadow-inner transition hover:bg-slate-200">
            ← Job Overview
          </button>
          <div class="flex items-center gap-2">
            <h1 class="text-lg font-semibold text-slate-900">Files & Photos</h1>
            <span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-inner">
              {{ files.length }} items
            </span>
          </div>
        </div>
        <button
          class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 shadow-inner transition hover:-translate-y-0.5 hover:bg-blue-100"
          @click="showAddModal = true"
        >
          <span class="flex h-6 w-6 items-center justify-center rounded-full bg-white text-blue-700 shadow-inner">+</span>
          Add File
        </button>
      </div>
    </header>

    <main class="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6">
      <FileGrid title="Images" :files="imageFiles" @open="handleOpen">
        <template #action>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Job Level</span>
        </template>
      </FileGrid>

      <FileGrid title="Documents & Videos" :files="otherFiles" @open="handleOpen">
        <template #action>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Job Level</span>
        </template>
      </FileGrid>
    </main>

    <ImageViewerModal
      :show="viewerOpen"
      :images="imageFiles"
      :start-index="viewerIndex"
      @close="viewerOpen = false"
    />

    <Transition name="modal">
      <div
        v-if="metaFile"
        class="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 px-3 pb-3 md:items-center md:px-4 md:pb-0"
      >
        <div class="w-full max-w-lg transform rounded-t-3xl bg-white shadow-2xl transition md:rounded-2xl">
          <div class="flex items-start justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">File Detail</p>
              <h3 class="text-lg font-semibold text-slate-900">{{ metaFile.name }}</h3>
            </div>
            <button
              class="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
              @click="metaFile = null"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="m18 6-12 12" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
          <div class="space-y-3 px-5 py-4 text-sm text-slate-700">
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs uppercase tracking-wide text-slate-500">Type</p>
              <p class="font-semibold capitalize">{{ metaFile.type }}</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs uppercase tracking-wide text-slate-500">Added By</p>
              <p class="font-semibold">{{ metaFile.addedBy }}</p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p class="text-xs uppercase tracking-wide text-slate-500">Created</p>
              <p class="font-semibold">{{ metaFile.createdAt }}</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <AddFileModal
      :show="showAddModal"
      @close="showAddModal = false"
      @add="handleAdd"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import AddFileModal from "@/components/files/AddFileModal.vue";
import FileGrid from "@/components/files/FileGrid.vue";
import type { FileCardItem } from "@/components/files/FileCard.vue";
import ImageViewerModal from "@/components/files/ImageViewerModal.vue";

type FileType = "image" | "document" | "video";

const files = ref<FileCardItem[]>([
  { id: "1", name: "deck_before.jpg", type: "image", thumbnail: "https://source.unsplash.com/random/640x480?deck", createdAt: "Dec 4, 2025", addedBy: "Jordan Deckworks" },
  { id: "2", name: "joist_detail.jpg", type: "image", thumbnail: "https://source.unsplash.com/random/640x480?joist", createdAt: "Dec 4, 2025", addedBy: "Jordan Deckworks" },
  { id: "3", name: "proposal_notes.pdf", type: "document", thumbnail: "https://placehold.co/600x400?text=Document", createdAt: "Dec 3, 2025", addedBy: "Jordan Deckworks" },
  { id: "4", name: "site_walk.mp4", type: "video", thumbnail: "https://placehold.co/600x400?text=Video", createdAt: "Dec 2, 2025", addedBy: "Jordan Deckworks" },
  { id: "5", name: "ledger_closeup.jpg", type: "image", thumbnail: "https://source.unsplash.com/random/640x480?inspection", createdAt: "Dec 1, 2025", addedBy: "Jordan Deckworks" },
  { id: "6", name: "permit_notes.pdf", type: "document", thumbnail: "https://placehold.co/600x400?text=Permit", createdAt: "Dec 1, 2025", addedBy: "Jordan Deckworks" }
]);

const showAddModal = ref(false);
const metaFile = ref<FileCardItem | null>(null);
const viewerOpen = ref(false);
const viewerIndex = ref(0);

const imageFiles = computed(() => files.value.filter((file) => file.type === "image"));
const otherFiles = computed(() => files.value.filter((file) => file.type !== "image"));

const handleOpen = (file: FileCardItem) => {
  if (file.type === "image") {
    const index = imageFiles.value.findIndex((item) => item.id === file.id);
    viewerIndex.value = Math.max(0, index);
    viewerOpen.value = true;
    return;
  }
  metaFile.value = file;
};

const handleAdd = (file: { name: string; type: FileType; thumbnail: string }) => {
  const newFile: FileCardItem = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    name: file.name,
    type: file.type,
    thumbnail: file.thumbnail,
    createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    addedBy: "Jordan Deckworks"
  };
  files.value = [newFile, ...files.value];
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
