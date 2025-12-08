<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <!-- Header -->
    <header class="sticky top-0 z-30 bg-white border-b border-slate-200/70">
      <div class="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="h-10 w-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-white font-semibold grid place-items-center shadow-sm"
          >
            JD
          </div>
          <div>
            <div class="text-base font-semibold">Jordan Deckworks</div>
            <div class="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 text-xs">
              <span class="inline-block h-2 w-2 rounded-full bg-green-500"></span>
              Pro Member
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button class="p-2 rounded-full hover:bg-slate-100 text-slate-600">
            <span class="sr-only">Notifications</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5">
              <path
                fill="currentColor"
                d="M12 22a2.1 2.1 0 0 0 2-2h-4a2.1 2.1 0 0 0 2 2Zm6-6V11a6 6 0 0 0-4.5-5.8V4a1.5 1.5 0 0 0-3 0v1.2A6 6 0 0 0 6 11v5l-2 2v1h16v-1Z"
              />
            </svg>
          </button>
          <button class="p-2 rounded-full hover:bg-slate-100 text-slate-600" @click="showSettings = true">
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

    <main class="max-w-4xl mx-auto px-4 pb-28 pt-20 space-y-4">
      <!-- Alerts -->
      <section class="bg-white border border-slate-200/70 rounded-2xl shadow-sm p-4 md:p-5">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h2 class="text-lg font-semibold">Today's Attention</h2>
            <p class="text-sm text-slate-500">Quick read alerts to keep you ahead</p>
          </div>
          <div class="h-9 w-9 rounded-full bg-sky-50 text-sky-600 grid place-items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5">
              <path
                fill="currentColor"
                d="M11.29 3.1a1 1 0 0 1 1.42 0l8.19 8.2a1 1 0 0 1-.71 1.7H4.8a1 1 0 0 1-.7-1.7l8.19-8.2ZM12 6.21 7.21 11H17L12 6.2ZM5 20a1 1 0 0 1 0-2h14a1 1 0 1 1 0 2H5Z"
              />
            </svg>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <div
            v-for="alert in hqAlerts"
            :key="alert.id"
            class="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-emerald-700 text-sm shadow-sm"
          >
            {{ alert.text }}
          </div>
        </div>
      </section>

      <!-- Jobs -->
      <section class="bg-white border border-slate-200/70 rounded-2xl shadow-sm p-4 md:p-5">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h2 class="text-lg font-semibold">Your Jobs</h2>
            <p class="text-sm text-slate-500">Today and in motion</p>
          </div>
          <span class="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600">Field command</span>
        </div>
        <div class="space-y-4">
          <div class="space-y-2">
            <p class="text-xs uppercase tracking-wide text-slate-500">Today</p>
            <div class="grid gap-2">
              <article
                v-for="job in todayJobs"
                :key="job.id"
                class="flex items-center justify-between rounded-xl border border-slate-200 hover:border-sky-200 bg-slate-50/80 hover:bg-white transition-colors px-3 py-3"
              >
                <div class="flex items-start gap-3">
                  <div class="h-10 w-10 rounded-xl bg-white text-sky-600 border border-slate-200 grid place-items-center shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5">
                      <path
                        fill="currentColor"
                        d="M18 8h-1V6a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3v2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2ZM9 6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2H9V6Zm9 12H6v-6h12v6Z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="font-semibold leading-tight">{{ job.name }}</h3>
                      <span class="text-xs px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                        {{ job.type }}
                      </span>
                      <span
                        v-if="job.proposalDraft"
                        class="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700"
                      >
                        Proposal Draft
                      </span>
                    </div>
                    <p class="text-sm text-slate-500">{{ job.detail }}</p>
                    <div
                      class="mt-1 inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border"
                      :class="statusClasses[job.status]"
                    >
                      <span class="h-2 w-2 rounded-full" :class="dotClasses[job.status]"></span>
                      {{ job.status }}
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    v-if="job.proposalDraft"
                    type="button"
                    class="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-inner transition hover:-translate-y-0.5"
                    @click="openProposal(job.id)"
                  >
                    Open Proposal
                  </button>
                  <div class="text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5">
                      <path fill="currentColor" d="m9 18 6-6-6-6v12Z" />
                    </svg>
                  </div>
                </div>
              </article>
            </div>
          </div>
          <div class="space-y-2">
            <p class="text-xs uppercase tracking-wide text-slate-500">In Progress</p>
            <div class="grid gap-2">
              <article
                v-for="job in inProgressJobs"
                :key="job.id"
                class="flex items-center justify-between rounded-xl border border-slate-200 hover:border-sky-200 bg-white transition-colors px-3 py-3 shadow-sm"
              >
                <div class="flex items-start gap-3">
                  <div class="h-10 w-10 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 grid place-items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5">
                      <path
                        fill="currentColor"
                        d="M12 2 3 7l9 5 9-5-9-5Zm0 9-9-5v11l9 5 9-5V6l-9 5Z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <h3 class="font-semibold leading-tight">{{ job.name }}</h3>
                      <span class="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                        {{ job.type }}
                      </span>
                      <span
                        v-if="job.proposalDraft"
                        class="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700"
                      >
                        Proposal Draft
                      </span>
                    </div>
                    <p class="text-sm text-slate-500">{{ job.detail }}</p>
                    <div
                      class="mt-1 inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full border"
                      :class="statusClasses[job.status]"
                    >
                      <span class="h-2 w-2 rounded-full" :class="dotClasses[job.status]"></span>
                      {{ job.status }}
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    v-if="job.proposalDraft"
                    type="button"
                    class="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-inner transition hover:-translate-y-0.5"
                    @click="openProposal(job.id)"
                  >
                    Open Proposal
                  </button>
                  <div class="text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5">
                      <path fill="currentColor" d="m9 18 6-6-6-6v12Z" />
                    </svg>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <!-- Quick Actions -->
      <section class="bg-white border border-slate-200/70 rounded-2xl shadow-sm p-4 md:p-5">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h2 class="text-lg font-semibold">Quick Actions</h2>
            <p class="text-sm text-slate-500">One tap to move work forward</p>
          </div>
        </div>
        <div class="flex gap-4 overflow-x-auto pb-2">
          <div
            v-for="action in quickActions"
            :key="action.label"
            class="flex flex-col items-center min-w-[80px] gap-2"
          >
            <button
              class="h-14 w-14 rounded-full bg-slate-50 text-slate-700 border border-slate-200 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition"
            >
              <span class="sr-only">{{ action.label }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5 mx-auto">
                <path :fill="action.tint" d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6Z" />
              </svg>
            </button>
            <span class="text-sm text-slate-700">{{ action.label }}</span>
          </div>
        </div>
      </section>

      <!-- Revenue Snapshot -->
      <section class="bg-white border border-slate-200/70 rounded-2xl shadow-sm p-4 md:p-5">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h2 class="text-lg font-semibold">Performance Snapshot</h2>
            <p class="text-sm text-slate-500">Mini ProfitPulse</p>
          </div>
          <div class="h-9 w-9 rounded-full bg-emerald-50 text-emerald-600 grid place-items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5">
              <path
                fill="currentColor"
                d="M5 3h14a2 2 0 0 1 2 2v14l-4-4H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
              />
            </svg>
          </div>
        </div>
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
          <div v-for="stat in stats" :key="stat.label" class="flex-1 flex items-center gap-3 py-2 sm:py-0 sm:px-4">
            <div class="h-10 w-10 rounded-xl bg-slate-50 text-slate-700 grid place-items-center border border-slate-200">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5">
                <path
                  fill="currentColor"
                  d="M4 13h3l2 6 4-14 3 8h4"
                />
              </svg>
            </div>
            <div>
              <div class="text-xl font-semibold leading-tight">{{ stat.value }}</div>
              <p class="text-sm text-slate-500">{{ stat.label }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Messages -->
      <section class="bg-white border border-slate-200/70 rounded-2xl shadow-sm p-4 md:p-5">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h2 class="text-lg font-semibold">Recent Messages</h2>
            <p class="text-sm text-slate-500">Stay close to clients</p>
          </div>
            <span class="text-xs px-3 py-1 rounded-full bg-blue-50 text-sky-700 border border-sky-100">Inbox</span>
        </div>
        <div class="space-y-2">
          <article
            v-for="message in messages"
            :key="message.name"
            class="flex items-center justify-between rounded-xl border border-slate-200 hover:border-sky-200 bg-white px-3 py-3 shadow-sm"
          >
            <div class="flex items-start gap-3">
              <div
                class="h-10 w-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-100 text-slate-700 grid place-items-center text-sm font-semibold"
              >
                {{ message.initials }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="font-semibold leading-tight">{{ message.name }}</h3>
                  <span class="text-xs text-slate-400">{{ message.time }}</span>
                </div>
                <p class="text-xs uppercase tracking-wide text-slate-500">{{ message.project }}</p>
                <p class="text-sm text-slate-700">{{ message.preview }}</p>
              </div>
            </div>
            <div class="text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5">
                <path fill="currentColor" d="m9 18 6-6-6-6v12Z" />
              </svg>
            </div>
          </article>
        </div>
      </section>
    </main>

    <ProposalCommentsFab proposal-id="demo-proposal" contractor-name="Jordan Deckworks" />
    <SettingsDrawer v-if="showSettings" @close="showSettings = false" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import ProposalCommentsFab from "@/components/proposals/ProposalCommentsFab.vue";
import SettingsDrawer from "@/components/Settings/SettingsDrawer.vue";
import { useContractorHQPrototype } from "@/stores/contractorHQPrototype";

type JobStatus = "In Progress" | "Scheduled" | "Pending" | "Needs Visit";

const router = useRouter();
const showSettings = ref(false);
const hqStore = useContractorHQPrototype();

const hqAlerts = computed(() => hqStore.hqAlerts);
const jobs = computed(() => hqStore.jobs);
const todayJobs = computed(() => jobs.value.filter((job) => job.status === "Needs Visit" || job.status === "Pending"));
const inProgressJobs = computed(() => jobs.value.filter((job) => job.status === "In Progress" || job.status === "Scheduled"));

const quickActions = [
  { label: "New Quote", tint: "#0ea5e9" },
  { label: "New Proposal", tint: "#2563eb" },
  { label: "New Change Order", tint: "#0f766e" },
  { label: "Schedule Visit", tint: "#f59e0b" },
  { label: "Send Payment Link", tint: "#8b5cf6" },
];

const stats = [
  { label: "This Month", value: "$28,400" },
  { label: "Outstanding", value: "$6,200" },
  { label: "Conversion Rate", value: "38%" },
];

const messages = [
  { name: "Sarah Thompson", project: "Maple St Deck", preview: "Hey, quick question...", time: "2h ago", initials: "ST" },
  { name: "Mike Robertson", project: "Lakeview Patio", preview: "Did you get the photos?", time: "4h ago", initials: "MR" },
  { name: "Julia Perez", project: "Fence Repair", preview: "We're good for tomorrow!", time: "6h ago", initials: "JP" },
];

const statusClasses: Record<JobStatus, string> = {
  "In Progress": "bg-emerald-50 text-emerald-700 border-emerald-100",
  Scheduled: "bg-blue-50 text-blue-700 border-blue-100",
  Pending: "bg-amber-50 text-amber-700 border-amber-100",
  "Needs Visit": "bg-slate-100 text-slate-700 border-slate-200",
};

const dotClasses: Record<JobStatus, string> = {
  "In Progress": "bg-emerald-500",
  Scheduled: "bg-blue-500",
  Pending: "bg-amber-500",
  "Needs Visit": "bg-slate-500",
};

const openProposal = (jobId: string) => {
  router.push({ path: "/prototype/smartproposal", query: { job: jobId } });
};
</script>
