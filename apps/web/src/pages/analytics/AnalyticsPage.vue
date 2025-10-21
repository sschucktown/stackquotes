<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header class="rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-slate-100 transition-all duration-200">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">QuoteIQ</p>
        <h1 class="text-2xl font-semibold text-slate-900">Analytics Dashboard</h1>
        <p class="mt-1 text-sm text-slate-600">
          Track how SmartProposals perform after every QuickQuote acceptance. Metrics update as soon as proposals are generated or accepted.
        </p>
      </header>

      <section class="grid gap-4 md:grid-cols-4">
        <template v-if="isLoading">
          <div v-for="n in 4" :key="`metric-skeleton-${n}`" class="h-32 rounded-2xl bg-white/60 shadow-sm ring-1 ring-slate-100 animate-pulse" />
        </template>
        <template v-else>
          <TransitionGroup name="fade-up" tag="div" class="contents">
            <article
              v-for="card in metricCards"
              :key="card.title"
              class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <p class="text-xs uppercase tracking-wide text-slate-500">{{ card.title }}</p>
              <p class="mt-2 text-3xl font-semibold text-slate-900">
                <span v-if="card.format === 'currency'">{{ formatCurrency(card.value) }}</span>
                <span v-else-if="card.format === 'percent'">{{ card.value }}%</span>
                <span v-else>{{ card.value }}</span>
              </p>
              <p class="mt-1 text-xs text-slate-500">{{ card.subtitle }}</p>
            </article>
          </TransitionGroup>
        </template>
      </section>

      <section class="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div class="rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-slate-100 transition-all duration-200">
          <header class="flex items-center justify-between">
            <div>
              <p class="text-xs uppercase tracking-wide text-slate-500">Pipeline snapshot</p>
              <h2 class="text-lg font-semibold text-slate-900">Latest SmartProposals</h2>
            </div>
            <span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">Updated {{ metrics.lastUpdated }}</span>
          </header>
          <div v-if="isLoading" class="mt-6 space-y-3">
            <div v-for="n in 4" :key="`list-skeleton-${n}`" class="h-16 rounded-xl bg-slate-100 animate-pulse" />
          </div>
          <TransitionGroup v-else name="fade-up" tag="ul" class="mt-6 divide-y divide-slate-100">
            <li
              v-for="proposal in recentProposals"
              :key="proposal.id"
              class="flex items-center justify-between gap-4 py-3"
            >
              <div>
                <p class="text-sm font-medium text-slate-800">{{ displayProposalLabel(proposal) }}</p>
                <p class="text-xs text-slate-500">
                  {{ proposal.status }} · {{ formatDate(proposal.createdAt) }}
                </p>
              </div>
              <span class="text-sm font-semibold text-slate-900">{{ formatCurrency(highestProposalValue(proposal)) }}</span>
            </li>
          </TransitionGroup>
          <p v-if="!recentProposals.length && !isLoading" class="mt-4 text-sm text-slate-500">
            Accept a QuickQuote to generate your first SmartProposal and unlock live analytics.
          </p>
        </div>

        <aside class="rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-slate-100 transition-all duration-200">
          <p class="text-xs uppercase tracking-wide text-slate-500">Business summary</p>
          <h2 class="mt-1 text-lg font-semibold text-slate-900">
            {{ profileStore.profile?.businessName || "Your business" }}
          </h2>
          <p class="mt-2 text-sm text-slate-600">
            {{ profileStore.profile?.tradeType || "Add your trade type" }} · {{ profileLocation }}
          </p>
          <div class="mt-4 space-y-3 text-sm text-slate-600">
            <p v-if="profileStore.profile?.email"><span class="font-medium text-slate-800">Email:</span> {{ profileStore.profile.email }}</p>
            <p v-if="profileStore.profile?.phone"><span class="font-medium text-slate-800">Phone:</span> {{ profileStore.profile.phone }}</p>
            <p class="text-xs text-slate-500">
              Keep your contractor profile current to personalize SmartProposals, PDFs, and analytics exports.
            </p>
          </div>
        </aside>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import type { Proposal } from "@stackquotes/types";
import { useProposalStore } from "@modules/proposals/stores/proposalStore";
import { useContractorProfileStore } from "@modules/contractor/stores/profileStore";
import { format } from "date-fns";

const proposalStore = useProposalStore();
const profileStore = useContractorProfileStore();

onMounted(() => {
  void proposalStore.load({ limit: 25 });
  void profileStore.load();
});

const isLoading = computed(() => proposalStore.loading);

const seedMetrics = {
  totalProposals: 5,
  acceptedCount: 2,
  acceptanceRate: 40,
  averageValue: 9500,
  revenueYtd: 19000,
  lastUpdated: "Oct 2, 2025",
};

const seedProposalsList: Proposal[] = [
  {
    id: "seed-proposal-a",
    userId: "demo-user",
    clientId: "seed-client-a",
    quickquoteId: "demo-001",
    title: "Kitchen Remodel",
    status: "draft",
    acceptedOption: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18).toISOString(),
    options: [],
    totals: [
      { name: "Good", total: 7800 },
      { name: "Better", total: 9000 },
      { name: "Best", total: 9600 },
    ],
  },
  {
    id: "seed-proposal-b",
    userId: "demo-user",
    clientId: "seed-client-b",
    quickquoteId: "demo-002",
    title: "Deck Expansion",
    status: "accepted",
    acceptedOption: "Best",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 17).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    options: [],
    totals: [
      { name: "Good", total: 8000 },
      { name: "Better", total: 9200 },
      { name: "Best", total: 9800 },
    ],
  },
  {
    id: "seed-proposal-c",
    userId: "demo-user",
    clientId: "seed-client-c",
    quickquoteId: "demo-003",
    title: "Basement Finish",
    status: "accepted",
    acceptedOption: "Best",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    options: [],
    totals: [
      { name: "Good", total: 7400 },
      { name: "Better", total: 8600 },
      { name: "Best", total: 9200 },
    ],
  },
  {
    id: "seed-proposal-d",
    userId: "demo-user",
    clientId: "seed-client-d",
    quickquoteId: "demo-004",
    title: "Exterior Refresh",
    status: "draft",
    acceptedOption: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    options: [],
    totals: [
      { name: "Good", total: 6800 },
      { name: "Better", total: 8100 },
      { name: "Best", total: 8700 },
    ],
  },
  {
    id: "seed-proposal-e",
    userId: "demo-user",
    clientId: "seed-client-e",
    quickquoteId: "demo-005",
    title: "Patio Upgrade",
    status: "draft",
    acceptedOption: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    options: [],
    totals: [
      { name: "Good", total: 6400 },
      { name: "Better", total: 7600 },
      { name: "Best", total: 8200 },
    ],
  },
];

const proposals = computed<Proposal[]>(() => (proposalStore.hasData ? proposalStore.items : seedProposalsList));

const acceptedProposals = computed(() => proposals.value.filter((proposal) => proposal.status?.toLowerCase() === "accepted"));

const highestProposalValue = (proposal: Proposal) => {
  if (proposal.totals?.length) {
    return proposal.totals.reduce<number>((max, entry) => Math.max(max, entry.total), 0);
  }
  if (proposal.options?.length) {
    return proposal.options.reduce<number>((max, option) => Math.max(max, option.subtotal), 0);
  }
  return 0;
};

const acceptedProposalValue = (proposal: Proposal) => {
  if (proposal.acceptedOption) {
    const totalsMatch = proposal.totals?.find((entry) => entry.name.toLowerCase() === proposal.acceptedOption?.toLowerCase());
    if (totalsMatch) return totalsMatch.total;
    const optionMatch = proposal.options?.find((option) => option.name.toLowerCase() === proposal.acceptedOption?.toLowerCase());
    if (optionMatch) return optionMatch.subtotal;
  }
  return highestProposalValue(proposal);
};

const metrics = computed(() => {
  const total = proposals.value.length;
  if (!total) {
    return seedMetrics;
  }
  const acceptedCount = acceptedProposals.value.length;
  const totalValue = proposals.value.reduce((sum, proposal) => sum + highestProposalValue(proposal), 0);
  const revenue = acceptedProposals.value.reduce((sum, proposal) => sum + acceptedProposalValue(proposal), 0);
  return {
    totalProposals: total,
    acceptedCount,
    acceptanceRate: total ? Math.round((acceptedCount / total) * 100) : 0,
    averageValue: total ? Math.round(totalValue / total) : 0,
    revenueYtd: revenue,
    lastUpdated: formatDate(proposals.value[0]?.createdAt ?? new Date().toISOString()),
  };
});

const metricCards = computed(() => [
  {
    title: "Total Proposals",
    value: metrics.value.totalProposals,
    subtitle: "Generated from accepted QuickQuotes",
    format: "number" as const,
  },
  {
    title: "Acceptance Rate",
    value: metrics.value.acceptanceRate,
    subtitle: `${metrics.value.acceptedCount} of ${metrics.value.totalProposals} accepted`,
    format: "percent" as const,
  },
  {
    title: "Average Proposal Value",
    value: metrics.value.averageValue,
    subtitle: "Highest option per proposal",
    format: "currency" as const,
  },
  {
    title: "Revenue (YTD)",
    value: metrics.value.revenueYtd,
    subtitle: "Accepted SmartProposals",
    format: "currency" as const,
  },
]);

const recentProposals = computed(() => proposals.value.slice(0, 5));

const profileLocation = computed(() => {
  const city = profileStore.profile?.city;
  const state = profileStore.profile?.state;
  if (!city && !state) return "Update your location";
  return [city, state].filter(Boolean).join(", ");
});

const formatCurrency = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value || 0);

function formatDate(iso: string): string {
  try {
    return format(new Date(iso), "MMM d, yyyy");
  } catch {
    return "recently";
  }
}

const displayProposalLabel = (proposal: Proposal) => {
  if (proposal.quickquoteId) {
    return `QuickQuote ${proposal.quickquoteId.slice(0, 6).toUpperCase()}`;
  }
  return "Demo SmartProposal";
};
</script>

<style scoped>
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.25s ease;
}
.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (prefers-reduced-motion: reduce) {
  .fade-up-enter-active,
  .fade-up-leave-active {
    transition: none !important;
  }
  .fade-up-enter-from,
  .fade-up-leave-to {
    transform: none !important;
  }
}
</style>



