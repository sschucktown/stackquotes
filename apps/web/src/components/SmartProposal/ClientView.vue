<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import SummaryPanel from "./SummaryPanel.vue";
import SignatureModal from "./SignatureModal.vue";

// --------------------------------------------------
// Props
// --------------------------------------------------
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

// --------------------------------------------------
// Router utilities
// --------------------------------------------------
const route = useRoute();
const router = useRouter();

// proposalId comes from prototype route or props
const proposalId =
  (route.query.proposal as string) ||
  props.proposal.id ||
  "demo-proposal";

// --------------------------------------------------
// Client selection
// --------------------------------------------------
const selected = ref(props.proposal.options[0] ?? null);

const depositAmount = computed(() => {
  if (!selected.value) return 0;
  return (selected.value.price * props.proposal.deposit_percent) / 100;
});

// Currency formatter
const currency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

// --------------------------------------------------
// Signature modal
// --------------------------------------------------
const signatureOpen = ref(false);

const handleApprove = () => {
  if (!selected.value) return;
  signatureOpen.value = true;
};

const handleSignedSuccess = () => {
  signatureOpen.value = false;

  router.push({
    path: "/prototype/smartproposal/signed",
    query: { proposal: proposalId },
  });
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
    <!-- Summary Panel -->
    <!-- ========================= -->
    <SummaryPanel
      class="mt-6 lg:mt-0"
      :selected="selected || undefined"
      :depositPercent="proposal.deposit_percent"
      :depositAmount="depositAmount"
      :currency="currency"
      @approve="handleApprove"
      @question="() => alert('Ask question flow coming soon!')"
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
