<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import SummaryPanel from "./SummaryPanel.vue";
import SignatureModal from "./SignatureModal.vue";

/* ---------------------------------------------------
   1. Fallback Demo Proposal (for prototype routes)
--------------------------------------------------- */
const demoProposal = {
  id: "demo-proposal",
  deposit_percent: 15,
  options: [
    {
      key: "good",
      label: "Good",
      subtitle: "Reliable materials",
      price: 14800,
    },
    {
      key: "better",
      label: "Better",
      subtitle: "Improved durability & look",
      price: 18600,
    },
    {
      key: "best",
      label: "Best",
      subtitle: "Top-tier finish & materials",
      price: 23800,
    },
  ],
};

/* ---------------------------------------------------
   2. Props (optional, because prototypes load standalone)
--------------------------------------------------- */
const props = defineProps<{
  proposal?: {
    id: string;
    deposit_percent: number;
    options: Array<{
      key: string;
      label: string;
      subtitle?: string;
      price: number;
    }>;
  };
}>();

// Always guarantee a usable proposal
const proposal = props.proposal ?? demoProposal;

/* ---------------------------------------------------
   3. Router utilities
--------------------------------------------------- */
const route = useRoute();
const router = useRouter();

// Handle incoming ?proposal=123
const proposalId =
  (route.query.proposal as string) ||
  proposal.id ||
  "demo-proposal";

/* ---------------------------------------------------
   4. Option Selection
--------------------------------------------------- */
const selected = ref(proposal.options[0]);

const depositAmount = computed(() => {
  return (selected.value.price * proposal.deposit_percent) / 100;
});

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

/* ---------------------------------------------------
   5. Signature Modal
--------------------------------------------------- */
const signatureOpen = ref(false);

const handleApprove = () => {
  signatureOpen.value = true;
};

const handleSignedSuccess = (payload: {
  proposalId: string;
  jobId?: string | null;
}) => {
  signatureOpen.value = false;

  const query: Record<string, string> = { proposal: payload.proposalId };
  if (payload.jobId) query.job = payload.jobId;

  router.push({
    path: "/prototype/smartproposal/signed",
    query,
  });
};

const handleQuestion = () => {
  alert("Ask a question flow coming soon!");
};
</script>

<template>
  <div class="mx-auto max-w-4xl p-4 pb-24 lg:flex lg:gap-8">

    <!-- ========================= -->
    <!-- Option Selection Column -->
    <!-- ========================= -->
    <div class="flex-1 space-y-4">
      <h1 class="text-2xl font-bold text-slate-900 mb-4">Choose Your Option</h1>

      <div class="grid gap-4 sm:grid-cols-2">
        <button
          v-for="option in proposal.options"
          :key="option.key"
          class="rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
          :class="[
            selected?.key === option.key
              ? 'border-emerald-600 ring-2 ring-emerald-500'
              : 'border-slate-200'
          ]"
          @click="selected = option"
        >
          <p class="text-lg font-semibold text-slate-900">
            {{ option.label }}
          </p>

          <p class="text-sm text-slate-600">
            {{ option.subtitle }}
          </p>

          <p class="mt-2 text-xl font-bold text-slate-900">
            {{ currency(option.price) }}
          </p>
        </button>
      </div>
    </div>

    <!-- ========================= -->
    <!-- Summary Panel (right side) -->
    <!-- ========================= -->
    <SummaryPanel
      class="mt-6 lg:mt-0"
      :selected="selected || undefined"
      :depositPercent="proposal.deposit_percent"
      :depositAmount="depositAmount"
      :currency="currency"
      @approve="handleApprove"
      @question="handleQuestion"
    />

    <!-- ========================= -->
    <!-- Signature Modal -->
    <!-- ========================= -->
    <SignatureModal
      :open="signatureOpen"
      :proposal-id="proposalId"
      :accepted-option="selected?.key || ''"
      :on-close="() => (signatureOpen = false)"
      :on-success="handleSignedSuccess"
    />
  </div>
</template>
