<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { ClockIcon, CameraIcon, PencilSquareIcon, PlusIcon, XMarkIcon } from "@heroicons/vue/24/outline";

const router = useRouter();

const checklist = reactive([
  { id: "measure", label: "Perform site measurements", done: false },
  { id: "photos", label: "Photograph existing deck", done: false },
  { id: "hazards", label: "Identify hazards or obstructions", done: false },
  { id: "ledger", label: "Check ledger condition", done: false },
  { id: "stairs", label: "Confirm stair layout", done: false },
]);

const photos = ref<string[]>(["", "", ""]);
const notes = ref<string[]>(["Ledger appears aged; consider flashing", "Client asked about composite options"]);

const hazards = ref<string[]>(["Rotting ledger", "Loose stair treads"]);
const opportunities = ref<string[]>(["Composite upgrade", "Premium railing"]);

const showNoteModal = ref(false);
const showPhotoModal = ref(false);
const modalNoteText = ref("");
const modalPhotoUrl = ref("");
const modalListTarget = ref<"notes" | "hazards" | "opportunities">("notes");

const openNoteModal = (target: "notes" | "hazards" | "opportunities") => {
  modalListTarget.value = target;
  modalNoteText.value = "";
  showNoteModal.value = true;
};

const addNote = () => {
  if (!modalNoteText.value.trim()) {
    showNoteModal.value = false;
    return;
  }
  if (modalListTarget.value === "notes") notes.value.push(modalNoteText.value.trim());
  if (modalListTarget.value === "hazards") hazards.value.push(modalNoteText.value.trim());
  if (modalListTarget.value === "opportunities") opportunities.value.push(modalNoteText.value.trim());
  showNoteModal.value = false;
};

const openPhotoModal = () => {
  modalPhotoUrl.value = "";
  showPhotoModal.value = true;
};

const addPhoto = () => {
  const url =
    modalPhotoUrl.value.trim() ||
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=400&q=60";
  photos.value.push(url);
  showPhotoModal.value = false;
};

const goToSummary = () => {
  router.push("/prototype/visit-summary");
};
</script>

<template>
  <!-- Add to router:
    { path: "/prototype/visit", component: VisitMode }
  -->
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <div class="mx-auto flex w-full max-w-md flex-col gap-4 px-4 pb-28 pt-4">
      <!-- Header -->
      <header class="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <div class="flex items-start justify-between gap-2">
          <div class="space-y-1">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 shadow-inner transition hover:bg-slate-200"
              @click="router.push('/prototype/job-view')"
            >
              <span class="text-lg leading-none">&larr;</span>
              <span>Back to Job View</span>
            </button>
            <h1 class="text-lg font-semibold text-slate-900">Maple St Deck</h1>
            <p class="text-sm text-slate-500">Field Visit Mode</p>
          </div>
          <div class="flex flex-col items-end gap-1">
            <span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-inner">
              On Site
            </span>
            <div class="flex items-center gap-1 text-xs text-slate-600">
              <ClockIcon class="h-4 w-4" />
              <span>3:00 PM Visit</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Checklist -->
      <section class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-900">Visit Checklist</h2>
          <span class="text-xs text-slate-500">Mobile-friendly</span>
        </div>
        <div class="space-y-3">
          <div
            v-for="item in checklist"
            :key="item.id"
            class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-inner"
          >
            <label class="flex items-center gap-3">
              <input v-model="item.done" type="checkbox" class="h-5 w-5 rounded-full border-slate-300 text-blue-600" />
              <span class="text-sm font-medium text-slate-900">{{ item.label }}</span>
            </label>
            <button
              type="button"
              class="rounded-full p-2 text-slate-500 transition hover:bg-white hover:text-slate-800"
              aria-label="Add quick note"
              @click="openNoteModal('notes')"
            >
              <PencilSquareIcon class="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <!-- Photos -->
      <section class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-900">Photos</h2>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm transition hover:bg-blue-100"
            @click="openPhotoModal"
          >
            <CameraIcon class="h-4 w-4" />
            <span>Add</span>
          </button>
        </div>
        <div class="grid grid-cols-4 gap-2">
          <div
            v-for="(photo, index) in photos"
            :key="index"
            class="aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner"
          >
            <img v-if="photo" :src="photo" alt="Visit photo" class="h-full w-full object-cover" />
            <div v-else class="flex h-full w-full items-center justify-center text-xs text-slate-400">Placeholder</div>
          </div>
          <button
            type="button"
            class="flex aspect-square items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-500 transition hover:-translate-y-[1px] hover:shadow-md"
            @click="openPhotoModal"
          >
            <PlusIcon class="h-5 w-5" />
          </button>
        </div>
      </section>

      <!-- Notes -->
      <section class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-900">Notes</h2>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100"
            @click="openNoteModal('notes')"
          >
            <PlusIcon class="h-4 w-4" />
            <span>Add Note</span>
          </button>
        </div>
        <ul class="space-y-2">
          <li
            v-for="note in notes"
            :key="note"
            class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 shadow-inner"
          >
            {{ note }}
          </li>
        </ul>
      </section>

      <!-- Hazards & Opportunities -->
      <section class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <div class="mb-2 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-900">Hazards &amp; Opportunities</h2>
          <span class="text-xs text-slate-500">Flag quickly</span>
        </div>
        <div class="space-y-3">
          <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 shadow-inner">
            <div class="mb-2 flex items-center justify-between">
              <span class="text-sm font-semibold text-slate-900">Hazards</span>
              <button
                type="button"
                class="rounded-full border border-rose-200 bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 shadow-sm"
                @click="openNoteModal('hazards')"
              >
                + Add
              </button>
            </div>
            <ul class="space-y-1 text-sm text-slate-800">
              <li v-for="item in hazards" :key="item" class="flex items-start gap-2">
                <span class="mt-1 h-1.5 w-1.5 rounded-full bg-rose-400"></span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 shadow-inner">
            <div class="mb-2 flex items-center justify-between">
              <span class="text-sm font-semibold text-slate-900">Opportunities</span>
              <button
                type="button"
                class="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 shadow-sm"
                @click="openNoteModal('opportunities')"
              >
                + Add
              </button>
            </div>
            <ul class="space-y-1 text-sm text-slate-800">
              <li v-for="item in opportunities" :key="item" class="flex items-start gap-2">
                <span class="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>

    <!-- Footer -->
    <footer
      class="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-4px_14px_rgba(15,23,42,0.06)] backdrop-blur"
    >
      <div class="mx-auto flex max-w-md items-center justify-between gap-2">
        <button
          type="button"
          class="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
        >
          Save Visit Progress
        </button>
        <button
          type="button"
          class="inline-flex flex-1 items-center justify-center rounded-full border border-blue-200 bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700"
          @click="goToSummary"
        >
          Generate Visit Summary
        </button>
      </div>
    </footer>

    <!-- Add Note Modal -->
    <div
      v-if="showNoteModal"
      class="fixed inset-0 z-10 flex items-center justify-center bg-slate-900/30 px-4 backdrop-blur"
    >
      <div class="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
        <div class="mb-2 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-slate-900">Add Note</h3>
          <button
            type="button"
            class="rounded-full p-1 text-slate-500 hover:bg-slate-100"
            @click="showNoteModal = false"
            aria-label="Close"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>
        <textarea
          v-model="modalNoteText"
          rows="3"
          class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-blue-300 focus:outline-none"
          placeholder="Quick note..."
        />
        <div class="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            class="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            @click="showNoteModal = false"
          >
            Cancel
          </button>
          <button
            type="button"
            class="rounded-full border border-emerald-200 bg-emerald-600 px-3 py-1 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            @click="addNote"
          >
            Add
          </button>
        </div>
      </div>
    </div>

    <!-- Add Photo Modal -->
    <div
      v-if="showPhotoModal"
      class="fixed inset-0 z-10 flex items-center justify-center bg-slate-900/30 px-4 backdrop-blur"
    >
      <div class="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
        <div class="mb-2 flex items-center justify-between">
          <h3 class="text-sm font-semibold text-slate-900">Add Photo</h3>
          <button
            type="button"
            class="rounded-full p-1 text-slate-500 hover:bg-slate-100"
            @click="showPhotoModal = false"
            aria-label="Close"
          >
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>
        <input
          v-model="modalPhotoUrl"
          type="text"
          class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-blue-300 focus:outline-none"
          placeholder="Paste image URL (optional, will use placeholder)"
        />
        <div class="mt-3 flex items-center justify-end gap-2">
          <button
            type="button"
            class="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            @click="showPhotoModal = false"
          >
            Cancel
          </button>
          <button
            type="button"
            class="rounded-full border border-blue-200 bg-blue-600 px-3 py-1 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            @click="addPhoto"
          >
            Add Photo
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
