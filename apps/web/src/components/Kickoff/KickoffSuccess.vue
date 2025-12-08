<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useContractorHQPrototype } from "@/stores/contractorHQPrototype";

const route = useRoute();
const router = useRouter();
const hqStore = useContractorHQPrototype();

const jobId = computed(() => (typeof route.query.job === "string" ? route.query.job : undefined));
const job = computed(() => hqStore.getJob(jobId.value));
const arrivalWindow = computed(() => job.value?.kickoff?.arrivalWindow || "8:00–10:00 AM");

const goDashboard = () => {
  router.push({ path: "/prototype/client/kickoff", query: { job: jobId.value || job.value?.id || "job-maple" } });
};
</script>

<template>
  <main class="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
    <div class="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center sm:px-6">
      <div class="mb-4 text-5xl">🎉</div>
      <h1 class="text-2xl font-semibold text-slate-900">You’re all set for kickoff.</h1>
      <p class="mt-2 text-sm text-slate-600">Your crew will arrive between {{ arrivalWindow }}.</p>
      <p class="mt-1 text-xs text-slate-500">We’ll keep you posted if anything changes.</p>
      <button
        type="button"
        class="mt-6 inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
        @click="goDashboard"
      >
        Return to dashboard
      </button>
    </div>
  </main>
</template>
