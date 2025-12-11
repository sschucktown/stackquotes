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
    client_id: string;
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
// Router
// --------------------------------------------------
const route = useRoute();
const router = useRouter();

const proposalId =
  (route.query.proposal as string) ||
  props.proposal.id ||
  "demo-proposal";

const clientId =
  (route.query.client as string) ||
  props.proposal.client_id ||
  "demo-client";

// --------------------------------------------------
// Selection state
// --------------------------------------------------
const selected = ref(props.proposal.options[0] ?? null);

const depositAmount = computed(() => {
  if (!selected.value) return 0;
  return (
    (selected.value.price * props.proposal.deposit_percent) / 100
  );
});

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

// --------------------------------------------------
// Signature Modal
// --------------------------------------------------
const signatureOpen = ref(false);
const loading = ref(false);
const errorMessage = ref("");

// Trigger modal
const handleApprove = () => {
  if (!selected.value) return;
  signatureOpen.value = true;
};

// After signature success → POST job → redirect
const handleSignedSuccess = async (signatureUrl: string) => {
  signatureOpen.value = false;

  // --------------------------------------------------
  // Create JOB after SmartProposal signing
  // --------------------------------------------------
  loading.value = true;
  errorMessage.value = "";

  try {
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        proposal_id: proposalId,
        client_id: clientId,
        approved_option: selected.value?.key,
        approved_price: selected.value?.price,
        deposit_amount: depositAmount.value || null
      })
    });

    const json = await res.json();

    if (!res.ok) {
      console.error("Job creation failed:", json);
      throw new Error(json.error || "Job creation error");
    }

    const jobId = json.job?.id;

    if (!jobId) {
      console.warn("No job ID returned — using fallback.");
      return router.push({
        path: "/prototype/hq/approval-state"
      });
    }

    // Redirect contractor to Project Approval State
    return router.push({
      path: "/prototype/hq/approval-state",
      query: { job: jobId }
    });

  } catch (err: any) {
    console.error(err);
    errorMessage.value = err.message || "Unexpected error";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="mx-auto max-w-4xl p-4 pb-24 lg:flex lg:gap-8">
    <!-- ========================= -->
    <!-- Option Selection Column -->
    <!-- ========================= -->
    <div class="flex-1 space-y-4">
      <h1 class="text-2xl font-bold text-slate-900 mb-4">
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
      :loading="loading"
      :error="errorMessage"
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
