<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useProposal } from "@/modules/public/composables/useProposal";

/* -------------------------------------------------
   ROUTE
-------------------------------------------------- */
const route = useRoute();

const token = computed(() => {
  const p = route.params as Record<string, unknown>;
  return typeof p.token === "string" ? p.token : "";
});

/* -------------------------------------------------
   OPTIONAL DATA (best-effort only)
-------------------------------------------------- */
const { proposalDisplayPayload } = useProposal();

const proposal = computed(() => proposalDisplayPayload.value?.proposal ?? null);
const acceptedOption = computed(
  () => proposal.value?.signed_option ?? null
);
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-16">
    <div class="mx-auto max-w-2xl text-center">

      <div class="rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-100">
        <div class="text-4xl">🎉</div>

        <h1 class="mt-4 text-2xl font-semibold text-slate-900">
          Your project is approved
        </h1>

        <p class="mt-2 text-slate-600">
          We’ve received your signed approval and the contractor has been notified.
        </p>

        <!-- OPTIONAL DETAILS -->
        <div
          v-if="proposal"
          class="mt-6 rounded-xl bg-slate-50 p-4 text-left"
        >
          <div class="text-sm text-slate-500">Project</div>
          <div class="font-medium text-slate-900">
            {{ proposal.title }}
          </div>

          <div v-if="acceptedOption" class="mt-3">
            <div class="text-sm text-slate-500">Selected option</div>
            <div class="font-medium text-slate-900">
              {{ acceptedOption }}
            </div>
          </div>
        </div>

        <p class="mt-6 text-sm text-slate-500">
          You’re all set. No further action is required.
        </p>
      </div>

    </div>
  </div>
</template>
