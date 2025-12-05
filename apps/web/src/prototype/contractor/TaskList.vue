<template>
  <div class="fixed inset-0 z-40 flex flex-col bg-slate-50">
    <header class="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        @click="$emit('back')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back
      </button>
      <div>
        <p class="text-base font-semibold text-slate-900">Full Task List</p>
        <p class="text-xs text-slate-500">Organized by phase</p>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
      <div class="space-y-6">
        <section
          v-for="group in taskGroups"
          :key="group.phase"
          class="space-y-2"
        >
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ group.phase }}</p>
          <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div
              v-for="task in group.tasks"
              :key="task.id"
              class="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-slate-50"
              @click="$emit('openTask', task)"
            >
              <div class="flex items-center gap-3">
                <span
                  class="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white"
                  aria-hidden="true"
                ></span>
                <p class="text-sm font-medium text-slate-900">{{ task.name }}</p>
              </div>
              <div class="flex items-center gap-2">
                <span
                  class="rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
                  :class="task.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'"
                >
                  {{ task.status === 'completed' ? 'Complete' : 'Pending' }}
                </span>
                <div class="flex items-center gap-1 text-slate-500">
                  <svg
                    v-if="task.hasNotes"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    class="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z" />
                    <path d="M13 2v7h7" />
                    <path d="M9 13h6" />
                    <path d="M9 17h6" />
                  </svg>
                  <svg
                    v-if="task.hasPhotos"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    class="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l2-3h8l2 3h3a2 2 0 0 1 2 2Z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
const taskGroups = [
  {
    phase: "Pre-Visit",
    tasks: [
      { id: 1, name: "Review project notes", status: "pending", hasNotes: false, hasPhotos: false },
      { id: 2, name: "Prepare material samples", status: "completed", hasNotes: true, hasPhotos: false },
    ],
  },
  {
    phase: "On-Site Visit",
    tasks: [
      { id: 3, name: "Perform site measurements", status: "pending", hasNotes: true, hasPhotos: true },
      { id: 4, name: "Photograph existing deck", status: "pending", hasNotes: false, hasPhotos: true },
      { id: 5, name: "Identify hazards or obstructions", status: "completed", hasNotes: true, hasPhotos: false },
    ],
  },
  {
    phase: "Follow-Up",
    tasks: [
      { id: 6, name: "Upload measurement sheet", status: "pending", hasNotes: false, hasPhotos: false },
      { id: 7, name: "Prepare revised proposal", status: "pending", hasNotes: true, hasPhotos: false },
    ],
  },
];

defineEmits<{
  (e: "back"): void;
  (e: "openTask", task: (typeof taskGroups)[number]["tasks"][number]): void;
}>();
</script>
