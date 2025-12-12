<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

/* -----------------------------
   Types
------------------------------ */
type JobStatus = "pending" | "scheduled" | "ready" | "in_progress" | "complete";
type FilterKey = "all" | "pending" | "scheduled" | "active" | "completed";

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

const router = useRouter();

/* -----------------------------
   State
------------------------------ */
const jobs = ref<Job[]>([]);
const loading = ref(false);
const error = ref(false);

const activeFilter = ref<FilterKey>("all");

const filterChips: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "scheduled", label: "Scheduled" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
];

/* -----------------------------
   Fetch Jobs
------------------------------ */
const fetchJobs = async () => {
  loading.value = true;
  error.value = false;

  try {
    const res = await fetch("/api/jobs");
    if (!res.ok) throw new Error("Failed to fetch jobs");

    const data = await res.json();
    jobs.value = data.jobs || [];
  } catch (err) {
    console.error(err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchJobs);

/* -----------------------------
   Helpers
------------------------------ */
const statusLabel = (status: JobStatus) => {
  switch (status) {
    case "pending":
      return "Pending";
    case "scheduled":
      return "Scheduled";
    case "ready":
    case "in_progress":
      return "Active";
    case "complete":
      return "Completed";
  }
};

const statusPillClass = (status: JobStatus) => {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-700";
    case "scheduled":
      return "bg-blue-100 text-blue-700";
    case "ready":
    case "in_progress":
      return "bg-emerald-100 text-emerald-700";
    case "complete":
      return "bg-slate-200 text-slate-700";
  }
};

const groupedJobs = computed(() => {
  const pending: Job[] = [];
  const scheduled: Job[] = [];
  const active: Job[] = [];
  const completed: Job[] = [];

  for (const job of jobs.value) {
    switch (job.status) {
      case "pending":
        pending.push(job);
        break;
      case "scheduled":
        scheduled.push(job);
        break;
      case "ready":
      case "in_progress":
        active.push(job);
        break;
      case "complete":
        completed.push(job);
        break;
    }
  }

  return { pending, scheduled, active, completed };
});

const filteredGroups = computed(() => {
  const groups = groupedJobs.value;

  if (activeFilter.value === "all") return groups;

  return {
    pending: activeFilter.value === "pending" ? groups.pending : [],
    scheduled: activeFilter.value === "scheduled" ? groups.scheduled : [],
    active: activeFilter.value === "active" ? groups.active : [],
    completed: activeFilter.value === "completed" ? groups.completed : [],
  };
});

const shortenId = (id: string) =>
  id.length > 8 ? id.slice(0, 8) : id;

const formatCurrency = (amount: number | null) =>
  amount === null
    ? "Pending"
    : amount.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      });

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString() : "To be scheduled";

/* -----------------------------
   Navigation
------------------------------ */
const openJob = (job: Job) => {
  router.push({
    path: "/prototype/hq/projects/job",
    query: { job: job.id },
  });
};
</script>

<template>
  <main class="min-h-screen bg-slate-50 text-slate-900">
    <div class="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <header class="mb-6">
        <h1 class="text-2xl font-semibold">Projects</h1>
        <p class="text-sm text-slate-600">
          Your full job pipeline with live statuses.
        </p>
      </header>

      <!-- FILTER CHIPS -->
      <div class="mb-6 flex flex-wrap gap-2">
        <button
          v-for="chip in filterChips"
          :key="chip.key"
          @click="activeFilter = chip.key"
          class="rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition"
          :class="activeFilter === chip.key
            ? 'bg-slate-900 text-white border-slate-900'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'"
        >
          {{ chip.label }}
        </button>
      </div>

      <!-- LOADING -->
      <div v-if="loading" class="space-y-4 animate-pulse">
        <div class="h-24 rounded-2xl bg-slate-200"></div>
        <div class="h-24 rounded-2xl bg-slate-200"></div>
      </div>

      <!-- ERROR -->
      <div
        v-else-if="error"
        class="flex flex-col items-center justify-center py-20 text-center"
      >
        <p class="text-lg font-semibold">Could not load projects</p>
        <button
          @click="fetchJobs"
          class="mt-4 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Retry
        </button>
      </div>

      <!-- EMPTY -->
      <div
        v-else-if="jobs.length === 0"
        class="py-20 text-center text-slate-500"
      >
        <p class="text-lg font-semibold text-slate-900">No jobs yet</p>
        <p class="text-sm">Create your first job to get started.</p>
      </div>

      <!-- GROUPS -->
      <div v-else class="space-y-10">
        <template
          v-for="(group, key) in filteredGroups"
          :key="key"
        >
          <section v-if="group.length">
            <h2 class="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              {{ key }}
            </h2>

            <div class="space-y-3">
              <div
                v-for="job in group"
                :key="job.id"
                class="cursor-pointer rounded-2xl border bg-white p-4 shadow-sm hover:bg-slate-50"
                @click="openJob(job)"
              >
                <div class="flex justify-between">
                  <div>
                    <p class="font-semibold">{{ job.approved_option }}</p>
                    <p class="text-xs text-slate-500">
                      Job {{ shortenId(job.id) }}
                    </p>
                  </div>
                  <span
                    class="rounded-full px-2 py-1 text-xs font-semibold"
                    :class="statusPillClass(job.status)"
                  >
                    {{ statusLabel(job.status) }}
                  </span>
                </div>

                <p class="mt-1 text-xs text-slate-500">
                  Deposit: {{ formatCurrency(job.deposit_amount) }}
                </p>
              </div>
            </div>
          </section>

          <!-- EMPTY GROUP STATE -->
          <section
            v-else-if="activeFilter !== 'all'"
            class="text-sm italic text-slate-400"
          >
            No jobs in this category.
          </section>
        </template>
      </div>
    </div>
  </main>
</template>
