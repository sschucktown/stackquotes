<script setup lang="ts">
import { useRouter } from "vue-router";

const props = defineProps<{
  job: {
    id: string;
    title: string;
    client_name: string;
    start_date: string;
  } | null;
}>();

const router = useRouter();

const goToProjects = () => {
  router.push("/prototype/hq/projects");
};

const goToKickoff = () => {
  if (!props.job) return;
  router.push(`/client/project/${props.job.id}/kickoff`);
};
</script>

<template>
  <main class="min-h-screen bg-white px-6 py-10 flex flex-col items-center text-center">
    <!-- Success Icon -->
    <div
      class="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner"
    >
      <svg
        class="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>

    <!-- Header -->
    <h1 class="mt-6 text-2xl font-semibold text-slate-900">
      Project Scheduled
    </h1>

    <p class="mt-2 text-slate-600 max-w-sm">
      Your project with <span class="font-medium">{{ job?.client_name }}</span>
      is now locked in to begin on
      <span class="font-semibold">{{ job?.start_date }}</span>.
    </p>

    <!-- Summary Card -->
    <div
      class="mt-8 w-full max-w-md rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 shadow-sm text-left"
    >
      <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
        Project
      </p>
      <p class="text-sm font-medium text-slate-900">
        {{ job?.title }}
      </p>

      <div class="h-px w-full bg-slate-200 my-4"></div>

      <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
        Client
      </p>
      <p class="text-sm text-slate-900">
        {{ job?.client_name }}
      </p>

      <div class="h-px w-full bg-slate-200 my-4"></div>

      <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
        Start Date
      </p>
      <p class="text-sm text-slate-900">
        {{ job?.start_date }}
      </p>
    </div>

    <!-- Actions -->
    <div class="mt-10 w-full max-w-md space-y-3">
      <button
        class="w-full rounded-xl bg-emerald-600 px-4 py-3 text-white font-semibold shadow hover:bg-emerald-700 transition"
        @click="goToKickoff"
      >
        Prepare Kickoff Packet
      </button>

      <button
        class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 font-semibold shadow-sm hover:bg-slate-50 transition"
        @click="goToProjects"
      >
        Back to Projects Overview
      </button>
    </div>
  </main>
</template>
