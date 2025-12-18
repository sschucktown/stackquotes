<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import type { ProposalOption } from "@stackquotes/types";

import ClientPackageCard from "@/modules/proposals/components/ClientPackageCard.vue";
import {
  resolveTradeFromAbstractKey,
  resolveTierFromAbstractKey,
} from "@/modules/proposals/utils/visualAssets";

import { acceptPublicProposal } from "@/modules/public/api/proposal";
import { useProposal } from "@/modules/public/composables/useProposal";

/* ----------------------------
   ROUTE
---------------------------- */
const route = useRoute();

const token = computed(() => {
  const p = route.params as Record<string, unknown>;
  return typeof p.token === "string"
    ? p.token
    : typeof p.id === "string"
    ? p.id
    : "";
});

console.log("[ClientProposalView] token:", token.value);

/* ----------------------------
   COMPOSABLE
---------------------------- */
const { loading, error, proposalDisplayPayload, load } = useProposal();

/* ----------------------------
   LOAD PROPOSAL
---------------------------- */
watch(
  token,
  async (t) => {
    if (!t) return;
    console.log("[ClientProposalView] loading proposal:", t);
    await load(t);
    console.log(
      "[ClientProposalView] proposal:",
      proposalDisplayPayload.value
    );
  },
  { immediate: true }
);

/* ----------------------------
   DERIVED STATE
---------------------------- */
const proposal = computed(() => proposalDisplayPayload.value);

/* ----------------------------
   PACKAGE OPTIONS
---------------------------- */
const packageOptions = computed(() => {
  const opts = proposal.value?.options ?? [];
  return opts.map((option: ProposalOption) => ({
    option,
    trade: resolveTradeFromAbstractKey(option.visual?.abstract_key),
    tier: resolveTierFromAbstractKey(option.visual?.abstract_key),
  }));
});

/* ----------------------------
   SELECTION
---------------------------- */
const selectedOptionName = ref<string | null>(null);

watch(
  () => proposal.value?.options,
  (opts) => {
    if (!selectedOptionName.value && opts?.length) {
      selectedOptionName.value = opts[0].name;
    }
  },
  { immediate: true }
);

/* ----------------------------
   ACCEPT
---------------------------- */
const submitting = ref(false);

const accept = async () => {
  console.log("[ACCEPT] click fired");

  if (!proposal.value?.publicToken) {
    console.warn("[ACCEPT] missing publicToken");
    return;
  }

  if (!selectedOptionName.value) {
    console.warn("[ACCEPT] no option selected");
    return;
  }

  if (proposal.value.status === "accepted") {
    console.warn("[ACCEPT] already accepted");
    return;
  }

  submitting.value = true;

  try {
    await acceptPublicProposal(
      proposal.value.publicToken,
      selectedOptionName.value
    );
    await load(token.value);
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-10">
    <div class="mx-auto max-w-4xl">

      <!-- Loading -->
      <div v-if="loading" class="py-20 text-center text-slate-500">
        Loading proposal…
      </div>

      <!-- Error -->
      <div
        v-else-if="error"
        class="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-600"
      >
        {{ error }}
      </div>

      <!-- Proposal -->
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

          <!-- Accept -->
          <button
            class="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700"
            :disabled="submitting || proposal.status === 'accepted'"
            @click="accept"
          >
            <span v-if="submitting">Submitting…</span>
            <span v-else-if="proposal.status === 'accepted'">Accepted</span>
            <span v-else>Accept Proposal</span>
          </button>
        </section>
      </div>
    </div>
  </div>
</template>
