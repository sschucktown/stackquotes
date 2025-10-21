<template>
  <div class="min-h-screen bg-slate-50 px-4 py-12">
    <div class="mx-auto w-full max-w-4xl">
      <div v-if="loading" class="flex h-48 items-center justify-center text-slate-500">
        Preparing proposal.
      </div>

      <div
        v-else-if="error"
        class="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-600"
      >
        {{ error }}
      </div>

      <div v-else-if="proposal" class="space-y-8">
        <header class="text-center">
          <img
            v-if="contractor?.logoUrl"
            :src="contractor?.logoUrl"
            alt="Company logo"
            class="mx-auto mb-4 h-16 w-auto object-contain"
          />
          <h1 class="text-2xl font-semibold text-slate-900">
            {{ contractor?.businessName ?? "SmartProposal" }}
          </h1>
          <p class="mt-2 text-sm text-slate-600">
            Review and approve
            <strong>{{ proposal!.title }}</strong>
            for {{ clientName }}.
          </p>
          <p v-if="proposal!.acceptedOption" class="mt-2 text-xs text-slate-500">
            Previously selected: <strong>{{ proposal!.acceptedOption }}</strong>. You can change your
            selection below.
          </p>
        </header>

        <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="grid gap-6 md:grid-cols-2">
            <div>
              <h2 class="text-sm font-semibold text-slate-800">Project Summary</h2>
              <p class="mt-2 text-sm text-slate-600" v-if="proposal!.description">
                {{ proposal!.description }}
              </p>
              <p class="mt-2 text-xs text-slate-500">
                QuickQuote reference:
                <span class="font-medium text-slate-700">
                  {{ proposal!.quickquoteId ? proposal!.quickquoteId.slice(0, 8).toUpperCase() : "N/A" }}
                </span>
              </p>
            </div>
            <div class="rounded-lg bg-slate-50 p-4">
              <h3 class="text-xs uppercase tracking-wide text-slate-500">Deposit</h3>
              <p
                v-if="selectedDepositAmount !== null"
                class="mt-2 text-2xl font-semibold text-slate-900"
              >
                {{ formatCurrency(selectedDepositAmount) }}
              </p>
              <p v-else class="mt-2 text-sm text-slate-600">
                Select a package to see the deposit amount.
              </p>
              <p class="mt-1 text-sm text-slate-600">
                {{ depositMessage }}
              </p>
            </div>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-lg font-semibold text-slate-900">Package Options</h2>
          <div
            v-for="option in proposal!.options"
            :key="option.name"
            :class="optionCardClass(option.name)"
            role="button"
            tabindex="0"
            @click="selectOption(option.name)"
            @keydown.enter.prevent="selectOption(option.name)"
            @keydown.space.prevent="selectOption(option.name)"
          >
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-start gap-3">
                <input
                  type="radio"
                  name="proposal-option"
                  class="mt-1 h-4 w-4 border-slate-300 text-[#3A7D99] focus:ring-[#3A7D99]"
                  :checked="selectedOptionName === option.name"
                  @change.stop="selectOption(option.name)"
                />
                <div>
                  <h3 class="text-base font-semibold text-slate-900">{{ option.name }}</h3>
                  <p class="text-sm text-slate-600">
                    {{ option.summary || defaultSummary(option.name) }}
                  </p>
                </div>
              </div>
              <span class="text-xl font-semibold text-slate-900">
                {{ formatCurrency(option.subtotal) }}
              </span>
            </div>
            <ul class="mt-4 space-y-2 text-sm text-slate-600">
              <li
                v-for="item in option.lineItems"
                :key="item.description"
                class="flex items-center justify-between"
              >
                <span>{{ item.description }}</span>
                <span class="text-slate-500">{{ formatCurrency(item.total) }}</span>
              </li>
            </ul>
          </div>
        </section>

        <section class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-slate-900">Ready to move forward?</h2>
          <p class="text-sm text-slate-600">
            Click the button below to secure your spot. You'll be redirected to a secure Stripe
            checkout page once you confirm your package. Questions? Contact
            <a
              v-if="contractor?.email"
              class="font-medium text-[#3A7D99]"
              :href="`mailto:${contractor.email}`"
            >
              {{ contractor.email }}
            </a>
            <span v-else class="font-medium text-slate-700">your contractor</span>.
          </p>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-lg bg-[#3A7D99] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2f6d87] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3A7D99] disabled:cursor-not-allowed disabled:bg-slate-400"
              :disabled="!selectedOption || accepting"
              @click="onAccept"
            >
              <span v-if="accepting">Processing...</span>
              <span v-else-if="selectedDepositAmount !== null && selectedDepositAmount > 0">
                Accept &amp; Pay Deposit
              </span>
              <span v-else>Accept Proposal</span>
            </button>
            <a
              v-if="paymentLinkUrl && !accepting"
              :href="paymentLinkUrl"
              target="_blank"
              rel="noopener"
              class="text-sm font-medium text-[#3A7D99] underline"
            >
              Already have a payment link? Open it here.
            </a>
          </div>
          <p v-if="acceptError" class="text-sm text-rose-600">{{ acceptError }}</p>
          <span v-if="!selectedOption" class="text-xs text-slate-500">
            Choose a package to enable the acceptance button.
          </span>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import type { PublicProposalPayload } from "@modules/public/api/proposal";
import { acceptPublicProposal, fetchPublicProposal } from "@modules/public/api/proposal";

const route = useRoute();
const loading = ref(true);
const error = ref<string | null>(null);
const proposalData = ref<PublicProposalPayload | null>(null);

const accepting = ref(false);
const acceptError = ref<string | null>(null);
const selectedOptionName = ref<string | null>(null);

const proposal = computed(() => proposalData.value?.proposal ?? null);
const contractor = computed(() => proposalData.value?.contractor ?? null);
const clientName = computed(() => proposalData.value?.client?.name ?? "Client");
const paymentLinkUrl = computed(() => proposalData.value?.paymentLinkUrl ?? null);
const depositConfig = computed(() => proposalData.value?.deposit?.config ?? null);

const options = computed(() => proposal.value?.options ?? []);
const selectedOption = computed(() => {
  if (!selectedOptionName.value) return null;
  return options.value.find((option) => option.name === selectedOptionName.value) ?? null;
});

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

const selectedDepositAmount = computed<number | null>(() => {
  const config = depositConfig.value;
  if (!config) {
    return null;
  }
  if (!selectedOption.value) {
    return null;
  }
  if (config.type === "fixed") {
    return roundCurrency(Math.max(config.value, 0));
  }
  const subtotal = selectedOption.value.subtotal ?? 0;
  return roundCurrency(Math.max(subtotal * (config.value / 100), 0));
});

const depositMessage = computed(() => {
  const config = depositConfig.value;
  if (!config) {
    return "No deposit is required to accept this proposal.";
  }
  if (!selectedOption.value) {
    return "Select a package to see how much deposit is due.";
  }
  if (config.type === "percentage") {
    return `${config.value}% of the ${selectedOption.value.name} package subtotal.`;
  }
  return "Fixed deposit amount collected at acceptance.";
});

const selectOption = (name: string) => {
  selectedOptionName.value = name;
  acceptError.value = null;
};

const optionCardClass = (name: string) =>
  [
    "rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3A7D99]",
    selectedOptionName.value === name ? "border-[#3A7D99] ring-2 ring-[#3A7D99]" : "hover:border-[#3A7D99]",
  ].join(" ");

const onAccept = async () => {
  if (!selectedOption.value) {
    acceptError.value = "Please choose a package to continue.";
    return;
  }
  accepting.value = true;
  acceptError.value = null;
  try {
    const token = route.params.token as string;
    const response = await acceptPublicProposal(token, selectedOption.value.name);
    if (response.error) {
      acceptError.value = response.error;
      return;
    }
    if (!response.data) {
      acceptError.value = "Unexpected response from the server.";
      return;
    }
    const updated = response.data.data;
    const meta = response.data.meta ?? {};
    const current = proposalData.value;
    const acceptedDepositAmount = meta.depositAmount ?? updated.depositAmount ?? null;
    proposalData.value = {
      contractor: current?.contractor ?? null,
      client: current?.client ?? null,
      deposit: {
        config: updated.depositConfig ?? depositConfig.value ?? null,
        amount: acceptedDepositAmount,
      },
      paymentLinkUrl: meta.paymentLinkUrl ?? updated.paymentLinkUrl ?? null,
      proposal: updated,
    };
    selectedOptionName.value = updated.acceptedOption ?? selectedOption.value.name;
    const redirectUrl = meta.paymentLinkUrl ?? updated.paymentLinkUrl ?? null;
    if (acceptedDepositAmount && acceptedDepositAmount > 0 && !redirectUrl) {
      acceptError.value =
        "Deposit link is unavailable. Please contact your contractor to continue.";
    } else if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  } catch (err) {
    console.error(err);
    acceptError.value = "Unable to accept this proposal. Please try again.";
  } finally {
    accepting.value = false;
  }
};

const defaultSummary = (name: string) => {
  if (name === "Good") return "Essential scope to get started quickly.";
  if (name === "Best") return "Premium upgrades for a standout experience.";
  return "Balanced deliverables aligned with your goals.";
};

const load = async () => {
  loading.value = true;
  error.value = null;
  proposalData.value = null;
  try {
    const token = route.params.token as string;
    const response = await fetchPublicProposal(token);
    if (response.error) {
      error.value = response.error;
    } else {
      proposalData.value = response.data ?? null;
      if (!proposalData.value) {
        error.value = "This proposal link is no longer available.";
      } else {
        selectedOptionName.value = proposalData.value.proposal.acceptedOption ?? null;
      }
    }
  } catch (err) {
    console.error(err);
    error.value = "Unable to load this proposal.";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  void load();
});
</script>
