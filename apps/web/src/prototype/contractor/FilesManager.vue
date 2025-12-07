<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <div class="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
      <header class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div class="flex items-center gap-3">
          <button
            class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 shadow-inner transition hover:bg-slate-200"
            @click="$emit('close')"
          >
            <span class="text-lg leading-none">&larr;</span>
            <span>Back</span>
          </button>
          <div>
            <p class="text-xs uppercase tracking-[0.08em] text-slate-500">Files &amp; Photos</p>
            <h1 class="text-xl font-semibold text-slate-900">Maple St Deck</h1>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button
            class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition"
            :class="mode === 'job' ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-inner' : 'border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50'"
            @click="setMode('job')"
          >
            Job
          </button>
          <button
            class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition"
            :class="mode === 'task' ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-inner' : 'border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50'"
            @click="setMode('task')"
          >
            Tasks
          </button>
          <button
            class="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700"
            @click="showAdd = true"
          >
            Add File
          </button>
          <button
            class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Open Job Folder
          </button>
          <button
            class="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Settings"
            @click="showSettings = true"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.757.426 1.757 2.924 0 3.35a1.724 1.724 0 0 0-1.065 2.573c.94 1.543-.827 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.757-2.924 1.757-3.35 0a1.724 1.724 0 0 0-2.573-1.065c-1.543.94-3.31-.827-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.757-.426-1.757-2.924 0-3.35a1.724 1.724 0 0 0 1.065-2.573c-.94-1.543.827-3.31 2.37-2.37.966.589 2.199.167 2.573-1.065Z"
              />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>
        </div>
      </header>

      <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex flex-wrap items-center gap-2">
            <div v-if="mode === 'task'" class="flex items-center gap-2">
              <span class="text-xs font-semibold text-slate-600">Task</span>
              <select
                v-model="selectedTask"
                class="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 shadow-inner focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="task-measurements">Measurements</option>
                <option value="task-demo">Demo / Tear-out</option>
                <option value="task-footings">Footings</option>
              </select>
            </div>

            <div class="flex items-center gap-2 overflow-x-auto">
              <button
                v-for="filter in filters"
                :key="filter.value"
                class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition"
                :class="activeFilter === filter.value ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-inner' : 'border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50'"
                @click="activeFilter = filter.value"
              >
                {{ filter.label }}
              </button>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span class="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700 shadow-inner">
              {{ filteredFiles.length }} file(s)
            </span>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div
          v-for="group in groupedFiles"
          :key="group.folder || 'none'"
          class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div class="mb-3 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <p class="text-sm font-semibold text-slate-900">{{ group.folder || "Ungrouped" }}</p>
              <span class="text-xs text-slate-500">{{ group.files.length }} file(s)</span>
            </div>
            <button class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
              … 
            </button>
          </div>

          <div class="grid gap-3 md:grid-cols-2">
            <div
              v-for="file in group.files"
              :key="file.id"
              class="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                class="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700"
              >
                <template v-if="file.kind === 'image'">
                  <img :src="file.thumbUrl || file.url" :alt="file.name" class="h-full w-full rounded-lg object-cover" />
                </template>
                <template v-else-if="file.kind === 'document'">
                  PDF
                </template>
                <template v-else-if="file.kind === 'video'">
                  ▶
                </template>
                <template v-else>
                  File
                </template>
              </div>

              <div class="flex-1 space-y-1">
                <div class="flex items-center justify-between gap-2">
                  <p class="text-sm font-semibold text-slate-900 truncate">{{ file.name }}</p>
                  <button
                    class="text-xs font-semibold text-blue-600 underline-offset-4 hover:underline"
                    @click="openViewer(file)"
                  >
                    View
                  </button>
                </div>
                <p class="text-xs text-slate-500">
                  {{ file.uploadedBy }} • {{ file.uploadedAt }} • {{ file.sizeLabel }}
                </p>
                <p v-if="file.note" class="text-xs text-slate-600">Note: {{ file.note }}</p>
                <div class="flex items-center gap-2 pt-1">
                  <button
                    class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    @click="editNote(file)"
                  >
                    Note
                  </button>
                  <button class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                    …
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <SettingsDrawer v-if="showSettings" @close="showSettings = false" />
    <AddFileModal v-if="showAdd" @close="showAdd = false" />
    <ImageViewerModal v-if="viewerFile" :file="viewerFile" @close="viewerFile = null" />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { filesStore, jobFiles, jobLevelFiles, taskLevelFiles, setFileContext, type PrototypeFile } from "@/prototype/stores/files";
import AddFileModal from "./AddFileModal.vue";
import ImageViewerModal from "./ImageViewerModal.vue";
import SettingsDrawer from "@/components/Settings/SettingsDrawer.vue";

const emit = defineEmits<{
  (e: "close"): void;
}>();

const filters = [
  { label: "All", value: "all" },
  { label: "Images", value: "image" },
  { label: "Documents", value: "document" },
  { label: "Video", value: "video" },
] as const;

const mode = ref<"job" | "task">("job");
const activeFilter = ref<typeof filters[number]["value"]>("all");
const selectedTask = ref<string>("task-measurements");
const showAdd = ref(false);
const viewerFile = ref<PrototypeFile | null>(null);
const showSettings = ref(false);

watch(mode, (val) => {
  if (val === "job") {
    setFileContext(filesStore.selectedJobId ?? "maple-st-deck", null);
  } else {
    setFileContext(filesStore.selectedJobId ?? "maple-st-deck", selectedTask.value);
  }
});

watch(selectedTask, (val) => {
  if (mode.value === "task") {
    setFileContext(filesStore.selectedJobId ?? "maple-st-deck", val);
  }
});

const filteredFiles = computed(() => {
  const base = mode.value === "job" ? jobLevelFiles.value : taskLevelFiles.value;
  if (activeFilter.value === "all") return base;
  return base.filter((file) => file.kind === activeFilter.value);
});

const groupedFiles = computed(() => {
  const groups: Record<string, PrototypeFile[]> = {};
  filteredFiles.value.forEach((file) => {
    const key = file.folder || "Ungrouped";
    if (!groups[key]) groups[key] = [];
    groups[key].push(file);
  });
  return Object.entries(groups).map(([folder, files]) => ({ folder, files }));
});

function setMode(val: "job" | "task") {
  mode.value = val;
}

function openViewer(file: PrototypeFile) {
  viewerFile.value = file;
}

function editNote(file: PrototypeFile) {
  const note = window.prompt("Add note for prototype only", file.note || "");
  if (note !== null) file.note = note || undefined;
}
</script>
