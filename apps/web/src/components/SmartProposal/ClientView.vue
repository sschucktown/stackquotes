<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import SummaryPanel from "./SummaryPanel.vue";
import SignatureModal from "./SignatureModal.vue";

const props = defineProps<{
  proposal: {
    id: string;
    options: Array<{
      key: string;
      label: string;
      subtitle?: string;
      price: number;
    }>;
    deposit_percent: number;
  };
}>();

const route = useRoute();
const router = useRouter();

const proposalId =
  (route.query.proposal as string) ||
  props.proposal.id ||
  "demo-proposal";

// ---------------------------
// Selection + Pricing
// ---------------------------
const selected = ref(props.proposal.options[0] ?? null);

const depositAmount = computed(() => {
  if (!selected.value) return 0;
  return (
    (selected.value.price * props.proposal.deposit_percent) /
    100
  );
});

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

// ---------------------------
// Signature Modal
// ---------------------------
const signatureOpen = ref(false);

const handleApprove = () => {
  if (!selected.value) return;
  signatureOpen.value = true;
};

const handleSignedSuccess = (payload: {
  proposalId: string;
  jobId?: string | null;
}) => {
  signatureOpen.value = false;

  const finalProposalId = payload.proposalId || proposalId;

  const query: Record<string, string> = {
    proposal: finalProposalId,
  };
  if (payload.jobId) {
    query.job = payload.jobId;
  }

  router.push({
    path: "/prototype/smartproposal/signed",
    query,
  });
};

const handleQuestion = () => {
  // Simple placeholder for now
  alert("Ask a question flow coming soon!");
};
</script>

<template>
  <div class="mx-auto max-w-4xl p-4 pb-24 lg:flex lg:gap-8">
    <!-- Options -->
    <div class="flex-1 space-y-4">
      <h1 class="mb-4 text-2xl font-bold text-slate-900">
        Choose Your Option
      </h1>

      <div class="grid gap-4 sm:grid-cols-2">
        <button
          v-for="option in proposal.options"
          :key="option.key"
          class="rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
          :class="[
            selected?.key === option.key
              ? 'border-emerald-600 ring-2 ring-emerald-500'
              : 'border-slate-200',
          ]"
          @click="selected = option"
        >
          <p class="text-lg font-semibold text-slate-900">
            {{ option.label }}
          </p>
          <p class="text-sm text-slate-600">
            {{ option.subtitle || "Balanced finish and materials" }}
          </p>
          <p class="mt-2 text-xl font-bold text-slate-900">
            {{ currency(option.price) }}
          </p>
        </button>
      </div>
    </div>

    <!-- Summary Panel -->
    <SummaryPanel
      class="mt-6 lg:mt-0"
      :selected="selected || undefined"
      :depositPercent="proposal.deposit_percent"
      :depositAmount="depositAmount"
      :currency="currency"
      @approve="handleApprove"
      @question="handleQuestion"
    />

    <!-- Signature Modal -->
    <SignatureModal
      :open="signatureOpen"
      :proposal-id="proposalId"
      :accepted-option="selected?.key || ''"
      :on-close="() => (signatureOpen.value = false)"
      :on-success="handleSignedSuccess"
    />
  </div>
</template>
