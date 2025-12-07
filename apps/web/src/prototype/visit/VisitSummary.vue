<script setup lang="ts">
import { useRouter } from "vue-router";
import { CheckCircleIcon, PhotoIcon, ExclamationTriangleIcon, ClipboardDocumentListIcon } from "@heroicons/vue/24/outline";

const router = useRouter();

const summary = {
  jobName: "Maple St Deck",
  client: "Sarah Thompson",
  time: "3:00 PM Visit",
  tasks: [
    { label: "Perform site measurements", done: true },
    { label: "Photograph existing deck", done: true },
    { label: "Identify hazards or obstructions", done: true },
    { label: "Check ledger condition", done: false },
    { label: "Confirm stair layout", done: true },
  ],
  photos: [
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=400&q=60",
    "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=400&q=60",
    "",
  ],
  notes: ["Ledger appears aged; consider flashing", "Client asked about composite options"],
  hazards: ["Rotting ledger", "Loose stair treads"],
  opportunities: ["Composite upgrade", "Premium railing"],
};

const completedCount = summary.tasks.filter((t) => t.done).length;
const completionPct = Math.round((completedCount / summary.tasks.length) * 100);

const goBack = () => router.push("/prototype/visit");
const sendToHq = () => router.push("/prototype/hq");
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <div class="mx-auto flex w-full max-w-4xl flex-col gap-5 px-4 pb-16 pt-6 sm:px-6">
      <header class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="space-y-1">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 shadow-inner transition hover:bg-slate-200"
              @click="goBack"
            >
              <span class="text-lg leading-none">&larr;</span>
              <span>Back to Visit Mode</span>
            </button>
            <h1 class="text-lg font-semibold text-slate-900">Visit Summary</h1>
            <p class="text-sm text-slate-500">{{ summary.jobName }} - {{ summary.time }}</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <span class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-inner">
              On Site Complete
            </span>
            <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 shadow-inner">
              Client: {{ summary.client }}
            </span>
          </div>
        </div>
      </header>

      <section class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Progress</p>
            <h2 class="text-lg font-semibold text-slate-900">{{ completedCount }} / {{ summary.tasks.length }} tasks done</h2>
            <p class="text-sm text-slate-600">Quick recap of what was captured on-site.</p>
          </div>
          <div class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-inner">
            <div class="h-12 w-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-bold">
              {{ completionPct }}%
            </div>
            <div class="space-y-1 text-sm text-slate-700">
              <div class="h-2 w-32 rounded-full bg-slate-200">
                <div class="h-2 rounded-full bg-emerald-400" :style="{ width: `${completionPct}%` }"></div>
              </div>
              <p class="text-xs text-slate-500">Checklist completion</p>
            </div>
          </div>
        </div>
      </section>

      <section class="grid gap-4 lg:grid-cols-3">
        <div class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5 sm:py-5">
          <div class="mb-2 flex items-center gap-2">
            <ClipboardDocumentListIcon class="h-5 w-5 text-blue-600" />
            <h3 class="text-base font-semibold text-slate-900">Checklist</h3>
          </div>
          <ul class="space-y-2 text-sm text-slate-800">
            <li
              v-for="task in summary.tasks"
              :key="task.label"
              class="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-inner"
            >
              <span
                class="flex h-5 w-5 items-center justify-center rounded-full"
                :class="task.done ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-300 text-slate-400'"
              >
                <CheckCircleIcon class="h-4 w-4" />
              </span>
              <span :class="task.done ? 'text-slate-900' : 'text-slate-500'">{{ task.label }}</span>
            </li>
          </ul>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5 sm:py-5">
          <div class="mb-2 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <PhotoIcon class="h-5 w-5 text-blue-600" />
              <h3 class="text-base font-semibold text-slate-900">Photos</h3>
            </div>
            <span class="text-xs text-slate-500">{{ summary.photos.length }} captured</span>
          </div>
          <div class="grid grid-cols-3 gap-2">
            <div
              v-for="(photo, idx) in summary.photos"
              :key="idx"
              class="aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-inner"
            >
              <img v-if="photo" :src="photo" class="h-full w-full object-cover" />
              <div v-else class="flex h-full w-full items-center justify-center text-xs text-slate-400">Placeholder</div>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5 sm:py-5">
          <div class="mb-2 flex items-center gap-2">
            <ExclamationTriangleIcon class="h-5 w-5 text-rose-500" />
            <h3 class="text-base font-semibold text-slate-900">Hazards</h3>
          </div>
          <ul class="space-y-1 text-sm text-slate-800">
            <li v-for="item in summary.hazards" :key="item" class="flex items-start gap-2">
              <span class="mt-1 h-1.5 w-1.5 rounded-full bg-rose-500"></span>
              <span>{{ item }}</span>
            </li>
          </ul>
          <div class="mt-4 mb-2 flex items-center gap-2">
            <SparklesIcon class="h-5 w-5 text-emerald-500" />
            <h3 class="text-base font-semibold text-slate-900">Opportunities</h3>
          </div>
          <ul class="space-y-1 text-sm text-slate-800">
            <li v-for="item in summary.opportunities" :key="item" class="flex items-start gap-2">
              <span class="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
        <div class="mb-2 flex items-center justify-between">
          <h3 class="text-base font-semibold text-slate-900">Notes</h3>
          <span class="text-xs text-slate-500">Captured on-site</span>
        </div>
        <ul class="space-y-2 text-sm text-slate-800">
          <li
            v-for="note in summary.notes"
            :key="note"
            class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 shadow-inner"
          >
            {{ note }}
          </li>
        </ul>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 class="text-lg font-semibold text-slate-900">Next Actions</h3>
            <p class="text-sm text-slate-600">Save, sync, or move into SmartProposal.</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              class="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
              @click="goBack"
            >
              Back to Visit
            </button>
            <button
              type="button"
              class="rounded-full border border-blue-200 bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700"
              @click="sendToHq"
            >
              Send to HQ
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
