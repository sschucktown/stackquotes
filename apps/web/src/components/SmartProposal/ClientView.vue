<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";

import SummaryPanel from "./SummaryPanel.vue";
import SignatureModal from "./SignatureModal.vue";
import AgreementDrawer from "./AgreementDrawer.vue";

/* --------------------------------------------------
   Props (OPTIONAL — prototype safe)
-------------------------------------------------- */
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

/* --------------------------------------------------
   PROTOTYPE FALLBACK
-------------------------------------------------- */
const demoProposal = {
  id: "demo-proposal",
  deposit_percent: 15,
  options: [
    { key: "good", label: "Good", subtitle: "Baseline materials", price: 15800 },
    { key: "better", label: "Better", subtitle: "Upgraded materials", price: 19800 },
    { key: "best", label: "Best", subtitle: "Premium everything", price: 23800 }
  ]
};

// If no real proposal passed → use demo
const proposal = computed(() => props.proposal ?? demoProposal);

/* --------------------------------------------------
   Router
-------------------------------------------------- */
const router = useRouter();
const route = useRoute();

const proposalId =
  (route.query.proposal as string) ||
  proposal.value.id ||
  "demo-proposal";

/* --------------------------------------------------
   Client Selection
-------------------------------------------------- */
const selected = ref(proposal.value.options[0]);

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const depositAmount = computed(() =>
  selected.value
    ? (selected.value.price * proposal.value.deposit_percent) / 100
    : 0
);

/* --------------------------------------------------
   Agreement Drawer
-------------------------------------------------- */
const agreementOpen = ref(false);

const openAgreement = () => {
  if (!selected.value) return;
  agreementOpen.value = true;
};

/* --------------------------------------------------
   Signature Modal
-------------------------------------------------- */
const signatureOpen = ref(false);

const openSignature = () => {
  agreementOpen.value = false;
  signatureOpen.value = true;
};

const handleSignedSuccess = () => {
  signatureOpen.value = false;
  router.push({
    path: "/prototype/smartproposal/signed",
    query: { proposal: proposalId }
  });
};
</script>

<template>
  <div class="mx-auto max-w-4xl p-4 pb-24 lg:flex lg:gap-8">
    <!-- ========================= -->
    <!-- Option Selector -->
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
              ? 'border-blue-600 ring-2 ring-blue-500'
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
      @approve="openAgreement"
      @question="() => alert('Ask question flow coming soon!')"
    />

    <!-- ========================= -->
    <!-- Agreement Drawer -->
    <!-- ========================= -->
    <AgreementDrawer
      :open="agreementOpen"
      :optionName="selected?.label || ''"
      :price="selected?.price || 0"
      :deposit="depositAmount"
      :onClose="() => (agreementOpen = false)"
      @continue="openSignature"
    />

    <!-- ========================= -->
    <!-- Signature Modal -->
    <!-- ========================= -->
    <SignatureModal
  :open="signatureOpen"
  :proposal-id="proposalId"
  :accepted-option="selected?.key || ''"
  :approved-price="selected?.price || 0"
  :deposit-amount="depositAmount"
  :on-close="() => (signatureOpen = false)"
  :on-success="handleSignedSuccess"
/>
  </div>
</template>
