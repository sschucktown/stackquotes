<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <!-- Header -->
    <header class="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200/80">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 md:px-6 lg:px-8">
        <div class="flex items-center gap-3">
          <div
            class="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white text-base font-semibold shadow-sm"
          >
            JD
          </div>
          <div>
            <p class="text-base font-semibold">Jordan Deckworks</p>
            <div class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              <span class="inline-block h-2 w-2 rounded-full bg-green-500"></span>
              Pro Member
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button class="rounded-full p-2 text-slate-600 transition hover:bg-slate-100">
            <span class="sr-only">Notifications</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Z" />
              <path d="M6 8a6 6 0 1 1 12 0v5l1.5 1.5c.3.3.1.8-.3.8H4.8c-.4 0-.6-.5-.3-.8L6 13V8Z" />
            </svg>
          </button>
          <button class="rounded-full p-2 text-slate-600 transition hover:bg-slate-100">
            <span class="sr-only">Settings</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
              <path d="M19.4 15a1.8 1.8 0 0 0 .4 2l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.8 1.8 0 0 0-2-.4 1.8 1.8 0 0 0-1 1.6 2 2 0 0 1-4 0 1.8 1.8 0 0 0-1-1.6 1.8 1.8 0 0 0-2 .4l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a1.8 1.8 0 0 0 .4-2 1.8 1.8 0 0 0-1.6-1h-.2a2 2 0 0 1 0-4h.2a1.8 1.8 0 0 0 1.6-1 1.8 1.8 0 0 0-.4-2l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.8 1.8 0 0 0 2 .4h.1a1.8 1.8 0 0 0 1-1.6 2 2 0 0 1 4 0 1.8 1.8 0 0 0 1 1.6 1.8 1.8 0 0 0 2-.4l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.8 1.8 0 0 0-.4 2 1.8 1.8 0 0 0 1.6 1h.2a2 2 0 0 1 0 4h-.2a1.8 1.8 0 0 0-1.6 1Z" />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- FIXED: Single Transition wrapping BOTH views -->
    <Transition name="fade">
      <main
        v-if="!isJobMode"
        class="mx-auto max-w-5xl space-y-10 px-4 pb-32 pt-8 md:space-y-12 md:px-6 lg:px-8"
      >
        <!-- Alerts -->
        <TodayAttention />

        <!-- Jobs -->
        <section class="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm transition hover:shadow-md md:p-6">
          <div class="mb-3 flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold">Your Jobs</h2>
              <p class="text-sm text-slate-500">Today and in motion</p>
            </div>
            <button
              type="button"
              class="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#BFD7FF] bg-[#F3F3F5] px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-400 hover:bg-blue-50 hover:shadow md:w-auto"
              @click="isJobMode = true"
            >
              Job Mode
              <span class="transition group-hover:translate-x-0.5">-></span>
            </button>
          </div>

          <div class="space-y-5">
            <div class="mt-2">
              <p class="text-xs uppercase tracking-wide text-slate-500/80 mb-2">Today</p>
              <div class="space-y-2">
                <HQJobRow v-for="job in todayJobs" :key="job.name" :job="job" />
              </div>
            </div>
            <div class="mt-2">
              <p class="text-xs uppercase tracking-wide text-slate-500/80 mb-2">In Progress</p>
              <div class="space-y-2">
                <HQJobRow v-for="job in inProgressJobs" :key="job.name" :job="job" />
              </div>
            </div>
          </div>
        </section>

        <!-- Quick Actions -->
        <section class="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm transition hover:shadow-md md:p-6">
          <div class="mb-3 flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold">Quick Actions</h2>
              <p class="text-sm text-slate-500">One tap to move work forward</p>
            </div>
          </div>
          <HQQuickActions />
        </section>

        <!-- Performance Snapshot -->
        <section class="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm transition hover:shadow-md md:p-6">
          <div class="mb-3 flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold">Performance Snapshot</h2>
              <p class="text-sm text-slate-500">Mini ProfitPulse</p>
            </div>
            <div class="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 3h14a2 2 0 0 1 2 2v14l-4-4H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
              </svg>
            </div>
          </div>

          <div class="grid gap-3 divide-y divide-slate-200 sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
            <div
              v-for="stat in stats"
              :key="stat.label"
              class="flex items-center gap-3 py-2 sm:py-0 sm:px-3"
              :title="stat.tooltip"
            >
              <div class="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 13h3l2 6 4-14 3 8h4" />
                </svg>
              </div>
              <div>
                <div class="flex items-center gap-1 text-xl font-semibold leading-tight">
                  <span>{{ stat.value }}</span>
                  <span :class="stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-500'">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path v-if="stat.trend === 'up'" d="M3 17 9 11l4 4 7-7" />
                      <path v-else d="m21 7-6 6-4-4-7 7" />
                    </svg>
                  </span>
                </div>
                <p class="text-sm text-slate-500">{{ stat.label }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Messages -->
        <section class="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm transition hover:shadow-md md:p-6">
          <HQMessages :threads="messages" />
        </section>
      </main>

      <!-- FIXED: v-else is now inside same parent as v-if -->
      <JobMode v-else @exitJobMode="isJobMode = false" />
    </Transition>

    <div class="hq-fab">
      <ProposalCommentsFab proposal-id="demo-proposal" contractor-name="Jordan Deckworks" />
    </div>

    <NewMessageToast />

    <div class="fixed bottom-4 left-4 z-40 text-[11px] text-slate-500">
      <button
        type="button"
        class="rounded-full border border-slate-300 bg-white/80 px-3 py-1 shadow-sm transition hover:bg-slate-50"
        @click="messageStore.simulateRandomIncoming()"
      >
        🔁 Trigger demo message
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import TodayAttention from "@/components/HQ/TodayAttention.vue";
import HQJobRow from "@/components/HQ/HQJobRow.vue";
import HQMessages from "@/components/HQ/HQMessages.vue";
import HQQuickActions from "@/components/HQ/HQQuickActions.vue";
import ProposalCommentsFab from "@/components/proposals/ProposalCommentsFab.vue";
import JobMode from "@/prototype/contractor/JobMode.vue";
import NewMessageToast from "@/prototype/components/NewMessageToast.vue";
import { useMockMessageChannel } from "@/prototype/composables/useMockMessageChannel";
import { messageStore } from "@/prototype/stores/messages";
import { ref } from "vue";

type JobStatus = "In Progress" | "Scheduled" | "Pending" | "Needs Visit";
type TradeType = "deck" | "fence" | "patio";
type Job = {
  name: string;
  type: string;
  status: JobStatus;
  detail: string;
  photo?: string;
  trade: TradeType;
};

const todayJobs: Job[] = [
  {
    name: "Maple St Deck",
    type: "Deck",
    status: "Needs Visit",
    detail: "Site Visit at 3PM",
    trade: "deck",
    photo: "",
  },
  {
    name: "Baker Ave Fence",
    type: "Fence",
    status: "Pending",
    detail: "Proposal Follow-Up",
    trade: "fence",
    photo: "",
  },
];

const inProgressJobs = [
  {
    name: "Lakeview Patio Build",
    type: "Patio",
    status: "In Progress",
    detail: "Active crew on-site",
    trade: "patio",
    photo: "",
  },
  {
    name: "Riverside Gate Repair",
    type: "Fence",
    status: "Scheduled",
    detail: "Starts tomorrow",
    trade: "fence",
    photo: "",
  },
  {
    name: "Willow Oaks Deck Demo",
    type: "Deck",
    status: "Pending",
    detail: "Pending approval",
    trade: "deck",
    photo: "",
  },
];

const stats = [
  { label: "This Month", value: "$28,400", trend: "up", tooltip: "Month-to-date billed" },
  { label: "Outstanding", value: "$6,200", trend: "down", tooltip: "Awaiting payment" },
  { label: "Conversion Rate", value: "38%", trend: "up", tooltip: "Won vs sent proposals" },
];

const messages = [
  { name: "Sarah Thompson", project: "Maple St Deck", preview: "Hey, quick question about the stain.", time: "2h ago", initials: "ST", jobType: "Deck", unread: true, delay: "30ms" },
  { name: "Mike Robertson", project: "Lakeview Patio", preview: "Did you get the photos?", time: "4h ago", initials: "MR", jobType: "Patio", unread: true, delay: "60ms" },
  { name: "Julia Perez", project: "Fence Repair", preview: "We're good for tomorrow!", time: "6h ago", initials: "JP", jobType: "Fence", delay: "90ms" },
];

const isJobMode = ref(false);
useMockMessageChannel({ auto: true });
</script>

<style scoped>
.hq-fab :deep(button:hover) {
  box-shadow: 0 0 0 10px rgba(59, 130, 246, 0.15), 0 10px 20px -10px rgba(59, 130, 246, 0.45);
}
</style>
