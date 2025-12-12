<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/vue/24/outline";

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

const route = useRoute();
const router = useRouter();

const job = ref<Job | null>(null);
const loading = ref(false);
const error = ref(false);
const requestModalOpen = ref(false);

const normalizeParam = (value: unknown): string => {
  if (Array.isArray(value)) return value[0] ?? "";
  return typeof value === "string" ? value : "";
};

const jobId = computed(() => {
  return (
    normalizeParam(route.query.job_id) ||
    normalizeParam(route.params.id as string | string[] | undefined) ||
    normalizeParam(route.query.job)
  );
});

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

const scheduledStart = computed(() => formatDate(job.value?.scheduled_start));
const scheduledEnd = computed(() => formatDate(job.value?.scheduled_end));
const hasSchedule = computed(() => Boolean(job.value?.scheduled_start || job.value?.scheduled_end));

const fetchJob = async (id: string) => {
  loading.value = true;
  error.value = false;
  job.value = null;

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
  } catch (err) {
    console.error("Error fetching job", err);
    error.value = true;
    job.value = null;
  } finally {
    loading.value = false;
  }
};

watch(
  jobId,
  (id) => {
    if (!id) {
      error.value = true;
      job.value = null;
      return;
    }
    fetchJob(id);
  },
  { immediate: true }
);

const handleConfirm = () => {
  if (!jobId.value) return;
  router.push({
    path: "/prototype/client/schedule/confirmed",
    query: { job_id: jobId.value },
  });
};

const handleRequestChange = () => {
  requestModalOpen.value = true;
};

const closeRequestModal = () => {
  requestModalOpen.value = false;
};
</script>

<template>
  <main class="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
    <div class="mx-auto max-w-3xl">
      <!-- LOADING -->
      <div v-if="loading" class="space-y-4">
        <div class="h-6 w-52 rounded bg-slate-200"></div>
        <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="h-6 w-2/3 rounded bg-slate-100 animate-pulse"></div>
          <div class="mt-4 grid gap-4 sm:grid-cols-2">
            <div class="h-24 rounded-xl bg-slate-100 animate-pulse"></div>
            <div class="h-24 rounded-xl bg-slate-100 animate-pulse"></div>
          </div>
          <div class="mt-4 h-20 rounded-xl bg-slate-100 animate-pulse"></div>
          <div class="mt-6 h-12 rounded-full bg-slate-100 animate-pulse"></div>
          <div class="mt-3 h-12 rounded-full bg-slate-100 animate-pulse"></div>
        </div>
      </div>

      <!-- ERROR -->
      <div
        v-else-if="error"
        class="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center"
      >
        <div class="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <ExclamationTriangleIcon class="h-6 w-6" />
        </div>
        <div class="space-y-1">
          <p class="text-lg font-semibold text-slate-900">We could not load your schedule.</p>
          <p class="text-sm text-slate-500">Check your link or try refreshing the page.</p>
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
            @click="router.push('/prototype/client-portal')"
          >
            Back to project
          </button>
        </div>
      </div>

      <!-- SUCCESS -->
      <div v-else-if="job" class="space-y-3">
        <div class="rounded-3xl border border-slate-200 bg-white px-6 py-7 shadow-xl">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="space-y-1">
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Scheduling</p>
              <h1 class="text-2xl font-semibold text-slate-900">Review your proposed dates</h1>
              <p class="text-sm text-slate-600">Confirm to lock them in or request a different time.</p>
            </div>
            <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 shadow-inner">
              Job: {{ job.id }}
            </span>
          </div>

          <div class="mt-6 grid gap-4 sm:grid-cols-2">
            <div class="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div class="rounded-xl bg-white p-3 shadow-inner">
                <CalendarDaysIcon class="h-6 w-6 text-slate-800" />
              </div>
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Start date</p>
                <p class="text-lg font-semibold text-slate-900">
                  {{ scheduledStart || "Not scheduled yet" }}
                </p>
                <p v-if="!scheduledStart" class="text-xs text-slate-500">
                  Your contractor will add a start date.
                </p>
              </div>
            </div>

            <div class="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div class="rounded-xl bg-white p-3 shadow-inner">
                <CalendarDaysIcon class="h-6 w-6 text-slate-800" />
              </div>
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">End date</p>
                <p class="text-lg font-semibold text-slate-900">
                  {{ scheduledEnd || "Not provided" }}
                </p>
                <p v-if="!scheduledEnd" class="text-xs text-slate-500">
                  Timeline may adjust once work begins.
                </p>
              </div>
            </div>
          </div>

          <div class="mt-5 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 sm:grid-cols-2">
            <div class="space-y-1">
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Approved option</p>
              <p class="text-sm font-semibold text-slate-900">{{ job.approved_option || "Option" }}</p>
            </div>
            <div class="space-y-1">
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Deposit</p>
              <p class="text-sm font-semibold text-slate-900">
                {{ formatCurrency(job.deposit_amount) || "Pending" }}
              </p>
              <p class="text-xs text-slate-500">Due once you confirm your schedule.</p>
            </div>
          </div>

          <div
            class="mt-4 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3"
          >
            <div class="rounded-full bg-white p-2 shadow-inner">
              <InformationCircleIcon class="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-900">Contractor-proposed schedule</p>
              <p class="text-sm text-slate-600">
                Confirm if these dates work for you. If you need a change, we will notify your contractor to suggest alternatives.
              </p>
            </div>
          </div>

          <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              class="w-full rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-[1px] hover:bg-slate-50 sm:w-auto"
              @click="handleRequestChange"
            >
              Request change
            </button>
            <button
              type="button"
              class="w-full rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:-translate-y-[1px] hover:bg-emerald-700 disabled:opacity-60 sm:w-auto"
              :disabled="!hasSchedule"
              @click="handleConfirm"
            >
              Confirm dates
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- REQUEST CHANGE MODAL -->
    <div
      v-if="requestModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm"
    >
      <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircleIcon class="h-6 w-6" />
        </div>
        <h3 class="mt-4 text-center text-lg font-semibold text-slate-900">Request sent</h3>
        <p class="mt-1 text-center text-sm text-slate-600">
          Your request has been sent. (Prototype only.)
        </p>
        <div class="mt-6 space-y-2">
          <button
            class="w-full rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-slate-800"
            @click="closeRequestModal"
          >
            Got it
          </button>
          <button
            class="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            @click="closeRequestModal"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
