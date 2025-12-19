<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

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
   DATA
---------------------------- */
const { loading, error, proposalDisplayPayload, load } = useProposal();

watch(
  token,
  async (t) => {
    if (!t) return;
    await load(t);
     console.log(
      "[VERIFY] proposal.options:",
      proposalDisplayPayload.value?.proposal?.options
    );

    console.log(
      "[VERIFY] options length:",
      proposalDisplayPayload.value?.proposal?.options?.length
    );
    console.log("[ClientProposalView] payload:", proposalDisplayPayload.value);
  },
  { immediate: true }
);

/* ----------------------------
   PROPOSAL
---------------------------- */
const proposal = computed(() => {
  return proposalDisplayPayload.value?.proposal ?? null;
});

/* ----------------------------
   OPTIONS (LINE ITEMS)
---------------------------- */
const options = computed(() => {
  return proposal.value?.line_items ?? [];
});

/* ----------------------------
   SELECTION (FORCED)
---------------------------- */
const selectedOptionName = ref<string | null>(null);

watch(
  options,
  (opts) => {
    if (!opts?.length) return;

    if (!selectedOptionName.value) {
      selectedOptionName.value =
        opts[0].name ?? "default";
      console.warn(
        "[ClientProposalView] auto-selected option:",
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
  console.log("[ACCEPT] click");

  if (!proposal.value) {
    console.error("[ACCEPT] proposal missing");
    return;
  }

  if (!proposal.value.publicToken) {
    console.error("[ACCEPT] missing token");
    return;
  }

  if (!selectedOptionName.value) {
    console.error("[ACCEPT] no option available");
    return;
  }

  submitting.value = true;

  try {
    await acceptPublicProposal(
      proposal.value.publicToken,
      selectedOptionName.value
    );

    console.log("[ACCEPT] success");
    await load(token.value);
  } catch (e) {
    console.error("[ACCEPT] failed", e);
  } finally {
    submitting.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-10">
    <div class="mx-auto max-w-3xl">

      <div v-if="loading" class="text-center py-10">
        Loading…
      </div>

      <div v-else-if="error" class="text-red-600">
        {{ error }}
      </div>

      <div v-else-if="proposal">
        <h1 class="text-2xl font-semibold mb-4">
          {{ proposal.title }}
        </h1>

        <p class="text-slate-600 mb-6">
          {{ proposal.description }}
        </p>

        <button
          class="w-full rounded-xl bg-blue-600 px-4 py-3 text-white font-semibold"
          :disabled="submitting || proposal.status === 'accepted'"
          @click="accept"
        >
          <span v-if="submitting">Submitting…</span>
          <span v-else-if="proposal.status === 'accepted'">Accepted</span>
          <span v-else>Accept Proposal</span>
        </button>
      </div>
    </div>
  </div>
</template>
