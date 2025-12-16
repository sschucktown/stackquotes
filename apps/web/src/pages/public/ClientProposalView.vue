<template>
  <div class="min-h-screen bg-slate-50 px-4 py-10">
    <div class="mx-auto w-full max-w-4xl">

      <!-- Loading -->
      <div v-if="loading" class="flex h-48 items-center justify-center text-slate-500">
        Loading proposal...
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
            {{ contractor?.businessName ?? "Proposal" }}
          </h1>
          <p v-if="proposal.description" class="mt-2 text-sm text-slate-600">
            {{ proposal.description }}
          </p>
        </header>

        <!-- Options -->
        <section class="space-y-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ClientPackageCard
              v-for="pkg in packageOptions"
              :key="pkg.option.name"
              :option="pkg.option"
              :trade="pkg.trade"
              :tier="pkg.tier"
              :selected="pkg.option.name === selectedOptionName"
              @select="selectOption(pkg.option.name)"
            />
          </div>

          <!-- Accept -->
          <button
            class="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 text-white"
            :disabled="submitting"
            @click="accept"
          >
            {{ submitting ? "Submitting..." : "Accept Proposal" }}
          </button>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
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
   Route
---------------------------- */
const route = useRoute();
const token = String(route.params.token ?? "");

/* ----------------------------
   Composable (GUARDED)
---------------------------- */
const proposalComposable = useProposal(token);

if (!proposalComposable) {
  throw new Error("useProposal composable failed to initialize");
}

const { loading, error, proposalDisplayPayload, load } = proposalComposable;

/* ----------------------------
   Lifecycle
---------------------------- */
onMounted(() => {
  console.log("[ClientProposalView] Proposal token from route:", token);
  if (token) {
    load();
  }
});

/* ----------------------------
   Derived State (GUARDED)
---------------------------- */
const proposal = computed(() => proposalDisplayPayload.value?.proposal ?? null);

const contractor = computed(() => proposalDisplayPayload.value?.contractor ?? null);

const packageOptions = computed(() => {
  const opts = (proposal.value?.options ?? []) as ProposalOption[];

  return opts.map((option) => {
    const abstractKey = option?.visual?.abstract_key;
    return {
      option,
      trade: resolveTradeFromAbstractKey(abstractKey),
      tier: resolveTierFromAbstractKey(abstractKey),
    };
  });
});

/* ----------------------------
   Selection
---------------------------- */
const selectedOptionName = ref<string | null>(null);
const submitting = ref(false);

const selectOption = (name: string) => {
  selectedOptionName.value = name;
};

/* ----------------------------
   Accept
---------------------------- */
const accept = async () => {
  if (!proposal.value?.publicToken || !selectedOptionName.value) return;

  submitting.value = true;
  try {
    await acceptPublicProposal(proposal.value.publicToken, selectedOptionName.value);
    await load();
  } finally {
    submitting.value = false;
  }
};
</script>
