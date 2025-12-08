<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ChevronRightIcon } from "@heroicons/vue/24/outline";
import SendKickoffModal from "@/components/Kickoff/SendKickoffModal.vue";
import { usePrototypePaymentStore } from "@/stores/prototypePaymentStore";

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
  startDate?: string;
  proposedDate?: string;
  approvedAt?: string;
  message?: string;
  sentAgo?: string;
  kickoffStatus?: "pending" | "sent" | "viewed";
}

const router = useRouter();
const paymentStore = usePrototypePaymentStore();

const projects = ref<ProjectRow[]>([
  {
    id: "p-001",
    client: "Sarah Thompson",
    project: "Maple St Deck",
    option: "Better",
    price: 23800,
    deposit: 3570,
    status: "awaiting-approval",
    sentAgo: "Sent 3 days ago",
  },
  {
    id: "p-002",
    client: "Aaron Patel",
    project: "Lakeview Fence",
    option: "Option not selected yet",
    price: 18600,
    deposit: 2790,
    status: "awaiting-approval",
    sentAgo: "Sent yesterday",
  },
  {
    id: "p-003",
    client: "Julia Reyes",
    project: "Pine Ave Deck",
    option: "Good",
    price: 16400,
    deposit: 2460,
    status: "approved",
    approvedAt: "Approved 2 days ago",
    sentAgo: "Signed 2 days ago",
  },
  {
    id: "p-004",
    client: "Marcus Lee",
    project: "Cedar Patio Cover",
    option: "Best",
    price: 31200,
    deposit: 4680,
    status: "awaiting-client",
    proposedDate: "2025-12-12",
    message: "We can hold this week if you confirm by Friday.",
    sentAgo: "Proposed 1 day ago",
  },
  {
    id: "p-005",
    client: "Dana Kim",
    project: "Broadway Pergola",
    option: "Better",
    price: 22800,
    deposit: 3420,
    status: "scheduled",
    startDate: "2025-12-18",
    sentAgo: "Confirmed 4 days ago",
  },
  {
    id: "p-006",
    client: "Omar Wilson",
    project: "Harbor Railing",
    option: "Good",
    price: 14200,
    deposit: 2130,
    status: "ready",
    startDate: "2026-01-05",
    sentAgo: "Scheduled 6 days ago",
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
    approvedAt: "Approved today",
    sentAgo: "Signed today",
    kickoffStatus: "sent",
  },
]);

const sections = [
  { key: "awaiting-approval" as Status, title: "Awaiting client approval", subtitle: "Proposals sent and awaiting sign-off" },
  { key: "approved" as Status, title: "Approved → Needs Scheduling", subtitle: "Signed deals waiting for a start date" },
  { key: "awaiting-client" as Status, title: "Client reviewing schedule", subtitle: "You proposed a date; waiting on client" },
  { key: "scheduled" as Status, title: "Scheduled", subtitle: "Dates locked with deposit due at scheduling" },
  { key: "ready" as Status, title: "Ready to start", subtitle: "Everything is confirmed; prep kickoff" },
];

const openSections = ref<Record<Status, boolean>>({
  "awaiting-approval": false,
  approved: false,
  "awaiting-client": false,
  scheduled: false,
  ready: false,
});

onMounted(() => {
  const isDesktop = typeof window !== "undefined" && window.innerWidth >= 768;
  if (isDesktop) {
    openSections.value = {
      "awaiting-approval": true,
      approved: true,
      "awaiting-client": true,
      scheduled: true,
      ready: true,
    };
  }
});

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const formatDate = (value?: string) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

const grouped = computed(() => {
  return sections.map((section) => ({
    ...section,
    rows: projects.value.filter((p) => p.status === section.key),
  }));
});

const badgeClass = (row: ProjectRow) => {
  if (row.status === "ready") {
    if (row.kickoffStatus === "sent" || row.kickoffStatus === "viewed") {
      return "bg-emerald-50 text-emerald-700 border border-emerald-100";
    }
    return "bg-slate-50 text-slate-700 border border-slate-200";
  }
  switch (row.status) {
    case "awaiting-approval":
      return "bg-amber-50 text-amber-700 border border-amber-100";
    case "approved":
      return "bg-blue-50 text-blue-700 border border-blue-100";
    case "awaiting-client":
      return "bg-purple-50 text-purple-700 border border-purple-100";
    case "scheduled":
      return "bg-emerald-50 text-emerald-700 border border-emerald-100";
    default:
      return "bg-slate-50 text-slate-700 border border-slate-100";
  }
};

const badgeLabel = (row: ProjectRow) => {
  if (row.status === "ready") {
    if (row.kickoffStatus === "viewed") return "Client viewed";
    if (row.kickoffStatus === "sent") return "Kickoff sent";
    return "Kickoff pending";
  }
  switch (row.status) {
    case "awaiting-approval":
      return "Awaiting approval";
    case "approved":
      return "Needs scheduling";
    case "awaiting-client":
      return "Awaiting client confirmation";
    case "scheduled":
      return "Scheduled";
    default:
      return "";
  }
};

const ctaLabel = (row: ProjectRow) => {
  if (row.status === "ready") {
    if (row.kickoffStatus === "pending" || !row.kickoffStatus) return "Send kickoff details";
    return "View kickoff details";
  }
  switch (row.status) {
    case "awaiting-approval":
      return "View proposal";
    case "approved":
      return "Schedule project";
    case "awaiting-client":
      return "View status";
    case "scheduled":
      return "View details";
    default:
      return "View details";
  }
};

const handleCTA = (row: ProjectRow) => {
  switch (row.status) {
    case "awaiting-approval":
      console.log("[HQ] View proposal", row.id);
      router.push("/prototype/smartproposal/client");
      break;
    case "approved":
      console.log("[HQ] Schedule project", row.id);
      router.push("/prototype/hq/approval-state");
      break;
    case "awaiting-client":
      console.log("[HQ] View schedule status", row.id);
      router.push("/prototype/client/dashboard");
      break;
    case "scheduled":
      console.log("[HQ] View scheduled details", row.id);
      router.push("/prototype/client/contract-packet");
      break;
    case "ready":
      if (row.kickoffStatus === "pending" || !row.kickoffStatus) {
        activeKickoffRow.value = row;
        kickoffModalOpen.value = true;
      } else {
        router.push(`/client/project/${row.id}/kickoff`);
      }
      break;
  }
};

const handleChevron = (row: ProjectRow) => {
  handleCTA(row);
};

const toggleSection = (key: Status) => {
  openSections.value[key] = !openSections.value[key];
};

const kickoffModalOpen = ref(false);
const activeKickoffRow = ref<ProjectRow | null>(null);
const handleKickoffSent = (payload: { arrivalWindow: string; leadName: string; leadPhone: string; materialNotes: string; accessNotes: string }) => {
  if (!activeKickoffRow.value) return;
  activeKickoffRow.value.kickoffStatus = "sent";
  projects.value = [...projects.value];
  kickoffModalOpen.value = false;
};

const depositLabel = (row: ProjectRow) => (paymentStore.isPaid(row.id) ? "Deposit paid" : "Deposit pending");
const depositClass = (row: ProjectRow) =>
  paymentStore.isPaid(row.id)
    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
    : "bg-slate-100 text-slate-600 border border-slate-200";
</script>

<template>
  <main class="min-h-screen bg-white text-slate-900">
    <div class="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Contractor HQ</p>
          <h1 class="text-2xl font-semibold text-slate-900">Projects Overview</h1>
        </div>
        <span class="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-inner">
          Prototype Only
        </span>
      </header>

      <section
        v-for="section in grouped"
        :key="section.key"
        class="mt-8 border border-slate-200/70 bg-white shadow-sm shadow-slate-100/60 sm:rounded-2xl"
      >
        <button
          type="button"
          class="flex w-full items-center justify-between px-4 py-4 text-left sm:px-6"
          @click="toggleSection(section.key)"
        >
          <div>
            <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{{ section.title }}</p>
            <p class="text-sm text-slate-500">{{ section.subtitle }}</p>
          </div>
          <span
            class="ml-4 inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600"
          >
            <svg
              class="h-4 w-4 transition"
              :class="openSections[section.key] ? 'rotate-90 sm:rotate-0' : ''"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </button>

        <div v-if="openSections[section.key]" class="divide-y divide-slate-100/80">
          <div
            v-if="!section.rows.length"
            class="px-4 py-6 sm:px-6"
          >
            <div class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div>
                <p class="text-sm font-semibold text-slate-800">No projects in this stage</p>
                <p class="text-sm text-slate-500">They'll appear here once clients progress.</p>
              </div>
            </div>
          </div>

          <div
            v-for="row in section.rows"
            :key="row.id"
            class="group px-4 py-4 transition hover:-translate-y-[1px] hover:bg-slate-50/80 sm:px-6"
          >
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex flex-col gap-1">
                <div class="flex flex-wrap items-center gap-2">
                  <p class="text-sm font-semibold text-slate-900">{{ row.client }}</p>
                  <span class="text-sm text-slate-500">·</span>
                  <p class="text-sm text-slate-700">{{ row.project }}</p>
                  <span
                    class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                    :class="badgeClass(row)"
                  >
                    {{ badgeLabel(row) }}
                  </span>
                </div>
                <p class="text-sm text-slate-500">
                  {{ row.option || "Option not selected yet" }}
                  <span v-if="row.status === 'approved' && row.approvedAt" class="text-slate-400"> · {{ row.approvedAt }}</span>
                </p>
                <p v-if="row.status === 'awaiting-client' && row.message" class="text-sm text-slate-500">
                  {{ row.message.length > 90 ? row.message.slice(0, 90) + "..." : row.message }}
                </p>
                <p class="text-[13px] text-slate-400" v-if="row.sentAgo">{{ row.sentAgo }}</p>
              </div>

              <div class="flex flex-col items-start gap-2 sm:items-end">
              <div class="flex flex-wrap items-center gap-3 text-sm text-slate-700">
                <span class="font-semibold text-slate-900">{{ formatCurrency(row.price) }}</span>
                <span v-if="row.deposit" class="text-slate-500">Deposit {{ formatCurrency(row.deposit) }}</span>
                <span
                  class="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold"
                  :class="depositClass(row)"
                >
                  {{ depositLabel(row) }}
                </span>
                <span
                  v-if="row.approvedAt && row.status === 'approved'"
                  class="text-xs font-semibold text-slate-500"
                >
                  {{ row.approvedAt }}
                  </span>
                </div>
                <div class="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                  <span v-if="row.proposedDate">Proposed {{ formatDate(row.proposedDate) }}</span>
                  <span v-if="row.startDate">Start {{ formatDate(row.startDate) }}</span>
                </div>
                <button
                  class="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                  :class="row.status === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : row.status === 'ready' && row.kickoffStatus === 'pending' ? 'bg-emerald-600 hover:bg-emerald-700' : ''"
                  @click="handleCTA(row)"
                >
                  {{ ctaLabel(row) }}
                </button>
              </div>
            </div>

            <div class="mt-3 flex items-center justify-between text-sm text-slate-600 sm:mt-2">
              <div class="flex items-center gap-3">
                <span v-if="row.status === 'awaiting-approval'">Option: {{ row.option || "Not selected" }}</span>
                <span v-if="row.status === 'awaiting-client' && row.deposit">Deposit: {{ formatCurrency(row.deposit) }}</span>
              </div>
              <button
                class="inline-flex items-center text-xs font-semibold text-slate-500 transition hover:text-slate-700"
                @click="handleChevron(row)"
              >
                <ChevronRightIcon class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <SendKickoffModal
      :open="kickoffModalOpen"
      :project="activeKickoffRow ? {
        proposalId: activeKickoffRow.id,
        clientName: activeKickoffRow.client,
        projectName: activeKickoffRow.project,
        startDate: activeKickoffRow.startDate || activeKickoffRow.proposedDate,
        price: activeKickoffRow.price,
        deposit: activeKickoffRow.deposit
      } : null"
      @close="kickoffModalOpen = false"
      @sent="handleKickoffSent"
    />
  </main>
</template>
