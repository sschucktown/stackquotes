<template>
  <div class="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="space-y-1">
        <h1 class="text-2xl font-semibold text-slate-900">SmartProposals</h1>
        <p class="text-sm text-slate-500">
          Every accepted QuickQuote automatically becomes a Good / Better / Best proposal ready to present.
        </p>
      </div>
      <div class="flex items-center gap-3 text-sm text-slate-500">
        <span class="font-medium text-slate-700">Quick tip:</span>
        <span>Mark a QuickQuote as accepted to refresh this workspace.</span>
      </div>
    </header>

    <div v-if="loading" class="grid gap-4 md:grid-cols-3">
      <div v-for="index in 3" :key="`skeleton-${index}`" class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="h-4 w-24 animate-pulse rounded bg-slate-200" />
        <div class="mt-4 h-6 w-32 animate-pulse rounded bg-slate-200" />
        <div class="mt-6 space-y-3">
          <div v-for="row in 4" :key="row" class="h-3 w-full animate-pulse rounded bg-slate-100" />
        </div>
        <div class="mt-6 h-10 w-full animate-pulse rounded bg-slate-200" />
      </div>
    </div>

    <template v-else>
      <section v-if="currentProposal" class="space-y-4">
        <header class="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-sm uppercase tracking-wide text-slate-500">Active Proposal</p>
            <h2 class="text-xl font-semibold text-slate-900">
              {{ proposalTitle }}
            </h2>
            <p class="text-xs text-slate-500">
              Generated {{ formatRelativeDate(currentProposal.createdAt) }} &middot; Status:
              <span :class="statusPillClass">
                {{ currentProposal.status }}
              </span>
            </p>
          </div>
          <div class="flex flex-col items-end gap-2 text-sm text-slate-500">
            <label class="text-xs uppercase tracking-wide">Switch Proposals</label>
            <select
              v-model="selectedProposalId"
              class="w-56 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm focus:border-sq-primary focus:outline-none focus:ring-2 focus:ring-sq-primary/40"
            >
              <option
                v-for="proposal in activeCollection"
                :key="proposal.id"
                :value="proposal.id"
              >
                {{ proposalLabel(proposal) }}
              </option>
            </select>
          </div>
        </header>

        <div class="grid gap-4 md:grid-cols-3">
          <article
            v-for="option in currentProposal.options"
            :key="option.name"
            class="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <header class="space-y-1">
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-slate-900">{{ option.name }}</h3>
                <span
                  class="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-500"
                >
                  {{ multiplierLabel(option.multiplier) }}
                </span>
              </div>
              <p class="text-sm text-slate-500">
                {{ option.summary || defaultSummary(option.name) }}
              </p>
              <p class="text-xl font-semibold text-slate-900">
                {{ formatCurrency(option.subtotal) }}
              </p>
            </header>

            <ul class="mt-4 flex-1 space-y-2 text-sm text-slate-600">
              <li
                v-for="item in option.lineItems"
                :key="item.description"
                class="flex items-start justify-between gap-2"
              >
                <span class="font-medium text-slate-700">{{ item.description }}</span>
                <span class="whitespace-nowrap text-slate-500">
                  {{ formatCurrency(item.total) }}
                </span>
              </li>
            </ul>

            <SQButton
              class="mt-6"
              :loading="accepting && pendingOption === option.name"
              variant="secondary"
              @click="handleAccept(option.name)"
            >
              Accept {{ option.name }}
            </SQButton>
          </article>
        </div>
      </section>

      <section v-else class="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-sm text-slate-600 shadow-sm">
        <p class="font-medium text-slate-700">No SmartProposals yet.</p>
        <p class="mt-2">
          Accept a QuickQuote from your pipeline and we&apos;ll draft Good / Better / Best options automatically.
        </p>
        <p class="mt-4 text-xs text-slate-500">
          Need a demo? We&apos;ve seeded QuoteIQ with sample metrics so you can explore the experience today.
        </p>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { format } from "date-fns";
import SQButton from "@stackquotes/ui/components/SQButton.vue";
import type { Proposal } from "@stackquotes/types";
import { useProposalStore } from "@modules/proposals/stores/proposalStore";

const proposalStore = useProposalStore();
const selectedProposalId = ref<string | null>(null);
const accepting = ref(false);
const pendingOption = ref<string | null>(null);

onMounted(async () => {
  if (!proposalStore.hasData) {
    await proposalStore.load({ limit: 10 });
  }
  if (!proposalStore.hasData) {
    selectedProposalId.value = proposalStore.fallback[0]?.id ?? null;
  }
});

const loading = computed(() => proposalStore.loading);

const activeCollection = computed<Proposal[]>(() => {
  return proposalStore.hasData ? proposalStore.items : proposalStore.fallback;
});

watch(
  activeCollection,
  (collection) => {
    if (!collection.length) {
      selectedProposalId.value = null;
      return;
    }
    if (!selectedProposalId.value || !collection.some((proposal) => proposal.id === selectedProposalId.value)) {
      selectedProposalId.value = collection[0].id;
    }
  },
  { immediate: true }
);

const currentProposal = computed<Proposal | null>(() => {
  return activeCollection.value.find((proposal) => proposal.id === selectedProposalId.value) ?? null;
});

const proposalTitle = computed(() => {
  if (!currentProposal.value) return "";
  if (currentProposal.value.quickquoteId) {
    return `Proposal for QuickQuote ${currentProposal.value.quickquoteId.slice(0, 8).toUpperCase()}`;
  }
  return "Sample SmartProposal";
});

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const formatRelativeDate = (iso: string) => {
  try {
    return format(new Date(iso), "MMM d, yyyy");
  } catch {
    return "recently";
  }
};

const multiplierLabel = (multiplier?: number | null) => {
  if (!multiplier || multiplier === 1) return "Baseline";
  return multiplier > 1 ? `+${Math.round((multiplier - 1) * 100)}%` : `${Math.round((multiplier - 1) * 100)}%`;
};

const defaultSummary = (name: string) => {
  if (name === "Good") return "Lean scope to win price-sensitive projects.";
  if (name === "Best") return "Premium upgrade package to wow your client.";
  return "Balanced option aligned with your QuickQuote baseline.";
};

const statusPillClass = computed(() => {
  const status = currentProposal.value?.status ?? "Generated";
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";
  switch (status.toLowerCase()) {
    case "accepted":
      return `${base} bg-emerald-100 text-emerald-700`;
    case "declined":
      return `${base} bg-rose-100 text-rose-700`;
    default:
      return `${base} bg-slate-100 text-slate-600`;
  }
});

const proposalLabel = (proposal: Proposal) => {
  const date = formatRelativeDate(proposal.createdAt);
  if (proposal.quickquoteId) {
    return `${date} · QQ ${proposal.quickquoteId.slice(0, 6).toUpperCase()}`;
  }
  return `${date} · Demo`;
};

const handleAccept = async (optionName: string) => {
  if (!currentProposal.value) return;
  pendingOption.value = optionName;
  accepting.value = true;
  try {
    if (currentProposal.value.id.startsWith("seed-")) {
      window.alert(`Accepting the ${optionName} package is coming soon in demo mode.`);
      return;
    }
    await proposalStore.markAccepted(currentProposal.value.id, optionName);
    window.alert(`Accepted the ${optionName} option. Client approval workflows launching soon.`);
  } catch (error) {
    console.error(error);
    window.alert("Unable to update proposal. Please try again.");
  } finally {
    accepting.value = false;
    pendingOption.value = null;
  }
};
</script>
