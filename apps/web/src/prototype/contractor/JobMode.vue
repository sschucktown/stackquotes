<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <!-- Sticky Header with Back Button -->
    <header class="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200/80">
      <div class="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          @click="$emit('exitJobMode')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          HQ
        </button>
        <div>
          <p class="text-base font-semibold leading-tight">Maple St Deck</p>
          <p class="text-sm text-slate-500 leading-tight">Today’s Visit</p>
        </div>
      </div>
    </header>

    <!-- MAIN CONTENT -->
    <main class="mx-auto max-w-4xl space-y-6 px-4 pb-28 pt-4 md:space-y-8">
      <!-- Section: Today's Tasks -->
      <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-semibold">Today’s Tasks</h2>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">6 items</span>
        </div>
        <div class="divide-y divide-slate-200">
          <div v-for="task in tasks" :key="task" class="flex items-center justify-between gap-3 py-3">
            <div class="flex items-center gap-3">
              <span class="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white"></span>
              <p class="text-sm font-medium text-slate-800">{{ task }}</p>
            </div>
            <span class="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
              Pending
            </span>
          </div>
        </div>
      </section>

      <!-- Section: Quick Actions -->
      <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <h2 class="mb-3 text-lg font-semibold">Quick Actions</h2>
        <div class="grid grid-cols-2 gap-3 sm:gap-4">
          <div
            v-for="action in quickActions"
            :key="action.label"
            class="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
          >
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-700 shadow">
              <component :is="iconMap[action.icon]" class="h-6 w-6" />
            </div>
            <p class="text-sm font-medium text-slate-800">{{ action.label }}</p>
          </div>
        </div>
      </section>

      <!-- Section: Job Details (Accordion) -->
      <details class="group rounded-2xl border border-slate-200 bg-white shadow-sm">
        <summary class="flex cursor-pointer items-center justify-between px-4 py-3 text-left md:px-5">
          <div>
            <h3 class="text-base font-semibold text-slate-900">Job Details</h3>
            <p class="text-sm text-slate-500">Tap to view scope and info</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5 text-slate-500 transition group-open:rotate-180" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </summary>
        <div class="border-t border-slate-200 px-4 py-4 space-y-4 md:px-5">
          <div class="space-y-1">
            <p class="text-xs uppercase tracking-wide text-slate-500">Job Info</p>
            <ul class="space-y-1 text-sm text-slate-800">
              <li>Visit Time: {{ jobInfo.visitTime }}</li>
              <li>Client: {{ jobInfo.client }}</li>
              <li>Address: {{ jobInfo.address }}</li>
            </ul>
          </div>
          <div class="space-y-1">
            <p class="text-xs uppercase tracking-wide text-slate-500">Scope Highlights</p>
            <ul class="space-y-1 text-sm text-slate-800">
              <li v-for="item in jobInfo.scope" :key="item">{{ item }}</li>
            </ul>
          </div>
        </div>
      </details>

      <!-- Section: Recent Activity -->
      <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <h2 class="mb-3 text-lg font-semibold">Recent Activity</h2>
        <div class="divide-y divide-slate-200 text-sm text-slate-800">
          <div
            v-for="entry in recentActivity"
            :key="entry.label"
            class="flex items-center justify-between py-3"
          >
            <span>{{ entry.label }}</span>
            <span class="text-xs text-slate-500">{{ entry.time }}</span>
          </div>
        </div>
      </section>
    </main>

    <!-- Floating FAB for Comments -->
    <ProposalCommentsFab proposal-id="demo-proposal" contractor-name="Jordan Deckworks" />
  </div>
</template>

<script setup lang="ts">
import { h } from "vue";
import { ref } from "vue";
import ProposalCommentsFab from "@/components/proposals/ProposalCommentsFab.vue";

const tasks = [
  "Perform site measurements",
  "Photograph existing deck",
  "Review materials with homeowner",
  "Identify hazards or obstructions",
  "Capture upgrade opportunities",
  "Add visit notes",
];

const quickActions = [
  { label: "Add Photos", icon: "camera" as const },
  { label: "Add Notes", icon: "note" as const },
  { label: "Change Order", icon: "repeat" as const },
  { label: "Payment Link", icon: "card" as const },
];

const recentActivity = [
  { label: "Job Mode activated", time: "2 min ago" },
  { label: "Visit scheduled", time: "Today" },
  { label: "Proposal follow-up pending", time: "Yesterday" },
];

const jobInfo = {
  client: "Sarah Thompson",
  address: "123 Maple Street, Charleston SC",
  visitTime: "Today at 3PM",
  scope: ["12' x 20' composite deck", "Standard railing", "New footings"],
};

const makeIcon = (paths: string | string[]) => ({
  render() {
    const list = Array.isArray(paths) ? paths : [paths];
    return h(
      "svg",
      { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": 1.8, "stroke-linecap": "round", "stroke-linejoin": "round" },
      list.map((d) => h("path", { d }))
    );
  },
});

const iconMap = {
  camera: makeIcon(["M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l2-3h8l2 3h3a2 2 0 0 1 2 2Z", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"]),
  note: makeIcon(["M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9Z", "M13 2v7h7", "M9 13h6", "M9 17h6", "M9 9h2"]),
  repeat: makeIcon(["M17 2l4 4-4 4", "M3 11V9a4 4 0 0 1 4-4h14", "M7 22l-4-4 4-4", "M21 13v2a4 4 0 0 1-4 4H3"]),
  card: makeIcon(["M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z", "M2 10h20", "M6 16h4"]),
};
</script>

<style scoped>
.hq-fab :deep(button:hover) {
  box-shadow: 0 0 0 10px rgba(59, 130, 246, 0.15), 0 10px 20px -10px rgba(59, 130, 246, 0.45);
}
</style>
