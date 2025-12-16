<template>
  <div class="min-h-screen bg-slate-50 px-4 py-10">
    <div class="mx-auto w-full max-w-4xl">

      <!-- Loading -->
      <div
        v-if="loading"
        class="flex h-48 items-center justify-center text-slate-500"
      >
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
      <div v-else-if="proposalDisplayPayload" class="space-y-8">

        <!-- Header -->
        <header class="text-center">
          <h1 class="text-2xl font-semibold text-slate-900">
            {{ contractor?.businessName ?? "Proposal" }}
          </h1>
          <p v-if="proposal?.description" class="mt-2 text-sm text-slate-600">
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
            type="button"
            class="rounded-xl bg-[#0F62FE] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0d55e5]"
            :disabled="submitting || proposal?.status === 'accepted'"
            @click="accept"
          >
            <span v-if="submitting">Submitting…</span>
            <span v-else-if="proposal?.status === 'accepted'">Accepted</span>
            <span v-else>Accept Proposal</span>
          </button>
        </section>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
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
const token = String(route.params.id ?? "");

/* ----------------------------
   Composable
---------------------------- */
const { loading, error, proposalDisplayPayload, load } = useProposal(token);

/* ----------------------------
   Lifecycle
---------------------------- */
onMounted(async () => {
  console.log("[ClientProposalView] loading token:", token);
  await load();
  console.log("[ClientProposalView] payload:", proposalDisplayPayload.value);
});

/* ----------------------------
   Derived State (NO GENERICS)
---------------------------- */
const proposal = computed(() => {
  return proposalDisplayPayload.value?.proposal ?? null;
});

const contractor = computed(() => {
  return proposalDisplayPayload.value?.contractor ?? null;
});

/* ----------------------------
   Package Options
---------------------------- */
const packageOptions = computed(() => {
  const opts = proposal.value?.options ?? [];
  return opts.map((option: ProposalOption) => {
    const abstractKey = option.visual?.abstract_key;
    return {
      option,
      trade: resolveTradeFromAbstractKey(abstractKey),
      tier: resolveTierFromAbstractKey(abstractKey),
    };
  });
});

/* ----------------------------
   Selection (auto-select first)
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
   Accept
---------------------------- */
const submitting = ref(false);

const selectOption = (name: string) => {
  selectedOptionName.value = name;
};

const accept = async () => {
  if (!proposal.value?.publicToken) return;
  if (!selectedOptionName.value) return;
  if (proposal.value.status === "accepted") return;

  submitting.value = true;
  console.log("[ClientProposalView] accepting option:", selectedOptionName.value);

  try {
    await acceptPublicProposal(
      proposal.value.publicToken,
      selectedOptionName.value
    );
    await load();
  } finally {
    submitting.value = false;
  }
};
</script>
