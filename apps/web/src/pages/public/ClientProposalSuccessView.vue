<script setup lang="ts">
import { computed, watch } from "vue";
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
   LOAD PROPOSAL
-------------------------------------------------- */
const { loading, error, proposalDisplayPayload, load } = useProposal();

watch(
  token,
  async (t) => {
    if (!t) return;
    await load(t);
  },
  { immediate: true }
);

/* -------------------------------------------------
   DATA
-------------------------------------------------- */
const proposal = computed(() => proposalDisplayPayload.value?.proposal ?? null);

const acceptedOption = computed(() => proposal.value?.signed_option ?? null);

const depositAmount = computed(() => {
  return proposal.value?.deposit_amount ?? 0;
});

const paymentLinkUrl = computed(() => {
  return proposal.value?.payment_link_url ?? null;
});

const showDepositButton = computed(() => {
  return depositAmount.value > 0;
});
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
        v-else-if="proposal"
        class="rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-100"
      >
        <div class="text-4xl">🎉</div>

        <h1 class="mt-4 text-2xl font-semibold text-slate-900">
          Your project is approved
        </h1>

        <p class="mt-2 text-slate-600">
          We’ve received your signed approval and the contractor has been notified.
        </p>

        <!-- Project summary -->
        <div class="mt-6 rounded-xl bg-slate-50 p-4 text-left">
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

          <div v-if="showDepositButton" class="mt-3">
            <div class="text-sm text-slate-500">Deposit due</div>
            <div class="font-medium text-slate-900">
              ${{ depositAmount.toLocaleString() }}
            </div>
          </div>
        </div>

        <!-- Deposit CTA -->
        <div v-if="showDepositButton" class="mt-8">
          <a
            v-if="paymentLinkUrl"
            :href="paymentLinkUrl"
            class="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-6 py-4 text-lg font-semibold text-white hover:bg-emerald-700"
          >
            Pay Deposit
          </a>

          <div
            v-else
            class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-700"
          >
            Your deposit payment link is being prepared. Please check back shortly.
          </div>
        </div>

        <p class="mt-8 text-sm text-slate-500">
          You’re all set. No further action is required unless prompted above.
        </p>
      </div>
    </div>
  </div>
</template>
