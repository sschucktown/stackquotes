<template>
  <div class="min-h-screen bg-slate-50 px-4 py-10">
    <div class="mx-auto w-full max-w-4xl">

      <!-- Loading -->
      <div v-if="loading" class="flex h-48 items-center justify-center text-slate-500">
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
          <img
            v-if="contractor?.logoUrl"
            :src="contractor.logoUrl"
            class="mx-auto mb-4 h-16 w-auto object-contain"
          />
          <h1 class="text-2xl font-semibold text-slate-900">
            {{ contractor?.businessName ?? "Proposal" }}
          </h1>
          <p v-if="proposal.description" class="mt-2 text-sm text-slate-600">
            {{ proposal.description }}
          </p>
        </header>

        <!-- Proposal Options -->
        <section class="space-y-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-slate-900">
              {{ proposal.title }}
            </h2>
            <span
              class="rounded-full px-3 py-1 text-xs font-semibold"
              :class="statusClass"
            >
              {{ statusLabel }}
            </span>
          </div>

          <!-- Options -->
          <div v-if="options.length" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ClientPackageCard
              v-for="opt in options"
              :key="opt.name"
              :option="opt"
              :selected="opt.name === selectedOptionName"
              :deposit-text="depositText(opt)"
              @select="selectOption(opt.name)"
            />
          </div>

          <!-- Selected summary -->
          <div
            v-if="selectedOption"
            class="mt-4 rounded-2xl border bg-slate-50 p-4"
          >
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm font-semibold text-slate-900">
                  {{ selectedOption.name }}
                </div>
                <div class="text-xs text-slate-600">
                  {{ selectedOption.summary }}
                </div>
              </div>
              <div class="text-right">
                <div class="text-xl font-semibold text-slate-900">
                  {{ currency(selectedOption.subtotal) }}
                </div>
                <div v-if="selectedDeposit" class="text-xs text-slate-600">
                  Deposit: {{ currency(selectedDeposit) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-4 flex flex-col gap-2">
            <button
              class="rounded-xl bg-[#0F62FE] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0d55e5]"
              :disabled="submitting || proposal.status === 'accepted'"
              @click="accept"
            >
              <span v-if="submitting">Submitting…</span>
              <span v-else-if="proposal.status === 'accepted'">Accepted</span>
              <span v-else>Accept Proposal</span>
            </button>

            <a
              v-if="proposal.status === 'accepted' && paymentLinkUrl"
              :href="paymentLinkUrl"
              target="_blank"
              class="rounded-xl border px-4 py-2 text-center text-sm font-semibold"
            >
              Pay Deposit
            </a>

            <p v-if="acceptError" class="text-sm text-rose-600">
              {{ acceptError }}
            </p>
            <p v-if="acceptMessage" class="text-sm text-emerald-700">
              {{ acceptMessage }}
            </p>
          </div>
        </section>

        <!-- Comments -->
        <CommentsPanel
          v-if="proposal.public_token"
          :proposal-id="proposal.id"
          :token="proposal.public_token"
          mode="client"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useProposal } from "../../modules/public/composables/useProposal";
import { acceptPublicProposal } from "@/modules/public/api/proposal";
import ClientPackageCard from "@/modules/proposals/components/ClientPackageCard.vue";
import CommentsPanel from "@/modules/smartproposal/components/CommentsPanel.vue";
import type { ProposalOption } from "@stackquotes/types";

/* ---------------------------
   Setup
--------------------------- */
const route = useRoute();
const token = String(route.params.id ?? "");

const { loading, error, proposalDisplayPayload, load } = useProposal(token);

onMounted(load);

/* ---------------------------
   Normalized data
--------------------------- */
const proposal = computed(() => proposalRef.value);
const contractor = computed(() => proposalDisplayPayload.value?.contractor ?? null);
const paymentLinkUrl = computed(() => proposalDisplayPayload.value?.paymentLinkUrl ?? null);

const options = computed<ProposalOption[]>(() => {
  return proposal.value?.line_items?.options ?? [];
});

const depositConfig = computed(() => {
  return proposal.value?.deposit_config ?? null;
});

/* ---------------------------
   Selection state
--------------------------- */
const selectedOptionName = ref<string | null>(null);
const submitting = ref(false);
const acceptError = ref<string | null>(null);
const acceptMessage = ref<string | null>(null);

const selectedOption = computed<ProposalOption | null>(() => {
  if (!options.value.length) return null;
  return (
    options.value.find(o => o.name === selectedOptionName.value)
    ?? options.value[0]
  );
});

const selectedDeposit = computed(() => {
  if (!selectedOption.value || !depositConfig.value) return null;

  if (depositConfig.value.type === "fixed") {
    return depositConfig.value.value;
  }

  return Math.round(
    selectedOption.value.subtotal * (depositConfig.value.value / 100)
  );
});

/* ---------------------------
   UI helpers
--------------------------- */
const statusLabel = computed(() =>
  proposal.value?.status === "accepted" ? "Accepted" : "Review"
);

const statusClass = computed(() =>
  proposal.value?.status === "accepted"
    ? "bg-emerald-100 text-emerald-700"
    : "bg-amber-100 text-amber-700"
);

const currency = (n?: number | null) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(n ?? 0));

const depositText = (opt: ProposalOption) =>
  selectedDeposit.value ? `${currency(selectedDeposit.value)} deposit` : null;

/* ---------------------------
   Actions
--------------------------- */
const selectOption = (name: string) => {
  selectedOptionName.value = name;
};

const accept = async () => {
  if (!proposal.value?.public_token || !selectedOption.value) return;

  submitting.value = true;
  acceptError.value = null;
  acceptMessage.value = null;

  try {
    await acceptPublicProposal(
      proposal.value.public_token,
      selectedOption.value.name
    );
    acceptMessage.value = "Thanks! Your selection has been saved.";
    await load();
  } catch (e: any) {
    acceptError.value = e?.message ?? "Failed to accept proposal.";
  } finally {
    submitting.value = false;
  }
};
</script>
