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
   ROUTE TOKEN (LOCKED)
---------------------------- */
const route = useRoute();

const publicToken = computed(() => {
  const p = route.params as Record<string, unknown>;
  return typeof p.token === "string"
    ? p.token
    : typeof p.id === "string"
    ? p.id
    : "";
});

console.log("[ClientProposalView] publicToken:", publicToken.value);

/* ----------------------------
   COMPOSABLE
---------------------------- */
const { loading, error, proposalDisplayPayload, load } = useProposal();

/* ----------------------------
   LOAD (TOKEN ONLY)
---------------------------- */
watch(
  publicToken,
  async (token) => {
    if (!token) return;
    console.log("[LOAD] using token:", token);
    await load(token);
  },
  { immediate: true }
);

/* ----------------------------
   DERIVED
---------------------------- */
const proposal = computed(() => {
  return proposalDisplayPayload.value?.proposal ?? null;
});

/* ----------------------------
   OPTIONS
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
   AUTO SELECT FIRST OPTION
---------------------------- */
const selectedOptionName = ref<string | null>(null);

watch(
  () => proposal.value?.options,
  (opts) => {
    if (!selectedOptionName.value && opts?.length) {
      selectedOptionName.value = opts[0].name;
      console.log("[AUTO-SELECT] selectedOptionName:", selectedOptionName.value);
    }
  },
  { immediate: true }
);

/* ----------------------------
   ACCEPT
---------------------------- */
const submitting = ref(false);

const accept = async () => {
  if (!proposal.value) return;

  if (!selectedOptionName.value) {
    console.warn("[ACCEPT] no option available");
    return;
  }

  submitting.value = true;

  try {
    console.log("[ACCEPT] sending", {
      token: publicToken.value,
      optionName: selectedOptionName.value,
    });

    await acceptPublicProposal(
      publicToken.value,
      selectedOptionName.value
    );

    // Reload using SAME token
    await load(publicToken.value);
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
