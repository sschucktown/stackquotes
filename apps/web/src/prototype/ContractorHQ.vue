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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5">
              <path
                fill="currentColor"
                d="M12 22a2.1 2.1 0 0 0 2-2h-4a2.1 2.1 0 0 0 2 2Zm6-6V11a6 6 0 0 0-4.5-5.8V4a1.5 1.5 0 0 0-3 0v1.2A6 6 0 0 0 6 11v5l-2 2v1h16v-1Z"
              />
            </svg>
          </button>
          <button class="rounded-full p-2 text-slate-600 transition hover:bg-slate-100">
            <span class="sr-only">Settings</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5">
              <path
                fill="currentColor"
                d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8.94-2.06a7.6 7.6 0 0 0 .04-1l1.7-1.33a.5.5 0 0 0 .12-.65l-1.6-2.77a.5.5 0 0 0-.61-.21l-2 .8a6.9 6.9 0 0 0-1.7-.98l-.3-2.1a.5.5 0 0 0-.5-.43h-3.2a.5.5 0 0 0-.5.43l-.3 2.1a7 7 0 0 0-1.7.98l-2-.8a.5.5 0 0 0-.61.21l-1.6 2.77a.5.5 0 0 0 .12.65L3.02 12a7.6 7.6 0 0 0-.04 1l-1.7 1.33a.5.5 0 0 0-.12.65l1.6 2.77a.5.5 0 0 0 .61.21l2-.8c.52.38 1.1.72 1.7.98l.3 2.1a.5.5 0 0 0 .5.43h3.2a.5.5 0 0 0 .5-.43l.3-2.1a7 7 0 0 0 1.7-.98l2 .8a.5.5 0 0 0 .61-.21l1.6-2.77a.5.5 0 0 0-.12-.65ZM12 16.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Z"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-5xl space-y-6 px-4 pb-32 pt-6 md:space-y-8 md:px-6 lg:px-8">
      <!-- Alerts -->
      <section
        class="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm md:p-5 shadow-[0_10px_20px_-16px_rgba(15,23,42,0.45)]"
      >
        <div class="mb-3 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold">Today's Attention</h2>
            <p class="text-sm text-slate-500">Quick read alerts to keep you ahead</p>
          </div>
          <div class="grid h-9 w-9 place-items-center rounded-full bg-sky-50 text-sky-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5">
              <path
                fill="currentColor"
                d="M11.29 3.1a1 1 0 0 1 1.42 0l8.19 8.2a1 1 0 0 1-.71 1.7H4.8a1 1 0 0 1-.7-1.7l8.19-8.2ZM12 6.21 7.21 11H17L12 6.2ZM5 20a1 1 0 0 1 0-2h14a1 1 0 1 1 0 2H5Z"
              />
            </svg>
          </div>
        </div>
        <div class="flex gap-3 overflow-x-auto pb-1">
          <HQAlertCard v-for="alert in alerts" :key="alert.title" :alert="alert" />
        </div>
      </section>

      <!-- Jobs -->
      <section class="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm md:p-6">
        <div class="mb-3 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold">Your Jobs</h2>
            <p class="text-sm text-slate-500">Today and in motion</p>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-[#F3F3F5] px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:shadow"
          >
            Field Command Mode ->
          </button>
        </div>

        <div class="space-y-3">
          <div>
            <p class="text-xs uppercase tracking-wide text-slate-500/80">Today</p>
            <div class="mt-2 space-y-2">
              <HQJobRow v-for="job in todayJobs" :key="job.name" :job="job" />
            </div>
          </div>
          <div>
            <p class="text-xs uppercase tracking-wide text-slate-500/80">In Progress</p>
            <div class="mt-2 space-y-2">
              <HQJobRow v-for="job in inProgressJobs" :key="job.name" :job="job" />
            </div>
          </div>
        </div>
      </section>

      <!-- Quick Actions -->
      <section class="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm md:p-6">
        <div class="mb-3 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold">Quick Actions</h2>
            <p class="text-sm text-slate-500">One tap to move work forward</p>
          </div>
        </div>
        <HQQuickActions />
      </section>

      <!-- Performance Snapshot -->
      <section class="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm md:p-6">
        <div class="mb-3 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold">Performance Snapshot</h2>
            <p class="text-sm text-slate-500">Mini ProfitPulse</p>
          </div>
          <div class="grid h-9 w-9 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5">
              <path fill="currentColor" d="M5 3h14a2 2 0 0 1 2 2v14l-4-4H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
            </svg>
          </div>
        </div>
        <div
          class="grid gap-3 divide-y divide-slate-200 sm:grid-cols-3 sm:divide-y-0 sm:divide-x"
        >
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="flex items-center gap-3 py-2 sm:py-0 sm:px-3"
            :title="stat.tooltip"
          >
            <div class="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5">
                <path fill="currentColor" d="M4 13h3l2 6 4-14 3 8h4" />
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-1 text-xl font-semibold leading-tight">
                <span>{{ stat.value }}</span>
                <span :class="stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-500'">
                  {{ stat.trend === "up" ? "^" : "v" }}
                </span>
              </div>
              <p class="text-sm text-slate-500">{{ stat.label }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Messages -->
      <section class="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm md:p-6">
        <HQMessages :threads="messages" />
      </section>
    </main>

    <ProposalCommentsFab proposal-id="demo-proposal" contractor-name="Jordan Deckworks" />
  </div>
</template>

<script setup lang="ts">
import HQAlertCard from "@/components/HQ/HQAlertCard.vue";
import HQJobRow from "@/components/HQ/HQJobRow.vue";
import HQMessages from "@/components/HQ/HQMessages.vue";
import HQQuickActions from "@/components/HQ/HQQuickActions.vue";
import ProposalCommentsFab from "@/components/proposals/ProposalCommentsFab.vue";

const alerts = [
  { title: "3 new visit requests", subtitle: "Needs visit", tone: "info", icon: "info" },
  { title: "Proposal accepted - Maple St Deck", subtitle: "Signed today", tone: "success", icon: "check" },
  { title: "Payment received - $2,400", subtitle: "Payment received", tone: "success", icon: "check" },
  { title: "CO awaiting approval - Kitchen Remodel", subtitle: "Client review", tone: "warning", icon: "flag" },
  { title: "2 unanswered client messages", subtitle: "Follow up", tone: "danger", icon: "alert" },
];

const todayJobs = [
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
  { name: "Sarah Thompson", project: "Maple St Deck", preview: "Hey, quick question about the stain.", time: "2h ago", initials: "ST", jobType: "Deck", unread: true },
  { name: "Mike Robertson", project: "Lakeview Patio", preview: "Did you get the photos?", time: "4h ago", initials: "MR", jobType: "Patio" },
  { name: "Julia Perez", project: "Fence Repair", preview: "We're good for tomorrow!", time: "6h ago", initials: "JP", jobType: "Fence" },
];
</script>
