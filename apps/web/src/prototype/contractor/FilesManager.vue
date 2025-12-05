<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <div class="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <header class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div class="flex items-center gap-3">
          <button
            class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 shadow-inner transition hover:bg-slate-200"
            @click="emit('close')"
          >
            <span class="text-lg leading-none">&larr;</span>
            <span>Back</span>
          </button>
          <div>
            <p class="text-xs uppercase tracking-[0.08em] text-slate-500">Files</p>
            <h1 class="text-lg font-semibold text-slate-900">Files &amp; Photos</h1>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 shadow-inner transition hover:bg-blue-100" @click="showAddFile = true">
            Add File
          </button>
          <button class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
            Open Folder
          </button>
        </div>
      </header>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Viewing Files For</p>
            <div class="flex flex-wrap items-center gap-2">
              <button
                class="rounded-full border px-3 py-1 text-sm font-semibold transition"
                :class="activeContext === 'job' ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-inner' : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'"
                @click="activeContext = 'job'"
              >
                Job: Maple St Deck
              </button>
              <button
                class="rounded-full border px-3 py-1 text-sm font-semibold transition"
                :class="activeContext === 'task' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-inner' : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'"
                @click="activeContext = 'task'"
              >
                Tasks
              </button>
              <select
                v-if="activeContext === 'task'"
                v-model="selectedTask"
                class="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="Task A">Task A: Measurements</option>
                <option value="Task B">Task B: Demo</option>
                <option value="Task C">Task C: Footings</option>
              </select>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search files (prototype)"
              class="w-48 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          <div
            v-for="file in files"
            :key="file.id"
            class="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div
              class="relative h-32 w-full cursor-pointer bg-slate-100"
              @click="openViewer(file)"
            >
              <img v-if="file.type === 'image'" :src="file.url" class="h-full w-full object-cover" />
              <div v-else class="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-500">
                {{ file.type.toUpperCase() }}
              </div>
              <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent opacity-0 transition duration-200 group-hover:opacity-100"></div>
            </div>
            <div class="flex items-center justify-between px-3 py-2 text-sm font-semibold text-slate-800">
              <span class="truncate">{{ file.name }}</span>
              <span class="text-xs text-slate-500">{{ file.size }}</span>
            </div>
          </div>
        </div>
      </section>
    </div>

    <ImageViewerModal
      v-if="showViewer"
      :show="showViewer"
      :src="viewerSrc"
      @close="showViewer = false"
    />

    <AddFileModal :show="showAddFile" @close="showAddFile = false" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import ImageViewerModal from "./ImageViewerModal.vue";
import AddFileModal from "./AddFileModal.vue";

const emit = defineEmits<{
  (e: "close"): void;
}>();

const activeContext = ref<"job" | "task">("job");
const selectedTask = ref("Task A");

const files = ref([
  { id: 1, name: "Ledger-closeup.jpg", type: "image", url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80", size: "1.2 MB" },
  { id: 2, name: "Joists-angled.jpg", type: "image", url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=80", size: "1.6 MB" },
  { id: 3, name: "Stair-sketch.pdf", type: "pdf", url: "", size: "0.4 MB" },
  { id: 4, name: "Material-list.pdf", type: "pdf", url: "", size: "0.3 MB" }
]);

const showViewer = ref(false);
const viewerSrc = ref("");
const showAddFile = ref(false);

function openViewer(file: { url?: string }) {
  if (file.url) {
    viewerSrc.value = file.url;
    showViewer.value = true;
  }
}
</script>
