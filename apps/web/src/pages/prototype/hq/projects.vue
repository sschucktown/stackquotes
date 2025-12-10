<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ChevronRightIcon } from "@heroicons/vue/24/outline";
import SendKickoffModal from "@/components/Kickoff/SendKickoffModal.vue";
import ProjectsOverviewDrawer from "@/prototype/hq/components/ProjectsOverviewDrawer.vue";
import { usePrototypePaymentStore } from "@/stores/prototypePaymentStore";

// --------------------------------------------------
// Types
// --------------------------------------------------
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
  approvedAtISO?: string;      // ⭐ NEW
  approvedAtText?: string;     // computed fallback
  proposedDateISO?: string;
  startDateISO?: string;
  kickoffStatus?: "pending" | "sent" | "viewed";
  message?: string;
}

// Utility
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

// --------------------------------------------------
// DATA — Realistic ISO timestamps
// --------------------------------------------------
const projects = ref<ProjectRow[]>([
  {
    id: "p-001",
    client: "Sarah Thompson",
    project: "Maple St Deck",
    option: "Better",
    price: 23800,
    deposit: 3570,
    status: "awaiting-approval",
    approvedAtISO: undefined,
  },
  {
    id: "p-002",
    client: "Aaron Patel",
    project: "Lakeview Fence",
    option: "Option not selected yet",
    price: 18600,
    deposit: 2790,
    status: "awaiting-approval",
  },
  {
    id: "p-003",
    client: "Julia Reyes",
    project: "Pine Ave Deck",
    option: "Good",
    price: 16400,
    deposit: 2460,
    status: "approved",
    approvedAtISO: "2025-12-07T14:22:00Z",
  },
  {
    id: "p-004",
    client: "Marcus Lee",
    project: "Cedar Patio Cover",
    option: "Best",
    price: 31200,
    deposit: 4680,
    status: "awaiting-client",
    proposedDateISO: "2025-12-12T00:00:00Z",
    message: "We can hold this week if you confirm by Friday.",
  },
  {
    id: "p-005",
    client: "Dana Kim",
    project: "Broadway Pergola",
    option: "Better",
    price: 22800,
    deposit: 3420,
    status: "scheduled",
    startDateISO: "2025-12-18T00:00:00Z",
  },
  {
    id: "p-006",
    client: "Omar Wilson",
    project: "Harbor Railing",
    option: "Good",
    price: 14200,
    deposit: 2130,
    status: "ready",
    startDateISO: "2026-01-05T00:00:00Z",
    kickoffStatus: "pending",
  },
  {
    id: "p-007",
    client: "Priya Das",
    project: "Evergreen Deck Refresh",
    option: "Best",
    price: 28500,
    deposit: 4275,
    status: "approved",
    approvedAtISO: new Date().toISOString(), // approved today
    kickoffStatus: "sent",
  },
]);

// --------------------------------------------------
// Sections
// --------------------------------------------------
const sections = [
  { key: "awaiting-approval", title: "Awaiting client approval", subtitle: "Proposals sent and awaiting sign-off" },
  { key: "approved", title: "Approved → Needs Scheduling", subtitle: "Signed deals waiting for a start date" },
  { key: "awaiting-client", title: "Client reviewing schedule", subtitle: "You proposed a date; waiting on client" },
  { key: "scheduled", title: "Scheduled", subtitle: "Dates locked with deposit due at scheduling" },
  { key: "ready", title: "Ready to start", subtitle: "Everything is confirmed; prep kickoff" },
] as const;

// --------------------------------------------------
// Expand All (desktop)
// --------------------------------------------------
const openSections = ref<Record<Status, boolean>>({
  "awaiting-approval": true,
  approved: true,
  "awaiting-client": true,
  scheduled: true,
  ready: true,
});

// --------------------------------------------------
// Grouped data
// --------------------------------------------------
const grouped = computed(() =>
  sections.map((s) => ({
    ...s,
    rows: projects.value.filter((p) => p.status === s.key),
  }))
);

// --------------------------------------------------
// Drawer Logic
// --------------------------------------------------
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
    signature_image: undefined, // populated once SmartProposal stores signatures
    approved_at: row.approvedAtISO,
  };
  drawerOpen.value = true;
};

const closeDrawer = () => {
  drawerOpen.value = false;
  drawerJob.value = null;
};

// --------------------------------------------------
// Event Handlers
// --------------------------------------------------
const router = useRouter();
const paymentStore = usePrototypePaymentStore();

const handleCTA = (row: ProjectRow) => {
  switch (row.status) {
    case "awaiting-approval":
      return router.push("/prototype/smartproposal/client");
    case "approved":
      return router.push("/prototype/hq/approval-state");
    case "awaiting-client":
      return router.push("/prototype/client/dashboard");
    case "scheduled":
      return router.push("/prototype/client/contract-packet");
    case "ready":
      return openDrawer(row);
  }
};
</script>

<template>
  <main class="min-h-screen bg-white text-slate-900">
    <div class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            Contractor HQ
          </p>
          <h1 class="text-2xl font-semibold text-slate-900">
            Projects Overview
          </h1>
        </div>
        <span class="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          Prototype Only
        </span>
      </header>

      <!-- Sections -->
      <section
        v-for="section in grouped"
        :key="section.key"
        class="mt-8 border border-slate-200/70 bg-white shadow-sm sm:rounded-2xl"
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
            <p class="text-sm text-slate-500">
              {{ section.subtitle }}
            </p>
          </div>

          <span class="ml-4 inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600">
            <ChevronRightIcon
              class="h-4 w-4 transition"
              :class="openSections[section.key] ? 'rotate-90 sm:rotate-0' : ''"
            />
          </span>
        </button>

        <div v-if="openSections[section.key]" class="divide-y divide-slate-100/80">
          <div
            v-if="!section.rows.length"
            class="px-4 py-6 sm:px-6"
          >
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p class="text-sm font-semibold text-slate-800">
                No projects in this stage
              </p>
              <p class="text-sm text-slate-500">
                They'll appear here once clients progress.
              </p>
            </div>
          </div>

          <!-- Project Row -->
          <div
            v-for="row in section.rows"
            :key="row.id"
            class="group px-4 py-4 transition hover:bg-slate-50 sm:px-6"
          >
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex flex-col gap-1">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="text-sm font-semibold text-slate-900">
                    {{ row.client }}
                  </p>
                  <span class="text-sm text-slate-500">·</span>
                  <p class="text-sm text-slate-700">
                    {{ row.project }}
                  </p>

                  <!-- Status Badge -->
                  <span
                    class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                    :class="
                      row.status === 'approved'
                        ? 'bg-blue-50 text-blue-700'
                        : row.status === 'awaiting-client'
                        ? 'bg-purple-50 text-purple-700'
                        : row.status === 'scheduled'
                        ? 'bg-emerald-50 text-emerald-700'
                        : row.status === 'ready'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    "
                  >
                    {{ row.status }}
                  </span>
                </div>

                <!-- Option -->
                <p class="text-sm text-slate-500">
                  {{ row.option }}
                  <span
                    v-if="row.approvedAtISO"
                    class="text-slate-400"
                  >
                    · {{ formatDate(row.approvedAtISO) }}
                  </span>
                </p>

                <!-- Optional message -->
                <p
                  v-if="row.message"
                  class="text-sm text-slate-500"
                >
                  {{ row.message.length > 90 ? row.message.slice(0, 90) + "..." : row.message }}
                </p>
              </div>

              <!-- Right Column -->
              <div class="flex flex-col items-start gap-2 sm:items-end">
                <div class="flex flex-wrap items-center gap-3 text-sm text-slate-700">
                  <span class="font-semibold text-slate-900">
                    {{ formatCurrency(row.price) }}
                  </span>

                  <span class="text-slate-500">
                    Deposit {{ formatCurrency(row.deposit) }}
                  </span>
                </div>

                <!-- Dates -->
                <div class="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <span v-if="row.proposedDateISO">
                    Proposed {{ formatDate(row.proposedDateISO) }}
                  </span>

                  <span v-if="row.startDateISO">
                    Start {{ formatDate(row.startDateISO) }}
                  </span>
                </div>

                <!-- CTA -->
                <button
                  class="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                  :class="{
                    'bg-emerald-600 hover:bg-emerald-700':
                      row.status === 'approved' ||
                      (row.status === 'ready' && row.kickoffStatus === 'pending')
                  }"
                  @click="handleCTA(row)"
                >
                  {{
                    row.status === "awaiting-approval"
                      ? "View proposal"
                      : row.status === "approved"
                      ? "Schedule project"
                      : row.status === "awaiting-client"
                      ? "View status"
                      : row.status === "scheduled"
                      ? "View details"
                      : "Open"
                  }}
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
      @schedule="(id) => router.push('/prototype/hq/approval-state')"
      @openProposal="(id) => router.push('/prototype/smartproposal/client')"
      @payments="(id) => router.push('/payments')"
    />

    <!-- Kickoff -->
    <SendKickoffModal
      :open="false"
      :project="null"
      @close="() => {}"
      @sent="() => {}"
    />
  </main>
</template>
