<template>
  <div class="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
    <header class="space-y-1">
      <h1 class="text-2xl font-semibold text-slate-900">QuoteIQ Analytics</h1>
      <p class="text-sm text-slate-500">
        Track how SmartProposals perform after every QuickQuote acceptance. Metrics update the moment proposals are generated or accepted.
      </p>
    </header>

    <section class="grid gap-4 md:grid-cols-4">
      <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p class="text-xs uppercase tracking-wide text-slate-500">Total Proposals</p>
        <p class="mt-2 text-3xl font-semibold text-slate-900">{{ metrics.totalProposals }}</p>
        <p class="mt-1 text-xs text-slate-500">Generated from accepted QuickQuotes</p>
      </article>
      <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p class="text-xs uppercase tracking-wide text-slate-500">Acceptance Rate</p>
        <p class="mt-2 text-3xl font-semibold text-slate-900">{{ metrics.acceptanceRate }}%</p>
        <p class="mt-1 text-xs text-slate-500">{{ metrics.acceptedCount }} of {{ metrics.totalProposals }} accepted</p>
      </article>
      <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p class="text-xs uppercase tracking-wide text-slate-500">Average Proposal Value</p>
        <p class="mt-2 text-3xl font-semibold text-slate-900">
          {{ formatCurrency(metrics.averageValue) }}
        </p>
        <p class="mt-1 text-xs text-slate-500">Highest option per proposal</p>
      </article>
      <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p class="text-xs uppercase tracking-wide text-slate-500">Revenue (YTD)</p>
        <p class="mt-2 text-3xl font-semibold text-slate-900">
          {{ formatCurrency(metrics.revenueYtd) }}
        </p>
        <p class="mt-1 text-xs text-slate-500">Accepted SmartProposals</p>
      </article>
    </section>

    <section class="grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <header class="flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-wide text-slate-500">Pipeline Snapshot</p>
            <h2 class="text-lg font-semibold text-slate-900">Latest SmartProposals</h2>
          </div>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
            Updated {{ metrics.lastUpdated }}
          </span>
        </header>
        <ul class="mt-6 divide-y divide-slate-100">
          <li
            v-for="proposal in recentProposals"
            :key="proposal.id"
            class="flex items-center justify-between gap-4 py-3"
          >
            <div>
              <p class="text-sm font-medium text-slate-800">
                {{ displayProposalLabel(proposal) }}
              </p>
              <p class="text-xs text-slate-500">
                {{ proposal.status }} &middot; {{ formatDate(proposal.createdAt) }}
              </p>
            </div>
            <span class="text-sm font-semibold text-slate-900">
              {{ formatCurrency(highestProposalValue(proposal)) }}
            </span>
          </li>
        </ul>
        <p v-if="!recentProposals.length" class="mt-4 text-sm text-slate-500">
          Accept a QuickQuote to generate your first SmartProposal and unlock live analytics.
        </p>
      </div>

      <aside class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p class="text-xs uppercase tracking-wide text-slate-500">Business Summary</p>
        <h2 class="mt-1 text-lg font-semibold text-slate-900">
          {{ profileStore.profile?.businessName || "Your business" }}
        </h2>
        <p class="mt-2 text-sm text-slate-600">
          {{ profileStore.profile?.tradeType || "Add your trade type" }} &middot;
          {{ profileLocation }}
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
  void proposalStore.load({ limit: 20 });
  void profileStore.load();
});

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
    quickquoteId: "demo-001",
    status: "Generated",
    acceptedOption: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(),
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
    quickquoteId: "demo-002",
    status: "Accepted",
    acceptedOption: "Best",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 17).toISOString(),
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
    quickquoteId: "demo-003",
    status: "Accepted",
    acceptedOption: "Best",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
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
    quickquoteId: "demo-004",
    status: "Generated",
    acceptedOption: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
    options: [],
    totals: [
      { name: "Good", total: 8100 },
      { name: "Better", total: 9300 },
      { name: "Best", total: 9900 },
    ],
  },
  {
    id: "seed-proposal-e",
    userId: "demo-user",
    quickquoteId: "demo-005",
    status: "Generated",
    acceptedOption: null,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    options: [],
    totals: [
      { name: "Good", total: 7200 },
      { name: "Better", total: 8400 },
      { name: "Best", total: 9000 },
    ],
  },
];

const proposals = computed<Proposal[]>(() =>
  proposalStore.hasData ? proposalStore.items : seedProposalsList
);

const acceptedProposals = computed(() =>
  proposals.value.filter((proposal) => proposal.status?.toLowerCase() === "accepted")
);

const highestProposalValue = (proposal: Proposal) => {
  if (proposal.totals?.length) {
    return proposal.totals.reduce((max, entry) => Math.max(max, entry.total), 0);
  }
  if (proposal.options?.length) {
    return proposal.options.reduce((max, option) => Math.max(max, option.subtotal), 0);
  }
  return 0;
};

const acceptedProposalValue = (proposal: Proposal) => {
  if (proposal.acceptedOption) {
    const totalsMatch = proposal.totals?.find(
      (entry) => entry.name.toLowerCase() === proposal.acceptedOption?.toLowerCase()
    );
    if (totalsMatch) {
      return totalsMatch.total;
    }
    const optionMatch = proposal.options?.find(
      (option) => option.name.toLowerCase() === proposal.acceptedOption?.toLowerCase()
    );
    if (optionMatch) {
      return optionMatch.subtotal;
    }
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
  const revenue = acceptedProposals.value.reduce(
    (sum, proposal) => sum + acceptedProposalValue(proposal),
    0
  );
  return {
    totalProposals: total,
    acceptedCount,
    acceptanceRate: total ? Math.round((acceptedCount / total) * 100) : 0,
    averageValue: total ? totalValue / total : 0,
    revenueYtd: revenue,
    lastUpdated: formatDate(proposals.value[0]?.createdAt ?? new Date().toISOString()),
  };
});

const recentProposals = computed(() => proposals.value.slice(0, 5));

const profileLocation = computed(() => {
  const city = profileStore.profile?.city;
  const state = profileStore.profile?.state;
  if (!city && !state) return "Update your location";
  return [city, state].filter(Boolean).join(", ");
});

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value || 0);

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
