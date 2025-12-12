<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { supabase } from "@/lib/supabase";

type JobStatus = "pending" | "scheduled" | "ready" | "in_progress" | "active" | "complete" | "completed";

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
  approved_at?: string | null;
  created_at: string;
  updated_at?: string | null;
};

type JobGroupKey = "pending" | "scheduled" | "active" | "completed";
type PrimaryFilter = "all" | JobGroupKey;
type SecondaryFilterKey = "highValue" | "needsScheduling" | "recentlyUpdated";

const router = useRouter();

const jobs = ref<Job[]>([]);
const loading = ref(true);
const error = ref(false);

const primaryFilter = ref<PrimaryFilter>("all");
const secondaryFilters = ref<Record<SecondaryFilterKey, boolean>>({
  highValue: false,
  needsScheduling: false,
  recentlyUpdated: false,
});

const groupOrder: JobGroupKey[] = ["pending", "scheduled", "active", "completed"];

const groupLabels: Record<JobGroupKey, { title: string; blurb: string }> = {
  pending: { title: "Pending", blurb: "Approved but not scheduled yet." },
  scheduled: { title: "Scheduled", blurb: "Start date is on the calendar." },
  active: { title: "Active", blurb: "On-site or in progress." },
  completed: { title: "Completed", blurb: "Wrapped up and ready to archive." },
};

const primaryFilterOptions: { key: PrimaryFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "scheduled", label: "Scheduled" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
];

const secondaryFilterOptions: { key: SecondaryFilterKey; label: string }[] = [
  { key: "highValue", label: "High Value ($10k+)" },
  { key: "needsScheduling", label: "Needs Scheduling" },
  { key: "recentlyUpdated", label: "Recently Updated" },
];

const skeletonPlaceholders = Array.from({ length: 4 });

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "";
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
};

const formatDate = (iso?: string | null) => {
  if (!iso) return "";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const parseDate = (value?: string | null) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const deriveGroup = (job: Job): JobGroupKey => {
  const status = job.status;
  if (status === "complete" || status === "completed") return "completed";
  if (status === "active" || status === "in_progress") return "active";

  const now = new Date();
  const start = parseDate(job.scheduled_start);
  const end = parseDate(job.scheduled_end);

  if (start) {
    if (now >= start && (!end || now <= end)) return "active";
    if (start > now) return "scheduled";
  }

  if (status === "scheduled") return "scheduled";

  return "pending";
};

function groupJobs(list: Job[]): Record<JobGroupKey, Job[]> {
  const grouped: Record<JobGroupKey, Job[]> = {
    pending: [],
    scheduled: [],
    active: [],
    completed: [],
  };

  list.forEach((job) => {
    grouped[deriveGroup(job)].push(job);
  });

  return grouped;
}

const isHighValue = (job: Job) => Number(job.approved_price ?? 0) >= 10000;
const needsScheduling = (job: Job) => !job.scheduled_start;
const isRecentlyUpdated = (job: Job) => {
  const stamp = parseDate(job.updated_at ?? job.approved_at ?? job.created_at);
  if (!stamp) return false;
  const days = (Date.now() - stamp.getTime()) / (1000 * 60 * 60 * 24);
  return days <= 14;
};

const filteredJobs = computed(() => {
  let list = [...jobs.value];

  if (primaryFilter.value !== "all") {
    list = list.filter((job) => deriveGroup(job) === primaryFilter.value);
  }

  if (secondaryFilters.value.highValue) {
    list = list.filter(isHighValue);
  }
  if (secondaryFilters.value.needsScheduling) {
    list = list.filter(needsScheduling);
  }
  if (secondaryFilters.value.recentlyUpdated) {
    list = list.filter(isRecentlyUpdated);
  }

  return list;
});

const grouped = computed(() => {
  const bucketed = groupJobs(filteredJobs.value);
  return groupOrder.map((key) => ({
    key,
    title: groupLabels[key].title,
    blurb: groupLabels[key].blurb,
    rows: bucketed[key],
  }));
});

const hasAnyResults = computed(() => grouped.value.some((group) => group.rows.length > 0));

const statusClasses = (job: Job) => {
  switch (deriveGroup(job)) {
    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "scheduled":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "active":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "completed":
      return "border-slate-200 bg-slate-100 text-slate-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
};

const statusLabel = (job: Job) => {
  const group = deriveGroup(job);
  return group.charAt(0).toUpperCase() + group.slice(1);
};

const displayStartDate = (job: Job) => (job.scheduled_start ? formatDate(job.scheduled_start) : "Not scheduled");
const displayEndDate = (job: Job) => (job.scheduled_end ? formatDate(job.scheduled_end) : "Not scheduled");

const getToken = async (): Promise<string | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
};

const fetchJobs = async () => {
  loading.value = true;
  error.value = false;

  try {
    const token = await getToken();
    if (!token) {
      throw new Error("No active session");
    }

    const response = await fetch("/api/jobs", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Failed to load jobs");
    }

    const json = await response.json();
    jobs.value = Array.isArray(json?.jobs) ? json.jobs : [];
  } catch (err) {
    console.error("Error fetching jobs", err);
    error.value = true;
    jobs.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(fetchJobs);

const togglePrimaryFilter = (key: PrimaryFilter) => {
  primaryFilter.value = key;
};

const toggleSecondaryFilter = (key: SecondaryFilterKey) => {
  secondaryFilters.value[key] = !secondaryFilters.value[key];
};

const handleCTA = (job: Job) => {
  router.push({
    path: "/prototype/hq/job-view",
    query: { id: job.id },
  });
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
          <p class="text-sm text-slate-600">Live jobs pulled from Supabase — grouped by workflow.</p>
        </div>
        <span class="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          Prototype Only
        </span>
      </header>

      <section class="mt-6 space-y-3">
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="option in primaryFilterOptions"
            :key="option.key"
            type="button"
            class="inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition"
            :class="primaryFilter === option.key ? 'border-slate-900 bg-slate-900 text-white shadow' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'"
            @click="togglePrimaryFilter(option.key)"
          >
            {{ option.label }}
          </button>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="option in secondaryFilterOptions"
            :key="option.key"
            type="button"
            class="inline-flex items-center rounded-full border px-3 py-1.5 text-[11px] font-semibold shadow-sm transition"
            :class="secondaryFilters[option.key] ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'"
            @click="toggleSecondaryFilter(option.key)"
          >
            {{ option.label }}
          </button>
        </div>
      </section>

      <div
        v-if="error"
        class="mt-8 flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-10 text-center shadow-sm"
      >
        <div class="space-y-1">
          <p class="text-lg font-semibold text-slate-900">Could not load your projects.</p>
          <p class="text-sm text-slate-600">Check your connection or try again.</p>
        </div>
        <div class="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            class="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            @click="fetchJobs"
          >
            Retry
          </button>
          <button
            type="button"
            class="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-slate-800"
            @click="router.push('/prototype/hq')"
          >
            Back to HQ
          </button>
        </div>
      </div>

      <div v-else class="mt-8 space-y-8">
        <div v-if="loading" class="space-y-4">
          <div
            v-for="(_, idx) in skeletonPlaceholders"
            :key="idx"
            class="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div class="flex items-center justify-between gap-3">
              <div class="h-4 w-32 rounded-full bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100"></div>
              <div class="h-6 w-24 rounded-full bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100"></div>
            </div>
            <div class="mt-3 grid gap-3 sm:grid-cols-3">
              <div class="h-12 rounded-xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100"></div>
              <div class="h-12 rounded-xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100"></div>
              <div class="h-12 rounded-xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100"></div>
            </div>
          </div>
        </div>

        <div v-else-if="!hasAnyResults" class="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-10 text-center shadow-sm">
          <p class="text-sm font-semibold text-slate-900">No projects match these filters.</p>
          <p class="mt-1 text-xs text-slate-500">Try switching back to All or clearing secondary chips.</p>
        </div>

        <section
          v-else
          v-for="section in grouped"
          :key="section.key"
          class="rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div class="flex flex-col gap-1 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p class="text-[11px] uppercase font-semibold tracking-[0.12em] text-slate-500">
                {{ section.title }}
              </p>
              <p class="text-xs text-slate-500">{{ section.blurb }}</p>
            </div>
            <span class="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-inner">
              {{ section.rows.length }} project{{ section.rows.length === 1 ? "" : "s" }}
            </span>
          </div>

          <div class="divide-y divide-slate-100">
            <div
              v-for="job in section.rows"
              :key="job.id"
              class="px-4 py-4 transition hover:bg-slate-50 sm:px-6"
            >
              <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div class="space-y-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="text-sm font-semibold text-slate-900">{{ job.approved_option || "Project" }}</p>
                    <span class="text-xs text-slate-500">ID: {{ job.id }}</span>
                  </div>
                  <p class="text-xs text-slate-600">
                    Client:
                    <span class="font-semibold text-slate-900">{{ job.client_id || "Client" }}</span>
                  </p>
                </div>

                <div class="flex flex-col items-start gap-2 sm:items-end">
                  <span
                    class="inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold shadow-inner"
                    :class="statusClasses(job)"
                  >
                    {{ statusLabel(job) }}
                  </span>
                  <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-right shadow-inner">
                    <p class="text-[11px] uppercase tracking-wide text-slate-500">Project value</p>
                    <p class="text-sm font-semibold text-slate-900">
                      {{ formatCurrency(job.approved_price) || "Pending" }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="mt-3 grid gap-3 sm:grid-cols-3">
                <div class="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 shadow-inner">
                  <p class="text-[11px] uppercase tracking-wide text-slate-500">Start date</p>
                  <p class="text-sm font-semibold text-slate-900">{{ displayStartDate(job) }}</p>
                </div>
                <div class="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 shadow-inner">
                  <p class="text-[11px] uppercase tracking-wide text-slate-500">End date</p>
                  <p class="text-sm font-semibold text-slate-900">{{ displayEndDate(job) }}</p>
                </div>
                <div class="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 shadow-inner">
                  <p class="text-[11px] uppercase tracking-wide text-slate-500">Created</p>
                  <p class="text-sm font-semibold text-slate-900">{{ formatDate(job.created_at) || "Pending" }}</p>
                </div>
              </div>

              <div class="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  class="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow transition hover:-translate-y-[1px] hover:bg-slate-800"
                  @click="handleCTA(job)"
                >
                  Open Job
                </button>
                <span
                  v-if="needsScheduling(job)"
                  class="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700 shadow-inner"
                >
                  Needs scheduling
                </span>
                <span
                  v-if="isHighValue(job)"
                  class="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 shadow-inner"
                >
                  High value
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>
