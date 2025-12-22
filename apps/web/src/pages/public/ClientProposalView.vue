<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import ClientPackageCard from "@/modules/proposals/components/ClientPackageCard.vue";
import SignatureModal from "@/components/SmartProposal/SignatureModal.vue";

import {
  resolveTradeFromAbstractKey,
  resolveTierFromAbstractKey,
} from "@/modules/proposals/utils/visualAssets";

import { useProposal } from "@/modules/public/composables/useProposal";
import type { ProposalOption } from "@stackquotes/types";

/* -------------------------------------------------
   ROUTING
-------------------------------------------------- */
const route = useRoute();
const router = useRouter();

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
    if (t) await load(t);
  },
  { immediate: true }
);

/* -------------------------------------------------
   DATA
-------------------------------------------------- */
const proposal = computed(
  () => proposalDisplayPayload.value?.proposal ?? null
);

const publicToken = computed(
  () => proposal.value?.publicToken ?? ""
);

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
    if (!selectedOptionName.value && Array.isArray(opts) && opts.length) {
      selectedOptionName.value = opts[0].name;
    }
  },
  { immediate: true }
);

/* -------------------------------------------------
   SIGNATURE FLOW
-------------------------------------------------- */
const showSignatureModal = ref(false);

const openSignature = () => {
  if (!proposal.value || !selectedOptionName.value) return;
  showSignatureModal.value = true;
};

const handleSigned = async () => {
  showSignatureModal.value = false;
  await load(token.value);
  router.replace(`/proposal/${token.value}/success`);
};
</script>

<template>
  <!-- PAGE SHELL (ALWAYS RENDERS) -->
  <div class="min-h-screen bg-slate-50 px-4 py-10">
    <div class="mx-auto max-w-4xl">

      <!-- HEADER -->
      <header class="mb-8 text-center">
        <h1 class="text-2xl font-semibold text-slate-900">
          {{ proposal?.title ?? "Project Proposal" }}
        </h1>
        <p v-if="proposal?.description" class="mt-2 text-sm text-slate-600">
          {{ proposal.description }}
        </p>
      </header>

      <!-- LOADING -->
      <div v-if="loading" class="py-20 text-center text-slate-500">
        Loading proposal…
      </div>

      <!-- ERROR -->
      <div
        v-else-if="error"
        class="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-600"
      >
        {{ error }}
      </div>

      <!-- EMPTY / INVALID -->
      <div
        v-else-if="!proposal"
        class="rounded-xl bg-slate-100 p-6 text-center text-slate-600"
      >
        This proposal is no longer available.
      </div>

      <!-- PROPOSAL -->
      <div v-else class="space-y-8">

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
            class="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
            @click="openSignature"
          >
            Accept & Sign
          </button>
        </section>
      </div>
    </div>

    <!-- SIGNATURE MODAL -->
    <SignatureModal
      v-if="proposal && publicToken && selectedOptionName"
      :open="showSignatureModal"
      :public-token="publicToken"
      :accepted-option="selectedOptionName"
      :on-close="() => (showSignatureModal = false)"
      :on-success="handleSigned"
    />
  </div>
</template>
