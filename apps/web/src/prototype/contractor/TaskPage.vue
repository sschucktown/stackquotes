<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 pb-28">
    <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
        <div class="flex items-center gap-3">
          <button class="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 shadow-inner transition hover:bg-slate-200">
            ← Back
          </button>
          <div class="flex flex-col">
            <div class="flex items-center gap-2">
              <h1 class="text-base font-semibold text-slate-900">Maple St Deck</h1>
              <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">Tasks → Measurements</span>
            </div>
            <p class="text-xs text-slate-500">Task Details</p>
          </div>
        </div>
        <span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-inner">Demo</span>
      </div>
    </header>

    <main class="mx-auto max-w-4xl space-y-5 px-4 py-6 sm:px-6">
      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex flex-col gap-3">
          <div class="flex flex-wrap items-center gap-3">
            <h2 class="text-xl font-semibold text-slate-900">Perform Site Measurements</h2>
            <span
              class="rounded-full px-3 py-1 text-xs font-semibold"
              :class="statusBadge"
            >
              {{ statusLabel }}
            </span>
            <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Due: Today 3:00 PM</span>
          </div>
          <p class="text-sm text-slate-600">
            Capture accurate dimensions, ledger condition, and any obstructions before the proposal is finalized. Bring tape, level, and camera.
          </p>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-base font-semibold text-slate-900">Subtasks</h3>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Checklist</span>
        </div>
        <div class="space-y-3">
          <div
            v-for="item in subtasks"
            :key="item"
            class="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700"
          >
            <span class="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white"></span>
            <span>{{ item }}</span>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-base font-semibold text-slate-900">Task Files</h3>
          <button
            class="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-inner transition hover:bg-blue-100"
            @click="openTaskFiles"
          >
            Manage Task Files ->
          </button>
        </div>
        <div class="grid gap-3 sm:grid-cols-3">
          <div
            v-for="file in previewTaskFiles"
            :key="file.id"
            class="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-inner"
          >
            <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-700">
              <span v-if="file.kind === 'image'">IMG</span>
              <span v-else-if="file.kind === 'document'">DOC</span>
              <span v-else-if="file.kind === 'video'">VID</span>
              <span v-else>FILE</span>
            </div>
            <div class="space-y-0.5">
              <p class="text-sm font-semibold text-slate-900 line-clamp-1">{{ file.name }}</p>
              <p class="text-xs text-slate-500 line-clamp-1">{{ file.uploadedBy }} • {{ file.uploadedAt }}</p>
            </div>
          </div>
          <div
            class="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-400 transition hover:-translate-y-0.5 hover:bg-slate-100"
            @click="openTaskFiles"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </svg>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-base font-semibold text-slate-900">Notes</h3>
          <button
            class="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-inner transition hover:bg-blue-100"
            @click="showNoteModal = true"
          >
            Add Note
          </button>
        </div>
        <div class="space-y-3">
          <article
            v-for="note in notes"
            :key="note.text"
            class="flex gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3"
          >
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
              JD
            </div>
            <div class="space-y-1">
              <p class="text-sm text-slate-800">{{ note.text }}</p>
              <p class="text-xs text-slate-500">{{ note.time }}</p>
            </div>
          </article>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 class="mb-3 text-base font-semibold text-slate-900">Task Timeline</h3>
        <div class="relative pl-4">
          <div class="absolute left-1.5 top-1 bottom-1 w-px bg-slate-200"></div>
          <div class="space-y-4">
            <div
              v-for="item in timeline"
              :key="item.title"
              class="relative flex items-start gap-3"
            >
              <div class="absolute left-[-2px] top-1 h-3 w-3 rounded-full bg-blue-500 shadow"></div>
              <div class="pl-5">
                <p class="text-sm font-semibold text-slate-900">{{ item.title }}</p>
                <p class="text-xs text-slate-500">{{ item.meta }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <div class="fixed inset-x-0 bottom-0 z-30 bg-white/90 backdrop-blur border-t border-slate-200">
      <div class="mx-auto flex max-w-4xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <div class="flex gap-2">
          <button
            class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 shadow-inner transition hover:-translate-y-0.5 hover:bg-blue-100"
            @click="showAddFileModal = true"
          >
            Add Photo
          </button>
          <button
            class="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 shadow-inner transition hover:-translate-y-0.5 hover:bg-amber-100"
            @click="showNoteModal = true"
          >
            Add Note
          </button>
        </div>
        <button
          class="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-emerald-700"
          @click="toggleComplete"
        >
          {{ status.value === "done" ? "Mark as Pending" : "Mark Complete" }}
        </button>
      </div>
    </div>

    <Transition name="modal">
      <div
        v-if="showNoteModal"
        class="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/50 px-3 pb-3 md:items-center md:px-4 md:pb-0"
      >
        <div class="w-full max-w-md transform rounded-t-3xl bg-white shadow-2xl transition md:rounded-2xl">
          <div class="flex items-start justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <p class="text-sm font-semibold uppercase tracking-wide text-slate-500">Add Note</p>
              <h3 class="text-lg font-semibold text-slate-900">Prototype Only</h3>
            </div>
            <button
              class="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
              @click="showNoteModal = false"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="m18 6-12 12" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
          <div class="space-y-4 px-5 py-5">
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-600" for="note-input">Note</label>
            <textarea
              id="note-input"
              rows="4"
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Capture quick note..."
            ></textarea>
            <div class="flex items-center justify-end gap-2">
              <button
                class="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                @click="showNoteModal = false"
              >
                Cancel
              </button>
              <button
                class="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-blue-700"
                @click="showNoteModal = false"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal">
      <FilesManager v-if="showFilesManager" @close="showFilesManager = false" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import FilesManager from "./FilesManager.vue";
import { setFileContext, taskLevelFiles } from "@/prototype/stores/files";

const status = ref<"pending" | "in-progress" | "done">("pending");

const subtasks = [
  "Measure deck perimeter",
  "Record joist spacing",
  "Check ledger condition",
  "Identify obstructions",
  "Photograph measurements",
  "Confirm stair layout"
];

const notes = [
  { text: "Measured perimeter is approx 18' x 14'.", time: "2 hours ago" },
  { text: "Need to confirm ledger integrity before proposal.", time: "Today" },
  { text: "Homeowner wants to discuss composite options.", time: "Yesterday" },
];

const timeline = [
  { title: "Photo uploaded", meta: "10 min ago" },
  { title: "Subtask checked", meta: "Today" },
  { title: "Task assigned", meta: "Yesterday" },
];

const showNoteModal = ref(false);
const showFilesManager = ref(false);
const currentTaskId = "task-measurements";
const previewTaskFiles = computed(() => taskLevelFiles.value.slice(0, 3));

const statusLabel = computed(() => {
  if (status.value === "done") return "Done";
  if (status.value === "in-progress") return "In Progress";
  return "Pending";
});

const statusBadge = computed(() => {
  if (status.value === "done") return "bg-emerald-50 text-emerald-700 border border-emerald-100";
  if (status.value === "in-progress") return "bg-blue-50 text-blue-700 border border-blue-100";
  return "bg-amber-50 text-amber-700 border border-amber-100";
});

const toggleComplete = () => {
  status.value = status.value === "done" ? "pending" : "done";
};

function openTaskFiles() {
  setFileContext("maple-st-deck", currentTaskId);
  showFilesManager.value = true;
}

onMounted(() => {
  setFileContext("maple-st-deck", currentTaskId);
});
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
