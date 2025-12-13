<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

      <!-- LOADING -->
      <div
        v-if="loading"
        class="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-slate-600"
      >
        <svg class="h-8 w-8 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z"
          />
        </svg>
        <p class="text-sm font-medium">Loading job...</p>
      </div>

      <!-- ERROR -->
      <div
        v-else-if="error"
        class="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center"
      >
        <div class="space-y-1">
          <p class="text-lg font-semibold text-slate-800">Could not load job.</p>
          <p class="text-sm text-slate-500">Please try again or head back to projects.</p>
        </div>
        <button
          class="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-slate-800"
          @click="router.push('/prototype/hq/projects')"
        >
          <span>&larr;</span>
          <span>Back to Projects</span>
        </button>
      </div>

      <!-- SUCCESS -->
      <div v-else-if="job" class="space-y-6">

        <!-- HEADER -->
        <section class="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div class="space-y-2">
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Job Overview</p>

              <div class="flex flex-wrap items-center gap-3">
                <h1 class="text-2xl font-semibold text-slate-900">Project</h1>

                <!-- STATUS BADGE -->
                <span
                  :class="statusBadgeClass"
                  class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold shadow-inner"
                >
                  {{ statusLabel }}
                </span>

                <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 shadow-inner">
                  ID: {{ job.id }}
                </span>

                <button
                  type="button"
                  class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
                  @click="goToTimeline"
                >
                  View Timeline
                  <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <p class="text-sm text-slate-600">
                Client:
                <span class="font-semibold text-slate-900">{{ job.client_id }}</span>
              </p>
            </div>

            <!-- PRICE + DEPOSIT -->
            <div class="flex flex-wrap items-center gap-3">
              <span class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 shadow-inner">
                Approved Option
                <span class="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-white">
                  {{ job.approved_option || "Option" }}
                </span>
              </span>

              <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-right shadow-inner">
                <p class="text-[11px] uppercase tracking-wide text-slate-500">Price</p>
                <p class="text-sm font-semibold text-slate-900">
                  {{ formatCurrency(job.approved_price) }}
                </p>
              </div>

              <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-right shadow-inner">
                <p class="text-[11px] uppercase tracking-wide text-slate-500">Deposit</p>
                <p class="text-sm font-semibold text-slate-900">
                  {{ formatCurrency(job.deposit_amount) }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- TIMELINE -->
        <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <h2 class="text-base font-semibold text-slate-900">Progress</h2>
              <p class="text-xs text-slate-500">Timeline</p>
            </div>

            <div class="flex flex-col gap-4">
              <div class="flex flex-wrap items-center gap-4">
                <template v-for="(step, index) in timelineSteps" :key="step.label">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold shadow-inner"
                      :class="step.active ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50 text-slate-500'"
                    >
                      <span
                        class="h-2 w-2 rounded-full"
                        :class="step.active ? 'bg-white' : 'bg-slate-400'"
                      ></span>
                    </div>

                    <div class="flex flex-col">
                      <span class="text-sm font-semibold text-slate-900">{{ step.label }}</span>
                      <span class="text-xs text-slate-500">{{ step.active ? "Active" : "Pending" }}</span>
                    </div>
                  </div>

                  <div
                    v-if="index < timelineSteps.length - 1"
                    class="hidden h-px flex-1 bg-gradient-to-r from-slate-200 via-slate-200 to-slate-200 sm:block"
                  ></div>
                </template>
              </div>
            </div>
          </div>
        </section>

        <!-- CTA -->
        <section v-if="primaryCtaLabel" class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Primary Action</p>
              <p class="text-sm text-slate-700">
                Guide the next step based on status: {{ statusLabel }}.
              </p>
            </div>

            <button
              class="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:translate-y-[-1px] hover:bg-slate-800"
              @click="handlePrimaryAction"
            >
              {{ primaryCtaLabel }}
              <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </section>

        <!-- PROJECT DETAILS -->
        <section class="grid gap-4 md:grid-cols-2">
          <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="mb-4 flex items-center justify-between">
              <h3 class="text-base font-semibold text-slate-900">Project Details</h3>
              <span class="text-xs text-slate-500">Summary</span>
            </div>

            <dl class="space-y-3">
              <div class="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <dt class="text-xs uppercase tracking-wide text-slate-500">Approved Option</dt>
                <dd class="text-sm font-semibold text-slate-900">{{ job.approved_option || "—" }}</dd>
              </div>

              <div class="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <dt class="text-xs uppercase tracking-wide text-slate-500">Price</dt>
                <dd class="text-sm font-semibold text-slate-900">{{ formatCurrency(job.approved_price) }}</dd>
              </div>

              <div class="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <dt class="text-xs uppercase tracking-wide text-slate-500">Deposit</dt>
                <dd class="text-sm font-semibold text-slate-900">{{ formatCurrency(job.deposit_amount) }}</dd>
              </div>

              <div class="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <dt class="text-xs uppercase tracking-wide text-slate-500">Proposal ID</dt>
                <dd class="text-sm font-semibold text-slate-900">{{ job.proposal_id }}</dd>
              </div>

              <div class="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <dt class="text-xs uppercase tracking-wide text-slate-500">Created</dt>
                <dd class="text-sm font-semibold text-slate-900">{{ formatDate(job.created_at) }}</dd>
              </div>
            </dl>
          </div>

          <!-- SCHEDULE -->
          <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div class="mb-4 flex items-center justify-between">
              <h3 class="text-base font-semibold text-slate-900">Schedule</h3>
              <span class="text-xs text-slate-500">{{ job.status === "scheduled" ? "Confirmed" : "Planning" }}</span>
            </div>

            <div
              v-if="!job.scheduled_start"
              class="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500"
            >
              No schedule yet
            </div>

            <div v-else class="space-y-3">
              <div class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p class="text-xs uppercase tracking-wide text-slate-500">Start Date</p>
                <p class="text-sm font-semibold text-slate-900">{{ formatDate(job.scheduled_start) }}</p>
              </div>

              <div class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p class="text-xs uppercase tracking-wide text-slate-500">End Date</p>
                <p class="text-sm font-semibold text-slate-900">{{ formatDate(job.scheduled_end) }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- SIGNATURE PANEL -->
        <section
          v-if="job.signature_image"
          class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 class="text-base font-semibold text-slate-900">Client Signature</h2>

          <div class="mt-4">
            <img
              :src="job.signature_image"
              alt="Client Signature"
              class="max-h-40 rounded-lg border border-slate-300 bg-white p-2 shadow-inner"
            />
          </div>

          <p class="mt-2 text-sm text-slate-500">
            Signed on: {{ formatDate(job.approved_at) }}
          </p>
        </section>

        <!-- PLACEHOLDERS -->
        <section class="grid gap-4 md:grid-cols-2">
          <details class="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <summary class="flex cursor-pointer items-center justify-between text-base font-semibold text-slate-900">
              Messages
              <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Coming soon</span>
            </summary>
          </details>

          <details class="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <summary class="flex cursor-pointer items-center justify-between text-base font-semibold text-slate-900">
              Files
              <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Coming soon</span>
            </summary>
          </details>
        </section>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

type JobStatus = "pending" | "scheduled" | "in_progress" | "ready" | "complete";

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
  created_at: string;

  /* NEW */
  signature_image: string | null;
  approved_at: string | null;
};

const route = useRoute();
const router = useRouter();

const job = ref<Job | null>(null);
const loading = ref(true);
const error = ref(false);

// Accepts both `/job-view?id=x` AND `/job-view/:id`
const getQueryValue = (key: string) => {
  const value = route.query[key];
  return Array.isArray(value) ? value[0] : (value as string | undefined);
};

const jobId = computed(
  () =>
    getQueryValue("job") ||
    getQueryValue("job_id") ||
    getQueryValue("id") ||
    (route.params.id as string | undefined) ||
    ""
);

/* -------------------------------
   STATUS BADGE
-------------------------------- */
const statusBadgeClass = computed(() => {
  const styles: Record<JobStatus, string> = {
    pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    scheduled: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    ready: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
    in_progress: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
    complete: "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
  };

  return job.value
    ? styles[job.value.status]
    : "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
});

const statusLabel = computed(() => {
  const status = job.value?.status || "pending";
  if (status === "in_progress") return "In Progress";
  return status.charAt(0).toUpperCase() + status.slice(1);
});

/* -------------------------------
   TIMELINE
-------------------------------- */
const timelineSteps = computed(() => {
  const status = job.value?.status;

  return [
    { label: "Proposal Signed", active: true },
    { label: "Deposit Paid", active: false },
    { label: "Scheduled", active: status === "scheduled" },
    { label: "In Progress", active: status === "in_progress" },
    { label: "Complete", active: status === "complete" }
  ];
});

/* -------------------------------
   CTA
-------------------------------- */
const primaryCtaLabel = computed(() => {
  if (!job.value) return null;

  switch (job.value.status) {
    case "pending":
      return "Schedule Project";
    case "scheduled":
      return "View Schedule";
    case "ready":
      return "Prepare Start";
    case "in_progress":
      return "Mark Complete";
    default:
      return null;
  }
});

const handlePrimaryAction = () => {
  if (!job.value) return;

  switch (job.value.status) {
    case "pending":
    case "scheduled":
      router.push("/prototype/hq/schedule/confirm");
      break;
    case "ready":
      console.log("Prepare start — coming soon");
      break;
    case "in_progress":
      console.log("Mark complete — coming soon");
      break;
  }
};

const goToTimeline = () => {
  const id = job.value?.id || jobId.value;
  if (!id) return;
  router.push({ path: "/prototype/hq/projects/job/timeline", query: { job: id } });
};

/* -------------------------------
   FORMATTERS
-------------------------------- */
const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
};

const formatDate = (value: string | null | undefined) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
};

/* -------------------------------
   FETCH JOB
-------------------------------- */
const fetchJob = async () => {
  loading.value = true;
  error.value = false;

  const id = jobId.value;

  if (!id) {
    error.value = true;
    loading.value = false;
    return;
  }

  try {
    const response = await fetch(`/api/jobs/${id}`);

    if (!response.ok) {
      throw new Error("Failed to load job");
    }

    const json = await response.json();

    // API returns { success: true, job: {...} }
    job.value = json.job;
  } catch (err) {
    console.error("Error fetching job", err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchJob);
</script>
