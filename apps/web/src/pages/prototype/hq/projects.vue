<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { ChevronRightIcon } from "@heroicons/vue/24/outline";
import ScheduleProjectModal from "@/prototype/hq/components/ScheduleProjectModal.vue";
import ProjectsOverviewDrawer from "@/prototype/hq/components/ProjectsOverviewDrawer.vue";
import SendKickoffModal from "@/components/Kickoff/SendKickoffModal.vue";
import { usePrototypePaymentStore } from "@/stores/prototypePaymentStore";

/* ---------------------------------------------------
   Types
--------------------------------------------------- */
type Status =
  | "awaiting-approval"
  | "approved"
  | "awaiting-client"
  | "scheduled"
  | "ready";

interface ProjectRow {
  id: string;
  client: string;
  project: string;
  option: string;
  price: number;
  deposit: number;
  status: Status;
  approvedAtISO?: string;
  proposedDateISO?: string;
  startDateISO?: string;
  kickoffStatus?: "pending" | "sent" | "viewed";
  message?: string;
}

type Job = {
  id: string;
  proposal_id: string;
  client_id: string;
  contractor_id: string;
  approved_option: string;
  approved_price: number;
  deposit_amount: number | null;
  status: "pending" | "scheduled" | "ready" | "in_progress" | "complete";
  scheduled_start: string | null;
  scheduled_end: string | null;
  created_at: string;
};

/* ---------------------------------------------------
   Router + Stores
--------------------------------------------------- */
const router = useRouter();
const paymentStore = usePrototypePaymentStore();

/* ---------------------------------------------------
   Utilities
--------------------------------------------------- */
const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const formatDate = (iso?: string) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

/* ---------------------------------------------------
   Data
--------------------------------------------------- */
const projects = ref<ProjectRow[]>([]);

const mapStatus = (status: string): Status => {
  switch (status) {
    case "pending":
      return "approved";
    case "scheduled":
      return "scheduled";
    case "ready":
      return "ready";
    default:
      return "ready";
  }
};

const fetchJobs = async () => {
  try {
    const response = await fetch("/api/jobs");
    if (!response.ok) throw new Error("Failed to fetch jobs");

    const data = (await response.json()) as Job[];
    projects.value = data.map((job) => ({
      id: job.id,
      client: "Client Name Placeholder",
      project: "Project Title Placeholder",
      option: job.approved_option,
      price: job.approved_price,
      deposit: job.deposit_amount ?? 0,
      status: mapStatus(job.status),
      approvedAtISO: job.created_at,
      startDateISO: job.scheduled_start || undefined,
    }));
  } catch (err) {
    console.error("Error fetching jobs", err);
  }
};

onMounted(() => {
  fetchJobs();
});

/* ---------------------------------------------------
   Section Grouping
--------------------------------------------------- */
const sections = [
  { key: "awaiting-approval", title: "Awaiting client approval" },
  { key: "approved", title: "Approved - Needs Scheduling" },
  { key: "awaiting-client", title: "Client reviewing schedule" },
  { key: "scheduled", title: "Scheduled" },
  { key: "ready", title: "Ready to start" },
] as const;

const openSections = ref<Record<Status, boolean>>({
  "awaiting-approval": true,
  approved: true,
  "awaiting-client": true,
  scheduled: true,
  ready: true,
});

const grouped = computed(() =>
  sections.map((s) => ({
    ...s,
    rows: projects.value.filter((p) => p.status === s.key),
  }))
);

/* ---------------------------------------------------
   Drawer State
--------------------------------------------------- */
const drawerOpen = ref(false);
const drawerJob = ref<any>(null);

const openDrawer = (row: ProjectRow) => {
  drawerJob.value = {
    id: row.id,
    title: row.project,
    client_name: row.client,
    status: row.status,
    approved_option: row.option,
    deposit_amount: row.deposit,
    approved_at: row.approvedAtISO,
  };
  drawerOpen.value = true;
};

const closeDrawer = () => {
  drawerOpen.value = false;
  drawerJob.value = null;
};

/* ---------------------------------------------------
   Scheduling Modal State
--------------------------------------------------- */
const scheduleModalOpen = ref(false);
const scheduleJob = ref<ProjectRow | null>(null);

const openScheduleModal = (row: ProjectRow) => {
  scheduleJob.value = row;
  scheduleModalOpen.value = true;
};

const handleScheduleSubmit = (payload: { start: string; end?: string }) => {
  if (!scheduleJob.value) return;

  // Prototype update
  scheduleJob.value.startDateISO = payload.start;
  scheduleJob.value.status = "scheduled";

  router.push({
    path: "/prototype/hq/schedule/confirm",
    query: {
      job: scheduleJob.value.id,
      start: payload.start,
      end: payload.end ?? "",
    },
  });

  scheduleModalOpen.value = false;
};

/* ---------------------------------------------------
   CTA Logic
--------------------------------------------------- */
const handleCTA = (row: ProjectRow) => {
  // NEW: Always allow direct JobView navigation
  return router.push(`/prototype/hq/job-view?id=${row.id}`);
};
</script>

<template>
  <main class="min-h-screen bg-white text-slate-900">
    <div class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Contractor HQ
          </p>
          <h1 class="text-2xl font-semibold text-slate-900">Projects Overview</h1>
        </div>
        <span class="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          Prototype Only
        </span>
      </header>

      <!-- Sections -->
      <section
        v-for="section in grouped"
        :key="section.key"
        class="mt-8 border border-slate-200 bg-white shadow-sm sm:rounded-2xl"
      >
        <button
          type="button"
          class="flex w-full items-center justify-between px-4 py-4 sm:px-6"
          @click="openSections[section.key] = !openSections[section.key]"
        >
          <div>
            <p class="text-[11px] uppercase font-semibold tracking-[0.12em] text-slate-500">
              {{ section.title }}
            </p>
          </div>

          <span
            class="ml-4 inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600"
          >
            <ChevronRightIcon
              class="h-4 w-4 transition"
              :class="openSections[section.key] ? 'rotate-90 sm:rotate-0' : ''"
            />
          </span>
        </button>

        <div v-if="openSections[section.key]" class="divide-y divide-slate-100">
          <div
            v-for="row in section.rows"
            :key="row.id"
            class="px-4 py-4 hover:bg-slate-50 sm:px-6 cursor-pointer"
            @click="handleCTA(row)"
          >
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <!-- Left -->
              <div>
                <div class="flex items-center gap-2">
                  <p class="text-sm font-semibold text-slate-900">{{ row.client }}</p>
                  <span class="text-slate-500">|</span>
                  <p class="text-sm text-slate-700">{{ row.project }}</p>
                </div>

                <p class="text-sm text-slate-500">
                  {{ row.option }}
                  <span v-if="row.approvedAtISO" class="text-slate-400">
                    | {{ formatDate(row.approvedAtISO) }}
                  </span>
                </p>
              </div>

              <!-- Right -->
              <div class="flex flex-col items-start sm:items-end gap-2">
                <span class="font-semibold text-slate-900">
                  {{ formatCurrency(row.price) }}
                </span>

                <button
                  class="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800 transition"
                  @click.stop="handleCTA(row)"
                >
                  View Job >
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Drawer -->
    <ProjectsOverviewDrawer
      :open="drawerOpen"
      :job="drawerJob"
      :onClose="closeDrawer"
    />

    <!-- Scheduling Modal -->
    <ScheduleProjectModal
      :open="scheduleModalOpen"
      :job="scheduleJob"
      @close="scheduleModalOpen = false"
      @submit="handleScheduleSubmit"
    />

    <SendKickoffModal :open="false" :project="null" />
  </main>
</template>



