<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import MessageLightbox from "@/components/Messaging/MessageLightbox.vue";
import { useContractorHQPrototype, type KickoffState } from "@/stores/contractorHQPrototype";

type JobStatus = "pending" | "scheduled" | "ready" | "in_progress" | "complete";

type Job = {
  id: string;
  proposal_id: string;
  contractor_id: string;
  client_id: string;
  approved_option: string;
  approved_price: number;
  deposit_amount: number | null;
  status: JobStatus;
  scheduled_start: string | null;
  scheduled_end: string | null;
  approved_at: string | null;
  created_at: string;
};

const props = defineProps<{
  job?: Job | null;
}>();

const route = useRoute();
const router = useRouter();
const hqStore = useContractorHQPrototype();

const job = ref<Job | null>(props.job ?? null);
const loading = ref(false);
const error = ref(false);
const viewedAlready = ref(false);

const normalizeParam = (value: unknown): string => {
  if (Array.isArray(value)) return value[0] ?? "";
  return typeof value === "string" ? value : "";
};

const routeJobId = computed(() => {
  return (
    normalizeParam(route.query.job_id) ||
    normalizeParam(route.params.id as string | string[] | undefined) ||
    normalizeParam(route.query.job)
  );
});

const jobId = computed(() => props.job?.id || routeJobId.value);

const defaultKickoffState = (): KickoffState => ({
  crewLead: "",
  crewLeadPhone: "",
  arrivalWindow: "8:00-10:00 AM",
  materialDrop: "",
  accessInstructions: "",
  preconstructionNotes: "",
  dayOneExpectations: "",
  safety: "Crew wears protective gear. Please keep pets/kids clear.",
  weatherPolicy: "If weather disrupts work, we reschedule ASAP. No extra charge.",
  clientConfirmed: false,
  clientSubmittedAccess: false,
  packetSentAt: null,
  packetViewedAt: null,
});

const kickoffEntry = computed(() => (jobId.value ? hqStore.jobs.find((j) => j.id === jobId.value) : undefined));

const ensureKickoffEntry = () => {
  const id = jobId.value;
  if (!id) return undefined;

  let entry = kickoffEntry.value as any;

  if (!entry) {
    entry = {
      id,
      name: job.value?.approved_option || "Project",
      type: "Job",
      status: "Pending",
      detail: "",
      lead: "",
      location: "",
      proposalDraft: null,
      timeline: [],
      kickoff: defaultKickoffState(),
    } as any;
    hqStore.jobs.push(entry);
  } else if (!entry.kickoff) {
    entry.kickoff = defaultKickoffState();
  }

  if (entry && job.value?.approved_option) {
    entry.name = job.value.approved_option;
  }

  return entry;
};

const kickoff = computed<KickoffState>(() => kickoffEntry.value?.kickoff || defaultKickoffState());

const steps = [
  { id: "ready", title: "Kickoff Ready", subtitle: "Packet sent" },
  { id: "expect", title: "What to Expect", subtitle: "Arrival, safety, day one" },
  { id: "access", title: "Access Instructions", subtitle: "Codes, parking, pets" },
];

const arrivalWindow = computed(() => kickoff.value.arrivalWindow || "Arrival window pending");
const crewLead = computed(() => kickoff.value.crewLead || "Crew lead TBD");
const crewLeadPhone = computed(() => kickoff.value.crewLeadPhone || "(000) 000-0000");

const formatDate = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

const jobTitle = computed(() => job.value?.approved_option || "Project");
const startDate = computed(() => formatDate(job.value?.scheduled_start) || "Not scheduled");
const endDate = computed(() => formatDate(job.value?.scheduled_end) || "Not scheduled");
const approvedPrice = computed(() => formatCurrency(job.value?.approved_price) || "Pending");
const deposit = computed(() => formatCurrency(job.value?.deposit_amount) || "Pending");
const clientLabel = computed(() => job.value?.client_id || "Client");
const jobIdLabel = computed(() => jobId.value || "Job");

const fetchJob = async (id: string) => {
  if (props.job && props.job.id === id) return;

  loading.value = true;
  error.value = false;

  try {
    const response = await fetch(`/api/jobs/${id}`);
    if (!response.ok) {
      throw new Error("Failed to load job");
    }

    const json = await response.json();
    if (!json?.job) {
      throw new Error("Job not found");
    }

    job.value = json.job as Job;
    ensureKickoffEntry();
    seedKickoffDefaults();
    if (!kickoff.value.packetViewedAt) {
      markViewed();
    }
  } catch (err) {
    console.error("Error fetching job", err);
    error.value = true;
    job.value = props.job ?? null;
  } finally {
    loading.value = false;
  }
};

const seedKickoffDefaults = () => {
  const entry = ensureKickoffEntry();
  if (!entry?.kickoff) return;

  if (!entry.kickoff.arrivalWindow) entry.kickoff.arrivalWindow = "8:00-10:00 AM";
  if (!entry.kickoff.weatherPolicy) entry.kickoff.weatherPolicy = "If weather disrupts work, we reschedule ASAP. No extra charge.";
  if (!entry.kickoff.safety) entry.kickoff.safety = "Crew wears protective gear. Please keep pets/kids clear.";
};

const handleConfirmReady = () => {
  const id = jobId.value;
  if (!id) return;

  ensureKickoffEntry();
  hqStore.markKickoffClientConfirmed(id);
  hqStore.addTimelineEvent(id, "KICKOFF_CLIENT_CONFIRMED");
  hqStore.addHQAlert("Client confirmed kickoff.");
  router.push({ path: "/prototype/client/kickoff/confirm", query: { job: id } });
};

const openAccessForm = () => {
  const id = jobId.value;
  if (!id) return;

  router.push({ path: "/prototype/client/kickoff/access", query: { job: id, job_id: id } });
};

const handleDownload = () => {
  alert("Prototype: PDF download coming soon.");
};

const markViewed = () => {
  const id = jobId.value;
  if (!id || viewedAlready.value) return;

  ensureKickoffEntry();
  viewedAlready.value = true;
  hqStore.markKickoffPacketViewed(id);
  hqStore.addTimelineEvent(id, "KICKOFF_PACKET_VIEWED");
  hqStore.addHQAlert("Client viewed the kickoff packet.");
};

watch(
  jobId,
  (id) => {
    if (props.job) {
      if (id) {
        ensureKickoffEntry();
        seedKickoffDefaults();
        if (!kickoff.value.packetViewedAt) {
          markViewed();
        }
      }
      return;
    }
    if (!id) {
      error.value = true;
      job.value = null;
      return;
    }
    fetchJob(id);
  },
  { immediate: true }
);

watch(
  () => props.job,
  (val) => {
    if (val) {
      job.value = val;
      loading.value = false;
      error.value = false;
      ensureKickoffEntry();
      seedKickoffDefaults();
    }
  },
  { immediate: true }
);

watch(
  () => job.value?.id,
  (id) => {
    if (id) {
      ensureKickoffEntry();
      seedKickoffDefaults();
      if (!kickoff.value.packetViewedAt) {
        markViewed();
      }
    }
  }
);

const messageOpen = computed(() => route.query.msg === "open");
const closeMessage = () => {
  const query = { ...route.query };
  delete query.msg;
  router.replace({ query });
};
</script>

<template>
  <main class="min-h-screen bg-slate-100 text-slate-900">
    <div class="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
      <div
        v-if="loading"
        class="lg:col-span-2 flex min-h-[60vh] flex-col items-center justify-center gap-3 text-slate-600"
      >
        <svg class="h-8 w-8 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z"
          />
        </svg>
        <p class="text-sm font-medium">Loading kickoff packet...</p>
      </div>

      <div
        v-else-if="error"
        class="lg:col-span-2 flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center"
      >
        <div class="space-y-1">
          <p class="text-lg font-semibold text-slate-900">We could not load that packet.</p>
          <p class="text-sm text-slate-500">Check the link or try again.</p>
        </div>
        <div class="flex flex-wrap justify-center gap-3">
          <button
            class="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            @click="jobId && fetchJob(jobId)"
          >
            Try again
          </button>
          <button
            class="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-slate-800"
            @click="router.push('/prototype/hq')"
          >
            Back to HQ
          </button>
        </div>
      </div>

      <template v-else-if="job">
        <aside class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Kickoff Packet</p>
          <div class="mt-4 space-y-3 border-l-2 border-slate-200 pl-4">
            <div
              v-for="step in steps"
              :key="step.id"
              class="rounded-xl bg-white px-3 py-2 shadow-inner"
            >
              <p class="text-sm font-semibold text-slate-900">{{ step.title }}</p>
              <p class="text-xs text-slate-500">{{ step.subtitle }}</p>
            </div>
          </div>
          <div class="mt-6 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-inner">
            Tesla-style minimalism, with calm neutrals and clean edges.
          </div>
        </aside>

        <section class="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
          <div class="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100"></div>
          <div class="relative flex flex-col gap-6 p-6 sm:p-8">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Client Kickoff Packet</p>
                <h1 class="text-2xl font-semibold text-slate-900">{{ jobTitle }}</h1>
                <p class="text-sm text-slate-600">Everything you need before day one.</p>
                <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <span class="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-800">Job ID: {{ jobIdLabel }}</span>
                  <span class="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-800">Client: {{ clientLabel }}</span>
                  <span class="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-800">Option: {{ job.approved_option || "Option" }}</span>
                </div>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-right shadow-sm backdrop-blur">
                <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Contractor</p>
                <p class="text-sm font-semibold text-slate-900">Kaufmann Construction</p>
                <p class="text-xs text-slate-500">hello@kaufmann.build</p>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-3">
              <span class="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md">
                Crew arrival: {{ arrivalWindow }}
              </span>
              <span
                class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
                :class="kickoff.packetSentAt ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-700'"
              >
                {{ kickoff.packetSentAt ? "Packet sent" : "Packet not sent" }}
              </span>
              <span
                v-if="kickoff.packetViewedAt"
                class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
              >
                Viewed by client
              </span>
            </div>

            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div class="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-inner">
                <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Start date</p>
                <p class="mt-1 text-base font-semibold text-slate-900">{{ startDate }}</p>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-inner">
                <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">End date</p>
                <p class="mt-1 text-base font-semibold text-slate-900">{{ endDate }}</p>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-inner">
                <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Project value</p>
                <p class="mt-1 text-base font-semibold text-slate-900">{{ approvedPrice }}</p>
                <p class="text-xs text-slate-600">Deposit {{ deposit }}</p>
              </div>
            </div>

            <div class="grid gap-4 lg:grid-cols-2">
              <div class="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-inner">
                <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Crew lead</p>
                <p class="mt-1 text-lg font-semibold text-slate-900">{{ crewLead }}</p>
                <p class="text-sm text-slate-600">{{ crewLeadPhone }}</p>
                <p class="mt-3 text-xs text-slate-500">Your lead will text before arriving.</p>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-inner">
                <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Weather & Safety</p>
                <p class="mt-1 text-sm font-semibold text-slate-900">Safety reminders</p>
                <p class="text-sm text-slate-700">{{ kickoff.safety || "We follow standard PPE and site safety practices." }}</p>
                <p class="mt-3 text-sm font-semibold text-slate-900">Weather policy</p>
                <p class="text-sm text-slate-700">{{ kickoff.weatherPolicy || "If weather disrupts work, we reschedule ASAP. No extra charge." }}</p>
              </div>
            </div>

            <div class="grid gap-4 lg:grid-cols-3">
              <div class="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-inner">
                <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Access instructions</p>
                <p class="mt-1 text-sm text-slate-800">{{ kickoff.accessInstructions || "Add gate codes, pets, or parking notes." }}</p>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-inner">
                <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Material drop</p>
                <p class="mt-1 text-sm text-slate-800">{{ kickoff.materialDrop || "Tell us where to stage materials." }}</p>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-inner">
                <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Day one expectations</p>
                <p class="mt-1 text-sm text-slate-800">{{ kickoff.dayOneExpectations || "Crew walkthrough, layout confirmation, dust control plan." }}</p>
              </div>
            </div>

            <div class="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-inner">
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Pre-construction notes</p>
              <p class="mt-1 text-sm text-slate-800">{{ kickoff.preconstructionNotes || "Mark utilities, clear pathways, and share any concerns." }}</p>
            </div>

            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
                  @click="handleDownload"
                >
                  Download PDF (prototype)
                </button>
                <button
                  type="button"
                  class="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  @click="handleConfirmReady"
                >
                  I'm ready for kickoff
                </button>
                <button
                  type="button"
                  class="inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-100"
                  @click="openAccessForm"
                >
                  Submit Access Info
                </button>
              </div>
              <button
                type="button"
                class="text-xs font-semibold text-blue-600 underline-offset-4 hover:underline"
                @click="router.push({ query: { ...route.query, msg: 'open' } })"
              >
                Message contractor
              </button>
            </div>
          </div>
        </section>
      </template>

      <div
        v-else
        class="lg:col-span-2 flex min-h-[60vh] items-center justify-center text-sm text-slate-500"
      >
        No job selected.
      </div>
    </div>

    <MessageLightbox :open="messageOpen" :job-id="job?.id || jobId" actor="client" @close="closeMessage" />
  </main>
</template>
