<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

// ---------------------------------------------
// Pull schedule + job metadata from query params
// ---------------------------------------------
const client = computed(() => route.query.client as string || "Client");
const project = computed(() => route.query.project as string || "Project");
const start = computed(() => route.query.start as string || "");
const end = computed(() => route.query.end as string || null);

const formatDate = (iso?: string) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};
</script>

<template>
  <main class="min-h-screen bg-white text-slate-900 px-4 py-10 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-lg text-center">

      <!-- Heading -->
      <h1 class="text-2xl font-semibold mb-3 text-slate-900">
        Project Scheduled
      </h1>
      <p class="text-slate-600 mb-8">
        Your project has been successfully added to your schedule.
      </p>

      <!-- Confirmation Card -->
      <div class="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 text-left space-y-6">

        <!-- Project Info -->
        <section>
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Project
          </p>
          <p class="text-lg font-bold text-slate-900">
            {{ project }}
          </p>

          <p class="mt-1 text-sm text-slate-500">
            Client: <span class="font-medium text-slate-800">{{ client }}</span>
          </p>
        </section>

        <!-- Dates -->
        <section>
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
            Scheduled Date
          </p>

          <p class="text-sm font-semibold text-emerald-700">
            {{ formatDate(start) }}
          </p>

          <p v-if="end" class="text-sm text-slate-500">
            through {{ formatDate(end) }}
          </p>
        </section>

        <!-- Status Indicator -->
        <section>
          <div class="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 border border-emerald-100">
            <span class="h-2 w-2 rounded-full bg-emerald-600"></span>
            <p class="text-sm font-semibold text-emerald-700">
              Scheduled & confirmed
            </p>
          </div>
        </section>

        <!-- Next Steps -->
        <section class="space-y-2">
          <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Next steps
          </p>
          <ul class="text-sm text-slate-700 space-y-1">
            <li>• Send kickoff details to the client</li>
            <li>• Confirm materials and finalize prep tasks</li>
            <li>• Monitor job progress in Contractor HQ</li>
          </ul>
        </section>

      </div>

      <!-- Actions -->
      <div class="mt-8 space-y-3">
        <button
          class="w-full rounded-xl bg-slate-900 px-4 py-3 text-white font-semibold shadow hover:bg-slate-800 transition"
          @click="router.push('/prototype/hq/projects')"
        >
          Back to Projects
        </button>

        <button
          class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 font-semibold shadow-sm hover:bg-slate-50 transition"
          @click="router.push('/prototype/hq')"
        >
          Go to Contractor HQ
        </button>
      </div>

    </div>
  </main>
</template>
