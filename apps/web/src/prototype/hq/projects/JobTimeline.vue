<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useContractorHQPrototype } from "@/stores/contractorHQPrototype";

type JobStatus = "pending" | "scheduled" | "ready" | "in_progress" | "complete" | string;

type Job = {
  id: string;
  status: JobStatus;
  created_at?: string | null;
  approved_at?: string | null;
  scheduled_at?: string | null;
  scheduled_start?: string | null;
  approved_option?: string | null;
};

type TimelineEvent = {
  id: string;
  ts: string; // ISO timestamp
  type:
    | "JOB_CREATED"
    | "PROPOSAL_APPROVED"
    | "JOB_SCHEDULED"
    | "KICKOFF_PACKET_SENT"
    | "KICKOFF_PACKET_VIEWED"
    | "KICKOFF_CLIENT_CONFIRMED"
    | "CLIENT_SUBMITTED_ACCESS"
    | "PAYMENT_LINK_SENT"
    | "PAYMENT_RECEIVED"
    | "STATUS_CHANGED";
  title: string;
  description?: string;
  actor?: "system" | "contractor" | "client";
};

const route = useRoute();
const router = useRouter();
const hqStore = useContractorHQPrototype();

const job = ref<Job | null>(null);
const loading = ref(true);
const error = ref(false);
const events = ref<TimelineEvent[]>([]);
const actorFilter = ref<"all" | "system" | "contractor" | "client">("all");

const pickQueryValue = (value: unknown) => (Array.isArray(value) ? value[0] : value);

const jobId = computed(
  () =>
    (pickQueryValue(route.query.job) as string | undefined) ||
    (pickQueryValue(route.query.job_id) as string | undefined) ||
    (pickQueryValue(route.query.id) as string | undefined) ||
    (route.params.id as string | undefined) ||
    ""
);

const shortJobId = computed(() => (job.value?.id ? job.value.id.slice(0, 8) : ""));

const statusLabel = computed(() => {
  const status = job.value?.status;
  if (!status) return "Unknown";
  if (status === "in_progress") return "In Progress";
  return status.charAt(0).toUpperCase() + status.slice(1);
});

const statusPillClass = computed(() => {
  const status = job.value?.status;
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "scheduled":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "ready":
    case "in_progress":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "complete":
      return "bg-slate-200 text-slate-700 border-slate-300";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
});

const actorBadgeClass: Record<NonNullable<TimelineEvent["actor"]>, string> = {
  system: "border-slate-200 bg-slate-50 text-slate-700",
  contractor: "border-blue-200 bg-blue-50 text-blue-700",
  client: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const dotClassByActor: Record<NonNullable<TimelineEvent["actor"]>, string> = {
  system: "bg-slate-400",
  contractor: "bg-blue-500",
  client: "bg-emerald-500",
};

const ensureISO = (value?: string | null): string | null => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
};

const formatTimestamp = (ts: string) => {
  const parsed = new Date(ts);
  if (Number.isNaN(parsed.getTime())) return "Recently";
  return parsed.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatDate = (value?: string | null) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const buildTimeline = (jobData: Job) => {
  const list: TimelineEvent[] = [];
  const fallbackTs = () => new Date().toISOString();
  const addEvent = (event: Omit<TimelineEvent, "id" | "ts"> & { ts?: string | null; id?: string }) => {
    const ts = event.ts && ensureISO(event.ts) ? ensureISO(event.ts)! : fallbackTs();
    const id = event.id ?? `${event.type}-${ts}`;
    list.push({ ...event, ts, id });
  };

  if (jobData.created_at) {
    addEvent({
      type: "JOB_CREATED",
      ts: ensureISO(jobData.created_at),
      title: "Job created",
      description: "Project created in StackQuotes",
      actor: "system",
    });
  }

  if (jobData.approved_at) {
    addEvent({
      type: "PROPOSAL_APPROVED",
      ts: ensureISO(jobData.approved_at),
      title: "Proposal approved",
      description: jobData.approved_option
        ? `Client approved ${jobData.approved_option}`
        : "Client approved the proposal",
      actor: "client",
    });
  }

  const scheduledTs = ensureISO(jobData.scheduled_at ?? jobData.scheduled_start);
  if (scheduledTs) {
    addEvent({
      type: "JOB_SCHEDULED",
      ts: scheduledTs,
      title: "Job scheduled",
      description: jobData.scheduled_start ? `Start date: ${formatDate(jobData.scheduled_start)}` : undefined,
      actor: "contractor",
    });
  }

  const kickoff = hqStore.jobs.find((j) => j.id === jobId.value)?.kickoff;
  if (kickoff) {
    if (kickoff.packetSentAt) {
      addEvent({
        type: "KICKOFF_PACKET_SENT",
        ts: ensureISO(kickoff.packetSentAt),
        title: "Kickoff packet sent",
        description: "Packet shared with client",
        actor: "contractor",
      });
    }
    if (kickoff.packetViewedAt) {
      addEvent({
        type: "KICKOFF_PACKET_VIEWED",
        ts: ensureISO(kickoff.packetViewedAt),
        title: "Kickoff packet viewed",
        description: "Client opened the kickoff packet",
        actor: "client",
      });
    }
    if (kickoff.clientConfirmed) {
      addEvent({
        type: "KICKOFF_CLIENT_CONFIRMED",
        ts: ensureISO(kickoff.packetViewedAt) ?? fallbackTs(),
        title: "Kickoff confirmed",
        description: "Client confirmed the kickoff details",
        actor: "client",
      });
    }
    if (kickoff.clientSubmittedAccess) {
      addEvent({
        type: "CLIENT_SUBMITTED_ACCESS",
        ts: ensureISO(kickoff.packetViewedAt) ?? fallbackTs(),
        title: "Access details submitted",
        description: "Client provided site access instructions",
        actor: "client",
      });
    }
  }

  const deduped = new Map<string, TimelineEvent>();
  list.forEach((event) => {
    const key = `${event.type}-${event.ts}`;
    if (!deduped.has(key)) deduped.set(key, event);
  });

  events.value = Array.from(deduped.values()).sort(
    (a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime()
  );
};

const fetchJob = async () => {
  loading.value = true;
  error.value = false;

  if (!jobId.value) {
    error.value = true;
    loading.value = false;
    return;
  }

  try {
    const response = await fetch(`/api/jobs/${jobId.value}`);
    if (!response.ok) throw new Error("Failed to fetch job");

    const json = await response.json();
    job.value = json.job as Job;
    buildTimeline(json.job as Job);
  } catch (err) {
    console.error("Failed to load job timeline", err);
    job.value = null;
    events.value = [];
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const filteredEvents = computed(() => {
  if (actorFilter.value === "all") return events.value;
  return events.value.filter((event) => event.actor === actorFilter.value);
});

const goBack = () => {
  router.push({ path: "/prototype/hq/projects/job", query: { job: jobId.value } });
};

watch(jobId, () => {
  fetchJob();
});

onMounted(fetchJob);
</script>

<template>
  <main class="min-h-screen bg-slate-50 text-slate-900">
    <div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header class="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div class="space-y-2">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
              @click="goBack"
            >
              <span class="text-lg leading-none">&larr;</span>
              <span>Back</span>
            </button>
            <div>
              <h1 class="text-2xl font-semibold text-slate-900">Timeline</h1>
              <p class="text-sm text-slate-600">Project history & client actions</p>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <span
              v-if="shortJobId"
              class="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 shadow-inner"
            >
              Job {{ shortJobId }}
            </span>
            <span
              class="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold shadow-inner"
              :class="statusPillClass"
            >
              {{ statusLabel }}
            </span>
          </div>
        </div>
      </header>

      <section class="mb-4 flex flex-wrap items-center gap-2">
        <button
          v-for="option in ['all', 'system', 'contractor', 'client']"
          :key="option"
          type="button"
          class="inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition"
          :class="actorFilter === option
            ? 'border-slate-900 bg-slate-900 text-white shadow'
            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'"
          @click="actorFilter = option as any"
        >
          {{ option === "all" ? "All" : option.charAt(0).toUpperCase() + option.slice(1) }}
        </button>
      </section>

      <section class="relative">
        <div
          v-if="loading"
          class="space-y-3"
        >
          <div v-for="idx in 3" :key="idx" class="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div class="mb-2 h-4 w-1/3 rounded bg-slate-200"></div>
            <div class="h-3 w-1/4 rounded bg-slate-200"></div>
            <div class="mt-3 h-3 w-2/3 rounded bg-slate-100"></div>
          </div>
        </div>

        <div
          v-else-if="error"
          class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
        >
          <p class="text-sm font-semibold text-slate-900">Could not load this timeline.</p>
          <p class="text-xs text-slate-600">Check the job ID or try again.</p>
          <div class="flex gap-2">
            <button
              type="button"
              class="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
              @click="fetchJob"
            >
              Retry
            </button>
            <button
              type="button"
              class="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow transition hover:bg-slate-800"
              @click="goBack"
            >
              Back to job
            </button>
          </div>
        </div>

        <div
          v-else-if="filteredEvents.length === 0"
          class="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
        >
          <p class="text-sm font-semibold text-slate-900">No events yet</p>
          <p class="text-xs text-slate-600">Project history will appear here as activity happens.</p>
        </div>

        <div v-else class="relative pl-6">
          <div class="absolute left-2 top-0 bottom-0 w-px bg-slate-200"></div>
          <div
            v-for="event in filteredEvents"
            :key="event.id"
            class="relative mb-6 last:mb-0"
          >
            <span
              class="absolute -left-[6px] top-4 h-3 w-3 rounded-full shadow-sm ring-4 ring-white"
              :class="dotClassByActor[event.actor || 'system']"
            ></span>
            <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
              <div class="flex items-start justify-between gap-3">
                <div class="space-y-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="text-sm font-semibold text-slate-900">{{ event.title }}</p>
                    <span
                      v-if="event.actor"
                      class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold"
                      :class="actorBadgeClass[event.actor]"
                    >
                      {{ event.actor === "system" ? "System" : event.actor === "contractor" ? "Contractor" : "Client" }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-500">{{ formatTimestamp(event.ts) }}</p>
                </div>
                <span class="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600">
                  {{ event.type.replaceAll("_", " ") }}
                </span>
              </div>
              <p v-if="event.description" class="mt-3 text-sm text-slate-700">
                {{ event.description }}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>
