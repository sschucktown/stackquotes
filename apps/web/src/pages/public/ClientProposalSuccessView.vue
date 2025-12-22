<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { usePublicJob } from "@/modules/public/composables/usePublicJob";

/* -------------------------------------------------
   ROUTE
-------------------------------------------------- */
const route = useRoute();

const jobId = computed(() => {
  const q = route.query;
  return typeof q.job === "string" ? q.job : "";
});

/* -------------------------------------------------
   LOAD JOB
-------------------------------------------------- */
const { loading, error, job, load } = usePublicJob();

watch(
  jobId,
  async (id) => {
    if (!id) return;
    await load(id);
  },
  { immediate: true }
);
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-16">
    <div class="mx-auto max-w-2xl text-center">

      <div v-if="loading" class="text-slate-500">
        Finalizing your project…
      </div>

      <div
        v-else-if="error"
        class="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-600"
      >
        {{ error }}
      </div>

      <div
        v-else-if="job"
        class="rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-100"
      >
        <div class="text-4xl">🎉</div>

        <h1 class="mt-4 text-2xl font-semibold text-slate-900">
          Your project is approved
        </h1>

        <p class="mt-2 text-slate-600">
          We’ve received your signed approval.
        </p>

        <!-- Deposit CTA -->
        <div
          v-if="job.deposit_amount && job.deposit_amount > 0"
          class="mt-8"
        >
          <a
            v-if="job.payment_link_url"
            :href="job.payment_link_url"
            target="_blank"
            class="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            Pay Deposit
          </a>

          <div
            v-else
            class="text-sm text-slate-500 mt-2"
          >
            Deposit payment link will be sent shortly.
          </div>
        </div>

        <p class="mt-8 text-sm text-slate-500">
          You’re all set. No further action is required right now.
        </p>
      </div>
    </div>
  </div>
</template>
