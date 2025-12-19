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

/* ----------------------------
   COMPOSABLE
---------------------------- */
const { loading, error, proposalDisplayPayload, load } = useProposal();

/* ----------------------------
   LOAD + VERIFY
---------------------------- */
watch(
  token,
  async (t) => {
    if (!t) return;

    await load(t);

    console.log(
      "[VERIFY] proposal:",
      proposalDisplayPayload.value?.proposal
    );

    console.log(
      "[VERIFY] proposal.options:",
      proposalDisplayPayload.value?.proposal?.options
    );

    console.log(
      "[VERIFY] options length:",
      proposalDisplayPayload.value?.proposal?.options?.length
    );
  },
  { immediate: true }
);

/* ----------------------------
   DERIVED STATE
---------------------------- */
const proposal = computed(() => {
  return proposalDisplayPayload.value?.proposal ?? null;
});

/* ----------------------------
   OPTIONS (SOURCE OF TRUTH)
---------------------------- */
const options = computed<ProposalOption[]>(() => {
  return Array.isArray(proposal.value?.options)
    ? proposal.value!.options
    : [];
});

/* ----------------------------
   PACKAGE VIEW MODEL
---------------------------- */
const packageOptions = computed(() => {
  return options.value.map((option) => ({
    option,
    trade: resolveTradeFromAbstractKey(option.visual?.abstract_key),
    tier: resolveTierFromAbstractKey(option.visual?.abstract_key),
  }));
});

/* ----------------------------
   SELECTION (FORCE FIRST)
---------------------------- */
const selectedOptionName = ref<string | null>(null);

watch(
  options,
  (opts) => {
    if (!selectedOptionName.value && opts.length > 0) {
      selectedOptionName.value = opts[0].name;
      console.log(
        "[AUTO-SELECT] selectedOptionName:",
        selectedOptionName.value
      );
    }
  },
  { immediate: true }
);

/* ----------------------------
   ACCEPT
---------------------------- */
const submitting = ref(false);

const accept = async () => {
  if (!proposal.value?.publicToken) {
    console.warn("[ACCEPT] missing publicToken");
    return;
  }

  if (!selectedOptionName.value) {
    console.warn("[ACCEPT] no option available — aborting");
    return;
  }

  if (proposal.value.status === "accepted") {
    console.warn("[ACCEPT] already accepted");
    return;
  }

  submitting.value = true;

  try {
    console.log("[ACCEPT] sending", {
      token: proposal.value.publicToken,
      optionName: selectedOptionName.value,
    });

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

        <header class="text-center">
          <h1 class="text-2xl font-semibold text-slate-900">
            {{ proposal.title }}
          </h1>
          <p v-if="proposal.description" class="mt-2 text-sm text-slate-600">
            {{ proposal.description }}
          </p>
        </header>

        <section class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">

          <div
            v-if="packageOptions.length === 0"
            class="text-center text-slate-500 py-10"
          >
            No options available on this proposal.
          </div>

          <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            class="mt-6 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
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
