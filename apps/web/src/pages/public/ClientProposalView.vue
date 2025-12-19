<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

import ClientPackageCard from "@/modules/proposals/components/ClientPackageCard.vue";
import SignatureModal from "@/components/SmartProposal/SignatureModal.vue";

import {
  resolveTradeFromAbstractKey,
  resolveTierFromAbstractKey,
} from "@/modules/proposals/utils/visualAssets";

import { acceptPublicProposal } from "@/modules/public/api/proposal";
import { useProposal } from "@/modules/public/composables/useProposal";
import type { ProposalOption } from "@stackquotes/types";

/* -------------------------------------------------
   ROUTE
-------------------------------------------------- */
const route = useRoute();

const token = computed(() => {
  const p = route.params as Record<string, unknown>;
  return typeof p.token === "string"
    ? p.token
    : typeof p.id === "string"
    ? p.id
    : "";
});

/* -------------------------------------------------
   COMPOSABLE
-------------------------------------------------- */
const { loading, error, proposalDisplayPayload, load } = useProposal();

/* -------------------------------------------------
   LOAD
-------------------------------------------------- */
watch(
  token,
  async (t) => {
    if (!t) return;
    await load(t);
  },
  { immediate: true }
);

/* -------------------------------------------------
   PROPOSAL
-------------------------------------------------- */
const proposal = computed(() => {
  return proposalDisplayPayload.value?.proposal ?? null;
});

/* -------------------------------------------------
   OPTIONS
-------------------------------------------------- */
const packageOptions = computed(() => {
  const opts = proposal.value?.options;
  if (!Array.isArray(opts)) return [];

  return opts.map((option: ProposalOption) => ({
    option,
    trade: resolveTradeFromAbstractKey(option.visual?.abstract_key),
    tier: resolveTierFromAbstractKey(option.visual?.abstract_key),
  }));
});

/* -------------------------------------------------
   SELECTION
-------------------------------------------------- */
const selectedOptionName = ref<string | null>(null);

watch(
  () => proposal.value?.options,
  (opts) => {
    if (!selectedOptionName.value && Array.isArray(opts) && opts.length > 0) {
      selectedOptionName.value = opts[0].name;
      console.log("[AUTO-SELECT]", opts[0].name);
    }
  },
  { immediate: true }
);

/* -------------------------------------------------
   ACCEPT FLOW (NO job_id HERE)
-------------------------------------------------- */
const submitting = ref(false);
const showSignatureModal = ref(false);

const accept = async () => {
  if (!proposal.value || !selectedOptionName.value) {
    console.warn("[ACCEPT] missing proposal or option");
    return;
  }

  submitting.value = true;

  try {
    await acceptPublicProposal(
      proposal.value.publicToken,
      selectedOptionName.value
    );

    // Accept succeeded → open signature modal
    showSignatureModal.value = true;
  } catch (err) {
    console.error("[ACCEPT] failed", err);
  } finally {
    submitting.value = false;
  }
};

/* -------------------------------------------------
   PRICE
-------------------------------------------------- */
const approvedPrice = computed(() => {
  if (!proposal.value || !selectedOptionName.value) return 0;

  const opt = proposal.value.options.find(
    (o: ProposalOption) => o.name === selectedOptionName.value
  );

  return opt?.subtotal ?? 0;
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-10">
    <div class="mx-auto max-w-4xl">

      <div v-if="loading" class="py-20 text-center text-slate-500">
        Loading proposal…
      </div>

      <div
        v-else-if="error"
        class="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-600"
      >
        {{ error }}
      </div>

      <div v-else-if="proposal" class="space-y-8">

        <!-- Header -->
        <header class="text-center">
          <h1 class="text-2xl font-semibold text-slate-900">
            {{ proposal.title }}
          </h1>
          <p v-if="proposal.description" class="mt-2 text-sm text-slate-600">
            {{ proposal.description }}
          </p>
        </header>

        <!-- Options -->
        <section class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ClientPackageCard
              v-for="pkg in packageOptions"
              :key="pkg.option.name"
              :option="pkg.option"
              :trade="pkg.trade"
              :tier="pkg.tier"
              :selected="pkg.option.name === selectedOptionName"
              @select="selectedOptionName = pkg.option.name"
            />
          </div>

          <button
            class="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            :disabled="submitting"
            @click="accept"
          >
            {{ submitting ? "Submitting…" : "Accept Proposal" }}
          </button>
        </section>
      </div>
    </div>

    <!-- SIGNATURE MODAL -->
    <SignatureModal
      v-if="proposal"
      :open="showSignatureModal"
      :proposal-id="proposal.id"
      :accepted-option="selectedOptionName!"
      :approved-price="approvedPrice"
      :deposit-amount="proposal.depositConfig?.value ?? null"
      :on-close="() => (showSignatureModal = false)"
      :on-success="() => {
        showSignatureModal = false;
        load(token);
      }"
    />
  </div>
</template>
