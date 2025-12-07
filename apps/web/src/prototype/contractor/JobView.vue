<template>
  <div class="min-h-screen bg-slate-50 text-slate-800">
    <header class="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div class="flex items-center gap-3">
          <button
            class="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 shadow-inner transition hover:bg-slate-200"
          >
            HQ
          </button>
          <div class="flex flex-col">
            <div class="flex items-center gap-2">
              <h1 class="text-lg font-semibold text-slate-900">Maple St Deck</h1>
              <span
                class="rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-1 text-xs font-semibold text-white shadow"
              >
                In Progress
              </span>
            </div>
            <p class="text-xs text-slate-500">Job Overview</p>
          </div>
        </div>
        <div class="flex items-center gap-3 text-slate-500">
          <button
            class="rounded-full p-2 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Notifications"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M14.857 17.083A2.999 2.999 0 0 1 12 19a2.999 2.999 0 0 1-2.857-1.917M5 9.5A7 7 0 0 1 12 3a7 7 0 0 1 7 6.5v3.17l.724 1.81a1 1 0 0 1-.93 1.37H5.206a1 1 0 0 1-.93-1.37L5 12.67V9.5Z"
              />
            </svg>
          </button>
          <button
            class="rounded-full p-2 transition hover:bg-slate-100 hover:text-slate-700"
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
      </div>
    </header>

    <main class="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <!-- Job Summary -->
      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="space-y-1">
            <h2 class="text-xl font-semibold text-slate-900">Maple St Deck</h2>
            <p class="text-sm text-slate-600">Client: Sarah Thompson</p>
            <p class="text-sm text-slate-600">Address: 482 Maple St, Seattle, WA</p>
            <p class="text-sm font-semibold text-slate-700">
              Next: <span class="text-blue-600">Today at 3PM</span>
            </p>
          </div>
          <button
            class="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:from-blue-600 hover:to-blue-700"
          >
            Open Job Mode
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>

      <!-- Quick Info Grid -->
      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 class="mb-4 text-base font-semibold text-slate-900">Quick Info</h3>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
            <p class="text-xs uppercase tracking-wide text-slate-500">Job Type</p>
            <p class="text-sm font-semibold text-slate-900">Deck</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
            <p class="text-xs uppercase tracking-wide text-slate-500">Created</p>
            <p class="text-sm font-semibold text-slate-900">Nov 28, 2025</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
            <p class="text-xs uppercase tracking-wide text-slate-500">Proposal</p>
            <p class="text-sm font-semibold text-slate-900">Sent</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
            <p class="text-xs uppercase tracking-wide text-slate-500">Estimate Range</p>
            <p class="text-sm font-semibold text-slate-900">$12,800–$19,800</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
            <p class="text-xs uppercase tracking-wide text-slate-500">Assigned Crew</p>
            <p class="text-sm font-semibold text-slate-900">Not Assigned</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
            <p class="text-xs uppercase tracking-wide text-slate-500">Tags</p>
            <p class="text-sm font-semibold text-slate-900">Deck, Composite</p>
          </div>
        </div>
      </section>

      <!-- Timeline -->
      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 class="mb-4 text-base font-semibold text-slate-900">Project Timeline</h3>
        <div class="relative pl-5">
          <div class="absolute left-2 top-3 bottom-3 w-px bg-slate-200"></div>
          <div class="space-y-4">
            <div v-for="item in timeline" :key="item.title" class="relative flex gap-4">
              <div class="absolute left-[-1px] top-1.5 h-3 w-3 rounded-full bg-blue-500 shadow"></div>
              <div class="pl-5">
                <p class="text-sm font-semibold text-slate-900">{{ item.title }}</p>
                <p class="text-xs text-slate-600">{{ item.meta }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Tasks -->
      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-base font-semibold text-slate-900">Tasks</h3>
          <span class="text-xs text-slate-500">Preview</span>
        </div>
        <ul class="space-y-2">
          <li
            v-for="task in tasks"
            :key="task"
            class="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-inner"
          >
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">•</span>
            <span class="text-sm font-medium text-slate-900">{{ task }}</span>
          </li>
        </ul>
        <button class="mt-4 text-sm font-semibold text-blue-600 underline-offset-4 hover:underline">
          Open Full Task List (Job Mode)
        </button>
      </section>

      <!-- Files & Photos -->
      <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-900">Files &amp; Photos</h2>
          <button @click="showAddFile = true" class="text-sm font-medium text-blue-600 hover:underline">
            Add File
          </button>
        </div>

        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div
            v-for="file in previewFiles"
            :key="file.id"
            @click="openViewer(file)"
            class="aspect-square cursor-pointer overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
          >
            <img
              v-if="file.type === 'image'"
              :src="file.url"
              class="h-full w-full object-cover"
            />
            <div v-else class="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-500">
              {{ file.type.toUpperCase() }}
            </div>
          </div>
        </div>

        <button
          class="mt-4 text-sm font-medium text-slate-600 underline transition hover:text-slate-800"
          @click="goToFilesManager"
        >
          View All Files →
        </button>
      </section>

      <!-- Messages -->
      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-base font-semibold text-slate-900">Recent Messages</h3>
          <span class="text-xs text-slate-500">3</span>
        </div>
        <div class="space-y-3">
          <div
            v-for="message in messages"
            :key="message.title"
            class="flex items-start justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-inner"
          >
            <div>
              <p class="text-sm font-semibold text-slate-900">{{ message.title }}</p>
              <p class="text-sm text-slate-600">{{ message.preview }}</p>
            </div>
            <span class="text-xs text-slate-500">{{ message.time }}</span>
          </div>
        </div>
        <button class="mt-4 text-sm font-semibold text-blue-600 underline-offset-4 hover:underline">
          Open Full Inbox
        </button>
      </section>

      <!-- Financial Summary -->
      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-base font-semibold text-slate-900">Financial Summary</h3>
          <button
            class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-inner transition hover:bg-blue-100"
          >
            Send Payment Link
          </button>
        </div>
        <div class="grid gap-4 sm:grid-cols-3">
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
            <p class="text-xs uppercase tracking-wide text-slate-500">Contract Amount</p>
            <p class="text-lg font-semibold text-slate-900">$19,800</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
            <p class="text-xs uppercase tracking-wide text-slate-500">Deposit Paid</p>
            <p class="text-lg font-semibold text-slate-900">$2,400</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
            <p class="text-xs uppercase tracking-wide text-slate-500">Remaining Balance</p>
            <p class="text-lg font-semibold text-slate-900">$17,400</p>
          </div>
        </div>
      </section>
    </main>

    <SettingsDrawer v-if="showSettings" @close="showSettings = false" />
    <AddFileModal v-if="showAddFile" @close="showAddFile = false" @add="handleAddFile" />

    <ImageViewerModal
      v-if="showViewer"
      :file="viewerFile"
      @close="showViewer = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import AddFileModal from "@/prototype/contractor/files/AddFileModal.vue";
import ImageViewerModal from "@/prototype/contractor/files/ImageViewerModal.vue";
import SettingsDrawer from "@/components/Settings/SettingsDrawer.vue";

const router = useRouter();

const showSettings = ref(false);
const timeline = [
  { title: "Proposal sent", meta: "Nov 28" },
  { title: "Client viewed", meta: "Nov 28" },
  { title: "Proposal accepted", meta: "Nov 29" },
  { title: "Deposit received", meta: "Nov 29 - $2,400" },
  { title: "Visit scheduled", meta: "Dec 3, 3PM" },
  { title: "Note added", meta: "Site has old joists" }
];

const tasks = [
  "Perform site measurements",
  "Photograph existing deck",
  "Identify hazards or obstructions"
];

const previewFiles = ref([
  { id: 1, url: "https://source.unsplash.com/random/400x400?deck", type: "image" },
  { id: 2, url: "https://source.unsplash.com/random/400x400?measurement", type: "image" },
  { id: 3, url: "https://source.unsplash.com/random/400x400?notes", type: "image" },
  { id: 4, url: "https://placehold.co/400x400?text=PDF", type: "pdf" }
]);

const messages = [
  { title: "Sarah Thompson (Deck)", preview: "Quick question about materials", time: "2h ago" },
  { title: "Mike Robertson (Patio)", preview: "Did you get the photos?", time: "4h ago" },
  { title: "Auto message", preview: "Proposal follow-up pending", time: "Yesterday" }
];

const showAddFile = ref(false);
const showViewer = ref(false);
const viewerFile = ref<{ id: number; url: string; type: string } | null>(null);

const openViewer = (file: { id: number; url: string; type: string }) => {
  viewerFile.value = file;
  showViewer.value = true;
};

const goToFilesManager = () => {
  router.push("/prototype/contractor/files?jobId=demo-job");
};

const handleAddFile = (file: { name: string; type: string; thumbnail: string }) => {
  previewFiles.value = [
    { id: Date.now(), url: file.thumbnail, type: file.type === "document" ? "pdf" : file.type },
    ...previewFiles.value
  ];
  showAddFile.value = false;
};
</script>
