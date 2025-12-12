<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const props = defineProps<{
  job_id?: string;
}>();

const route = useRoute();
const router = useRouter();

const normalizeParam = (value: unknown): string => {
  if (Array.isArray(value)) return value[0] ?? "";
  return typeof value === "string" ? value : "";
};

const jobId = computed(() => {
  return (
    normalizeParam(props.job_id) ||
    normalizeParam(route.query.job_id) ||
    normalizeParam(route.params.id as string | string[] | undefined) ||
    normalizeParam(route.query.job)
  );
});

const openChat = () => {
  if (!jobId.value) return;
  router.push(`/prototype/hq/job-chat?job_id=${jobId.value}`);
};
</script>

<template>
  <div class="flex min-h-[40vh] flex-col items-center justify-center gap-4 bg-white p-6 text-center text-slate-800">
    <div class="space-y-2">
      <h1 class="text-xl font-semibold">Kickoff Message</h1>
      <p class="max-w-md text-sm text-slate-600">
        Mock chat entry point for kickoff. Jump into the job conversation from here.
      </p>
    </div>
    <button
      class="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      :disabled="!jobId"
      @click="openChat"
    >
      Open Job Chat (Mock)
    </button>
    <p v-if="!jobId" class="text-xs text-amber-600">No job selected. Add a job_id to the link.</p>
  </div>
</template>
