<template>
  <div class="min-h-screen bg-slate-50 px-4 py-12">
    <div class="mx-auto w-full max-w-4xl">
      <div v-if="loading" class="flex h-48 items-center justify-center text-slate-500">
        Preparing proposal…
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
                  {{ proposal!.quickquoteId ? proposal!.quickquoteId.slice(0, 8).toUpperCase() : 'N/A' }}
                </span>
              </p>
            </div>
            <div class="rounded-lg bg-slate-50 p-4">
              <h3 class="text-xs uppercase tracking-wide text-slate-500">Deposit Due</h3>
              <p class="mt-2 text-2xl font-semibold text-slate-900">
                {{ formatCurrency(depositAmount) }}
              </p>
              <p class="text-sm text-slate-600">
                {{ depositLabel }}
              </p>
            </div>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-lg font-semibold text-slate-900">Package Options</h2>
          <div
            v-for="option in proposal!.options"
            :key="option.name"
            class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 class="text-base font-semibold text-slate-900">{{ option.name }}</h3>
                <p class="text-sm text-slate-600">{{ option.summary || defaultSummary(option.name) }}</p>
              </div>
              <span class="text-xl font-semibold text-slate-900">
                {{ formatCurrency(option.subtotal) }}
              </span>
            </div>
            <ul class="mt-4 space-y-2 text-sm text-slate-600">
              <li v-for="item in option.lineItems" :key="item.description" class="flex items-center justify-between">
                <span>{{ item.description }}</span>
                <span class="text-slate-500">{{ formatCurrency(item.total) }}</span>
              </li>
            </ul>
          </div>
        </section>

        <section class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-slate-900">Ready to move forward?</h2>
          <p class="text-sm text-slate-600">
            Click the button below to secure your spot with a deposit. You&apos;ll be redirected to a secure
            Stripe checkout page. Questions? Contact
            <a
              v-if="contractor?.email"
              class="font-medium text-[#3A7D99]"
              :href="`mailto:${contractor.email}`"
            >
              {{ contractor.email }}
            </a>
            <span v-else class="font-medium text-slate-700">your contractor</span>.
          </p>
          <div class="flex flex-wrap items-center gap-3">
            <a
              v-if="paymentLinkUrl"
              :href="paymentLinkUrl"
              target="_blank"
              rel="noopener"
              class="inline-flex items-center rounded-lg bg-[#3A7D99] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2f6d87] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3A7D99]"
            >
              Accept &amp; Pay Deposit
            </a>
            <span v-else class="rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-500">
              Deposit link is unavailable. Please reach out to your contractor to continue.
            </span>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import type { PublicProposalPayload } from "@modules/public/api/proposal";
import { fetchPublicProposal } from "@modules/public/api/proposal";

const route = useRoute();
const loading = ref(true);
const error = ref<string | null>(null);
const proposalData = ref<PublicProposalPayload | null>(null);

const proposal = computed(() => proposalData.value?.proposal ?? null);
const contractor = computed(() => proposalData.value?.contractor ?? null);
const depositAmount = computed(() => proposalData.value?.deposit.amount ?? 0);
const paymentLinkUrl = computed(() => proposalData.value?.paymentLinkUrl ?? null);
const clientName = computed(() => proposalData.value?.client?.name ?? "Client");

const depositLabel = computed(() => {
  const deposit = proposalData.value?.deposit;
  if (!deposit?.config) return "Deposit amount due at acceptance.";
  if (deposit.config.type === "percentage") {
    return `${deposit.config.value}% of the Better package subtotal.`;
  }
  return "Fixed deposit amount.";
});

const defaultSummary = (name: string) => {
  if (name === "Good") return "Essential scope to get started quickly.";
  if (name === "Best") return "Premium upgrades for a standout experience.";
  return "Balanced deliverables aligned with your goals.";
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

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







