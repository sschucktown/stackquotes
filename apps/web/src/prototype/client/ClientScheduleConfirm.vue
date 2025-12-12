<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { CalendarDaysIcon, CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/vue/24/outline";

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

const startDate = computed(() => formatDate(job.value?.scheduled_start));
const endDate = computed(() => formatDate(job.value?.scheduled_end));

const statusLabel = computed(() => {
  const status = job.value?.status || "pending";
  if (status === "in_progress") return "In Progress";
  return status.charAt(0).toUpperCase() + status.slice(1);
});

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
</script>

<template>
  <main class="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
    <div class="mx-auto max-w-xl">
      <!-- LOADING -->
      <div v-if="loading" class="space-y-4">
        <div class="h-6 w-56 rounded bg-slate-200"></div>
        <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="h-14 w-14 rounded-full bg-slate-100 animate-pulse"></div>
          <div class="mt-4 h-6 w-3/4 rounded bg-slate-100 animate-pulse"></div>
          <div class="mt-2 h-4 w-2/3 rounded bg-slate-100 animate-pulse"></div>
          <div class="mt-6 grid gap-3 sm:grid-cols-2">
            <div class="h-20 rounded-xl bg-slate-100 animate-pulse"></div>
            <div class="h-20 rounded-xl bg-slate-100 animate-pulse"></div>
          </div>
          <div class="mt-4 h-16 rounded-xl bg-slate-100 animate-pulse"></div>
          <div class="mt-6 h-10 rounded-full bg-slate-100 animate-pulse"></div>
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
          <p class="text-lg font-semibold text-slate-900">We could not find that job.</p>
          <p class="text-sm text-slate-500">Double-check the link or try loading it again.</p>
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
            @click="router.push('/prototype/client/schedule')"
          >
            Back to schedule
          </button>
        </div>
      </div>

      <!-- SUCCESS -->
      <div v-else-if="job" class="rounded-3xl border border-slate-200 bg-white px-6 py-8 text-center shadow-xl">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircleIcon class="h-9 w-9" />
        </div>
        <h1 class="mt-4 text-2xl font-semibold text-slate-900">Your schedule is confirmed</h1>
        <p class="mt-1 text-sm text-slate-600">
          We locked in your start date. Your contractor will keep you posted if anything changes.
        </p>

        <div class="mt-6 grid gap-3 text-left sm:grid-cols-2">
          <div class="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div class="rounded-xl bg-white p-3 shadow-inner">
              <CalendarDaysIcon class="h-6 w-6 text-slate-800" />
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Start date</p>
              <p class="text-base font-semibold text-slate-900">{{ startDate || "Not provided" }}</p>
            </div>
          </div>

          <div class="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div class="rounded-xl bg-white p-3 shadow-inner">
              <CalendarDaysIcon class="h-6 w-6 text-slate-800" />
            </div>
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">End date</p>
              <p class="text-base font-semibold text-slate-900">{{ endDate || "Not provided" }}</p>
            </div>
          </div>
        </div>

        <div class="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-left">
          <div class="flex items-center justify-between">
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Status</p>
            <span class="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
              {{ statusLabel }}
            </span>
          </div>
          <div class="mt-3 grid gap-3 sm:grid-cols-2">
            <div class="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p class="text-xs uppercase tracking-[0.08em] text-slate-500">Deposit</p>
              <p class="text-sm font-semibold text-slate-900">
                {{ formatCurrency(job.deposit_amount) || "Pending" }}
              </p>
            </div>
            <div class="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <p class="text-xs uppercase tracking-[0.08em] text-slate-500">Project total</p>
              <p class="text-sm font-semibold text-slate-900">{{ formatCurrency(job.approved_price) }}</p>
            </div>
          </div>
        </div>

        <div class="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left shadow-sm">
          <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Next steps</p>
          <ul class="mt-3 space-y-2 text-sm text-slate-700">
            <li class="flex items-start gap-2">
              <span class="mt-[6px] h-2 w-2 rounded-full bg-emerald-600"></span>
              <span>Watch for a kickoff message from your contractor.</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-[6px] h-2 w-2 rounded-full bg-emerald-600"></span>
              <span>Confirm site access and logistics before the start date.</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="mt-[6px] h-2 w-2 rounded-full bg-emerald-600"></span>
              <span>Track progress in your project portal.</span>
            </li>
          </ul>
        </div>

        <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          <button
            class="w-full rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-slate-800 sm:w-auto"
            @click="router.push('/prototype/client-portal')"
          >
            View project details
          </button>
          <button
            class="w-full rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 sm:w-auto"
            @click="router.push('/prototype/client/schedule')"
          >
            Back to schedule
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
