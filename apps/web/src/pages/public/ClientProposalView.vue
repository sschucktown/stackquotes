<template>
  <div class="min-h-screen bg-slate-50 px-4 py-10">
    <div class="mx-auto w-full max-w-4xl">
      <div v-if="loading" class="flex h-48 items-center justify-center text-slate-500">
        Loading...
      </div>

      <div
        v-else-if="error"
        class="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-600"
      >
        {{ error }}
      </div>

      <div v-else class="space-y-8">
        <!-- Header / Branding -->
        <header class="text-center">
          <img
            v-if="headerLogoUrl"
            :src="headerLogoUrl"
            alt="Company logo"
            class="mx-auto mb-4 h-16 w-auto object-contain"
          />
          <h1 class="text-2xl font-semibold text-slate-900">
            {{ headerTitle }}
          </h1>
          <p v-if="subTitle" class="mt-2 text-sm text-slate-600">{{ subTitle }}</p>
        </header>

        <!-- QuickQuote (Estimate) full view until accepted -->
        <section v-if="isEstimate && !isEstimateAccepted" class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-slate-900">Estimate</h2>
          <div class="mt-2 text-sm text-slate-600" v-if="estimateNotes">{{ estimateNotes }}</div>
          <div class="mt-4 overflow-hidden rounded-lg border border-slate-200" v-if="estimateItems && estimateItems.length">
            <table class="min-w-full divide-y divide-slate-200">
              <thead class="bg-slate-50">
                <tr class="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th class="px-4 py-3">Description</th>
                  <th class="px-4 py-3 text-right">Qty</th>
                  <th class="px-4 py-3 text-right">Unit</th>
                  <th class="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 bg-white text-sm text-slate-700">
                <tr v-for="item in estimateItems" :key="item.id">
                  <td class="px-4 py-3">
                    <p class="font-medium text-slate-900">{{ item.description }}</p>
                    <p v-if="item.cost" class="text-xs text-slate-500">Cost: {{ currency(item.cost) }}</p>
                  </td>
                  <td class="px-4 py-3 text-right">{{ Number(item.quantity).toFixed(2) }}</td>
                  <td class="px-4 py-3 text-right">{{ currency(item.unitPrice) }}</td>
                  <td class="px-4 py-3 text-right font-semibold text-slate-900">{{ currency(item.total) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="mt-4 flex flex-col gap-2 text-sm text-slate-600 md:items-end">
            <div>Subtotal: {{ currency(estimateSubtotal) }}</div>
            <div>Tax: {{ currency(estimateTax) }}</div>
            <div class="text-base font-semibold text-slate-900">Total Due: {{ currency(estimateTotal) }}</div>
          </div>

          <div class="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-60"
              :disabled="approving || !canApproveEstimate"
              @click="onApproveEstimate"
            >
              <span v-if="approving">Approving…</span>
              <span v-else>Approve QuickQuote</span>
            </button>
          </div>
          <p v-if="approveError" class="mt-2 text-sm text-rose-600">{{ approveError }}</p>
          <p v-if="approveMessage" class="mt-2 text-sm text-emerald-700">{{ approveMessage }}</p>
        </section>

        <!-- QuickQuote summary (collapsed) when accepted -->
        <section
          v-if="isEstimate && isEstimateAccepted"
          class="overflow-hidden rounded-xl border bg-white p-5 shadow-sm transition-all duration-500"
          :class="['border-emerald-300', 'accepted']"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">✓</span>
              <h3 class="text-sm font-semibold text-slate-900">QuickQuote Accepted</h3>
            </div>
            <div class="text-sm text-slate-700">{{ currency(estimateTotal) }}</div>
          </div>
          <p class="mt-2 text-xs text-slate-500">Summary of your accepted QuickQuote is shown above. Your detailed SmartProposal appears below.</p>
        </section>

        <!-- SmartProposal expanded -->
        <section
          v-if="hasProposalPayload"
          class="space-y-5 rounded-3xl bg-white/95 p-6 shadow-sm ring-1 ring-slate-100"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">{{ proposalTitle }}</h2>
              <p v-if="proposalDescription" class="mt-1 text-sm text-slate-600">{{ proposalDescription }}</p>
            </div>
            <span
              class="rounded-full px-3 py-1 text-xs font-semibold"
              :class="proposalStatusClass"
            >
              {{ proposalStatusLabel }}
            </span>
          </div>

          <div v-if="useWowPortal" class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ClientPackageCard
              v-for="opt in proposalOptions"
              :key="opt.name"
              :option="opt"
              :trade="optionTrade(opt)"
              :tier="optionTier(opt)"
              :selected="opt.name === selectedOptionName"
              :deposit-text="optionDepositText(opt)"
              @select="selectOption(opt.name)"
            />
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="opt in proposalOptions"
              :key="opt.name"
              class="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-slate-50/60 p-4"
            >
              <div class="flex items-center justify-between gap-3">
                <div>
                  <div class="text-sm font-semibold text-slate-900">{{ opt.name }}</div>
                  <div class="text-xs text-slate-600">{{ opt.summary || defaultSummary(opt.name) }}</div>
                </div>
                <div class="text-base font-semibold text-slate-900">{{ currency(opt.subtotal) }}</div>
              </div>
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-300 transition hover:bg-white"
                  :class="opt.name === selectedOptionName ? 'bg-slate-900 text-white ring-slate-900' : ''"
                  @click="selectOption(opt.name)"
                >
                  {{ opt.name === selectedOptionName ? "Selected" : "Select" }}
                </button>
                <span v-if="optionDepositText(opt)" class="text-xs text-slate-500">{{ optionDepositText(opt) }}</span>
              </div>
            </div>
          </div>

          <div class="grid gap-4 md:grid-cols-[minmax(0,2fr)_1fr] md:items-start">
            <div class="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <p class="text-xs uppercase tracking-[0.16em] text-slate-500">Selected package</p>
              <div class="mt-2 flex items-center justify-between gap-3">
                <div>
                  <div class="text-lg font-semibold text-slate-900">
                    {{ selectedOption?.name ?? "Option" }}
                  </div>
                  <p class="text-sm text-slate-600">
                    {{ selectedOption?.summary || defaultSummary(selectedOption?.name || "Option") }}
                  </p>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-semibold text-slate-900">
                    {{ currency(selectedOption?.subtotal) }}
                  </div>
                  <div class="text-xs text-slate-600" v-if="selectedDepositAmount !== null">
                    Deposit: {{ currency(selectedDepositAmount) }}
                  </div>
                </div>
              </div>
            </div>
          <div class="flex flex-col gap-2">
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-xl bg-[#0F62FE] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0d55e5] disabled:opacity-60"
              :disabled="!selectedOption || submitting || selectionState === 'accepted' || !proposalToken"
                @click="acceptSelectedOption"
              >
                <span v-if="submitting">Submitting…</span>
                <span v-else-if="selectionState === 'accepted'">Accepted</span>
                <span v-else>Accept proposal</span>
              </button>
              <p v-if="acceptError" class="text-sm text-rose-600">{{ acceptError }}</p>
              <p v-if="acceptMessage" class="text-sm text-emerald-700">{{ acceptMessage }}</p>
              <a
                v-if="proposalAccepted && paymentLinkUrl"
                :href="paymentLinkUrl"
                target="_blank"
                rel="noopener"
                class="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Pay Deposit
              </a>
            </div>
          </div>

          <div v-if="showCommentsPanel" class="mt-6">
            <CommentsPanel
              :proposal-id="proposal.value?.id ?? null"
              :token="proposalToken"
              mode="client"
              :accent-color="proposalDisplayPayload?.contractor?.accentColor ?? null"
            />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useProposal } from "@modules/public/composables/useProposal";
import type { ProposalDepositConfig, ProposalOption } from "@stackquotes/types";
import ClientPackageCard from "@/modules/proposals/components/ClientPackageCard.vue";
import { acceptPublicProposal } from "@modules/public/api/proposal";
import {
  resolveTierFromAbstractKey,
  resolveTradeFromAbstractKey,
  type ProposalTier,
  type ProposalTrade,
} from "@/modules/proposals/utils/visualAssets";
import CommentsPanel from "@/modules/smartproposal/components/CommentsPanel.vue";

const route = useRoute();
const id = computed(() => String(route.params.id ?? ""));

const { loading, error, state, isEstimate, proposalDisplayPayload, load, approveEstimate } = useProposal(id.value);

onMounted(() => {
  void load();
});

const selectedOptionName = ref<string | null>(null);
const selectionState = ref<"idle" | "selecting" | "reviewing" | "submitting" | "accepted" | "error">("idle");
const acceptError = ref<string | null>(null);
const acceptMessage = ref<string | null>(null);
const submitting = ref(false);

// Header branding and labels
const headerLogoUrl = computed(() => {
  return proposalDisplayPayload.value?.contractor?.logoUrl
    ?? state.value.estimatePayload?.settings?.logoUrl
    ?? null;
});
const headerTitle = computed(() => {
  return proposalDisplayPayload.value?.contractor?.businessName
    ?? state.value.estimatePayload?.settings?.companyName
    ?? "Proposal";
});
const subTitle = computed(() => {
  if (isEstimate.value) {
    return state.value.estimatePayload?.estimate?.projectTitle ? `Review and approve ${state.value.estimatePayload?.estimate?.projectTitle}` : null;
  }
  return proposalDisplayPayload.value?.proposal?.title ? `Review ${proposalDisplayPayload.value?.proposal?.title}` : null;
});

// Estimate helpers
const estimateData = computed(() => state.value.estimatePayload?.estimate ?? null);
const estimateItems = computed(() => estimateData.value?.lineItems ?? []);
const estimateSubtotal = computed(() => estimateData.value?.subtotal ?? 0);
const estimateTax = computed(() => estimateData.value?.tax ?? 0);
const estimateTotal = computed(() => estimateData.value?.total ?? 0);
const estimateNotes = computed(() => estimateData.value?.notes ?? "");
const isEstimateAccepted = computed(() => (state.value.status ?? "") === "accepted");
const canApproveEstimate = computed(() => Boolean(state.value.estimateToken) && (state.value.status ?? "") !== "accepted");

const approving = ref(false);
const approveError = ref<string | null>(null);
const approveMessage = ref<string | null>(null);
const onApproveEstimate = async () => {
  if (!canApproveEstimate.value) return;
  approving.value = true;
  approveError.value = null;
  approveMessage.value = null;
  try {
    const res = await approveEstimate();
    if ((res as any).error) {
      approveError.value = (res as any).error as string;
    } else {
      approveMessage.value = "Thanks! Your QuickQuote has been accepted.";
    }
  } catch (e: any) {
    approveError.value = e?.message ?? "Failed to approve";
  } finally {
    approving.value = false;
  }
};

// SmartProposal helpers
const proposal = computed(() => proposalDisplayPayload.value?.proposal ?? null);
const proposalOptions = computed<ProposalOption[]>(() => proposal.value?.options ?? []);
const proposalAccepted = computed(() => (proposal.value?.status ?? "") === "accepted");
const proposalTitle = computed(() => proposal.value?.title ?? "SmartProposal");
const proposalDescription = computed(() => proposal.value?.description ?? "");
const paymentLinkUrl = computed(() => proposalDisplayPayload.value?.paymentLinkUrl ?? null);
const planMeta = computed(() => proposalDisplayPayload.value?.plan ?? null);
const allowMultiOptions = computed(
  () => planMeta.value?.allowMultiOptions ?? proposalOptions.value.length > 1
);
const wowPortalEnabled = computed(() => planMeta.value?.wowPortalEnabled ?? false);
const useWowPortal = computed(
  () => wowPortalEnabled.value && allowMultiOptions.value && proposalOptions.value.length > 1
);
const depositConfig = computed<ProposalDepositConfig | null>(
  () =>
    proposal.value?.depositConfig ??
    ((proposalDisplayPayload.value?.deposit?.config as ProposalDepositConfig | null) ?? null)
);
const proposalToken = computed(
  () => state.value.proposalToken ?? state.value.linkedProposalToken ?? null
);
const showCommentsPanel = computed(() =>
  wowPortalEnabled.value && Boolean(proposal.value?.id && proposalToken.value)
);
const selectedOption = computed<ProposalOption | null>(() => {
  const current =
    proposalOptions.value.find((opt) => opt.name === selectedOptionName.value) ??
    proposalOptions.value[0] ??
    null;
  return current;
});
const hasProposalPayload = computed(() => Boolean(proposalDisplayPayload.value));

const proposalStatusLabel = computed(() => {
  const s = (proposal.value?.status ?? "sent").toLowerCase();
  if (s === "accepted") return "Accepted";
  if (s === "paid") return "Paid";
  if (s === "sent") return "Sent";
  return s;
});
const proposalStatusClass = computed(() => {
  const s = (proposal.value?.status ?? "sent").toLowerCase();
  if (s === "accepted") return "bg-emerald-100 text-emerald-700";
  if (s === "paid") return "bg-blue-100 text-blue-700";
  if (s === "sent") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
});

const currency = (n: number | null | undefined) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(n ?? 0));

const optionTier = (option: ProposalOption): ProposalTier => {
  const abstractKey = option.visual?.abstract_key ?? null;
  if (abstractKey) return resolveTierFromAbstractKey(abstractKey);
  const lower = option.name.toLowerCase();
  if (lower.includes("best")) return "best";
  if (lower.includes("better")) return "better";
  return "good";
};

const optionTrade = (option: ProposalOption): ProposalTrade => {
  const abstractKey = option.visual?.abstract_key ?? null;
  return resolveTradeFromAbstractKey(abstractKey ?? undefined);
};

const computeDepositForOption = (
  option: ProposalOption | null,
  config: ProposalDepositConfig | null
): number | null => {
  if (!option || !config) return null;
  if (config.type === "fixed") {
    return Math.round(config.value * 100) / 100;
  }
  const subtotal = Number(option.subtotal ?? 0);
  if (!Number.isFinite(subtotal) || subtotal <= 0) return null;
  return Math.round(subtotal * (config.value / 100) * 100) / 100;
};

const selectedDepositAmount = computed(() =>
  proposalAccepted.value && proposalDisplayPayload.value?.deposit?.amount != null
    ? proposalDisplayPayload.value.deposit.amount
    : computeDepositForOption(selectedOption.value, depositConfig.value)
);

const optionDepositText = (option: ProposalOption) => {
  const amount = computeDepositForOption(option, depositConfig.value);
  if (amount === null) return null;
  return `${currency(amount)} deposit`;
};

const selectOption = (name: string) => {
  selectedOptionName.value = name;
  selectionState.value = "reviewing";
  acceptError.value = null;
  acceptMessage.value = null;
};

const acceptSelectedOption = async () => {
  if (!proposalToken.value || !selectedOption.value) return;
  submitting.value = true;
  acceptError.value = null;
  acceptMessage.value = null;
  selectionState.value = "submitting";
  try {
    const res = await acceptPublicProposal(proposalToken.value, selectedOption.value.name);
    if ((res as any).error) {
      throw new Error((res as any).error as string);
    }
    acceptMessage.value = "Thanks! Your selection has been saved.";
    selectionState.value = "accepted";
    await load();
  } catch (e: any) {
    acceptError.value = e?.message ?? "Unable to accept proposal right now.";
    selectionState.value = "error";
  } finally {
    submitting.value = false;
  }
};

watch(
  proposalOptions,
  (opts) => {
    const accepted = proposal.value?.acceptedOption ?? null;
    const fallback = opts[0]?.name ?? null;
    selectedOptionName.value = accepted ?? selectedOptionName.value ?? fallback;
    selectionState.value = accepted ? "accepted" : "idle";
  },
  { immediate: true }
);

watch(
  () => proposal.value?.acceptedOption,
  (accepted) => {
    if (accepted) {
      selectedOptionName.value = accepted;
      selectionState.value = "accepted";
    }
  }
);

// Utils
const defaultSummary = (name: string) => {
  if (name === "Good") return "Essential scope to get started quickly.";
  if (name === "Best") return "Premium upgrades for a standout experience.";
  return "Balanced deliverables aligned with your goals.";
};
</script>
