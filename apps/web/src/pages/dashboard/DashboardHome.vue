<template>
  <div class="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
    <header class="space-y-1">
      <p class="text-sm font-medium text-slate-500">Welcome back</p>
      <h1 class="text-2xl font-semibold text-slate-900">StackQuotes Dashboard</h1>
      <p class="text-sm text-slate-500">
        Track your pipeline, recent activity, and key metrics across QuickQuote and SmartProposal.
      </p>
    </header>

    <section>
      <h2 class="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">Today&apos;s Pulse</h2>
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Active Quotes"
          :value="summary.sentCount"
          subtitle="Sent & awaiting response"
          icon="quotes"
          @click="goTo('quickquote-dashboard')"
        />
        <DashboardCard
          title="Accepted"
          :value="summary.acceptedCount"
          subtitle="Won in the last 30 days"
          icon="check"
          @click="goTo('smart-proposals')"
        />
        <DashboardCard
          title="Money in Motion"
          :currency="summary.moneyInMotion"
          subtitle="Potential revenue on the table"
          icon="cash"
          @click="goTo('quickquote-dashboard')"
        />
        <DashboardCard
          title="Won Revenue"
          :currency="summary.wonValue"
          subtitle="Accepted estimates this month"
          icon="trophy"
          @click="goTo('analytics')"
        />
      </div>
    </section>

    <section class="grid gap-6 lg:grid-cols-3">
      <article class="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
        <header class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-semibold text-slate-900">Pipeline Overview</h2>
            <p class="text-sm text-slate-500">Conversion insights across your sales funnel.</p>
          </div>
          <button
            type="button"
            class="text-sm font-medium text-blue-600 hover:text-blue-500"
            @click="goTo('analytics')"
          >
            View analytics
          </button>
        </header>
        <ul class="grid gap-3 sm:grid-cols-2">
          <li
            v-for="stage in pipeline"
            :key="stage.label"
          >
            <button
              type="button"
              class="flex w-full items-start justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/60"
              @click="goTo(stage.route)"
            >
              <div>
                <p class="text-sm font-medium text-slate-600">{{ stage.label }}</p>
                <p class="text-xs text-slate-400">{{ stage.description }}</p>
              </div>
              <div class="text-right">
                <p class="text-lg font-semibold text-slate-900">{{ stage.value }}</p>
                <p
                  v-if="stage.amount !== undefined"
                  class="text-xs text-slate-500"
                >
                  {{ currency(stage.amount) }}
                </p>
              </div>
            </button>
          </li>
        </ul>
      </article>

      <article class="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <header class="flex items-center justify-between">
          <div>
            <h2 class="text-base font-semibold text-slate-900">Hot Leads</h2>
            <p class="text-sm text-slate-500">Clients you should follow up with next.</p>
          </div>
          <button
            type="button"
            class="text-sm font-medium text-blue-600 hover:text-blue-500"
            @click="goTo('quickquote-dashboard')"
          >
            Manage
          </button>
        </header>
        <ul class="divide-y divide-slate-200">
          <li
            v-for="lead in hotLeads"
            :key="lead.id"
            class="flex items-center justify-between py-3"
          >
            <div>
              <p class="text-sm font-medium text-slate-900">{{ lead.name }}</p>
              <p class="text-xs text-slate-500">{{ lead.email }}</p>
            </div>
            <span class="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
              {{ lead.status }}
            </span>
          </li>
          <li
            v-if="!hotLeads.length"
            class="py-6 text-center text-sm text-slate-500"
          >
            Add clients to see who&apos;s ready for outreach.
          </li>
        </ul>
      </article>
    </section>

    <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <header class="mb-4 flex items-center justify-between">
        <div>
          <h2 class="text-base font-semibold text-slate-900">Recent Activity</h2>
          <p class="text-sm text-slate-500">Latest updates across QuickQuote and SmartProposal.</p>
        </div>
        <button
          type="button"
          class="text-sm font-medium text-blue-600 hover:text-blue-500"
          @click="goTo('analytics')"
        >
          View timeline
        </button>
      </header>

      <ul class="divide-y divide-slate-200">
        <li
          v-for="item in activity"
          :key="item.id"
          class="flex items-start justify-between gap-3 py-3"
        >
          <div class="flex items-start gap-3">
            <span class="mt-1 h-2.5 w-2.5 rounded-full" :class="item.variant" />
            <div>
              <p class="text-sm font-medium text-slate-900">{{ item.title }}</p>
              <p class="text-xs text-slate-500">{{ item.subtitle }}</p>
            </div>
          </div>
          <span class="text-xs text-slate-400">{{ item.timeAgo }}</span>
        </li>
        <li
          v-if="!activity.length"
          class="py-6 text-center text-sm text-slate-500"
        >
          Activity will appear here as you engage clients and send quotes.
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { formatDistanceToNowStrict, isValid, parseISO } from "date-fns";
import DashboardCard from "./components/DashboardCard.vue";
import { useEstimateStore } from "@modules/quickquote/stores/estimateStore";
import { useClientStore } from "@modules/quickquote/stores/clientStore";

const router = useRouter();
const estimateStore = useEstimateStore();
const clientStore = useClientStore();

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const ensureDataLoaded = async () => {
  if (!estimateStore.items.length && !estimateStore.loading) {
    await estimateStore.load();
  }
  if (!clientStore.items.length && !clientStore.loading) {
    await clientStore.load();
  }
};

onMounted(() => {
  void ensureDataLoaded();
});

const summary = computed(() => {
  const sent = estimateStore.items.filter((estimate) => ["sent", "seen"].includes(estimate.status));
  const accepted = estimateStore.items.filter((estimate) => estimate.status === "accepted");
  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - 30);

  const acceptedInWindow = accepted.filter((estimate) => {
    const updated = parseISO(estimate.updatedAt);
    return isValid(updated) ? updated >= windowStart : false;
  });

  const sentValue = sent.reduce((acc, estimate) => acc + estimate.total, 0);
  const acceptedValue = acceptedInWindow.reduce((acc, estimate) => acc + estimate.total, 0);

  return {
    sentCount: sent.length,
    acceptedCount: acceptedInWindow.length,
    moneyInMotion: sentValue,
    wonValue: acceptedValue,
  };
});

const pipeline = computed(() => {
  const draft = estimateStore.items.filter((estimate) => estimate.status === "draft").length;
  const sent = estimateStore.items.filter((estimate) => ["sent", "seen"].includes(estimate.status));
  const accepted = estimateStore.items.filter((estimate) => estimate.status === "accepted").length;
  const declined = estimateStore.items.filter((estimate) => estimate.status === "declined").length;

  return [
    {
      label: "Drafts",
      description: "Quotes in progress",
      value: draft,
      route: "quickquote-dashboard",
    },
    {
      label: "Sent",
      description: "Awaiting client actions",
      value: sent.length,
      amount: sent.reduce((acc, estimate) => acc + estimate.total, 0),
      route: "quickquote-dashboard",
    },
    {
      label: "Accepted",
      description: "Ready for proposals",
      value: accepted,
      route: "smart-proposals",
    },
    {
      label: "Declined",
      description: "Follow up or archive",
      value: declined,
      route: "analytics",
    },
  ];
});

const hotLeads = computed(() => {
  const sentEstimatesByClient = estimateStore.items.filter((estimate) =>
    ["sent", "seen"].includes(estimate.status)
  );
  const map = new Map<
    string,
    {
      count: number;
      lastUpdated: Date | null;
    }
  >();
  for (const estimate of sentEstimatesByClient) {
    const existing = map.get(estimate.clientId);
    const updated = parseISO(estimate.updatedAt);
    const normalized = isValid(updated) ? updated : null;
    if (!existing) {
      map.set(estimate.clientId, { count: 1, lastUpdated: normalized });
    } else {
      existing.count += 1;
      if (normalized && (!existing.lastUpdated || normalized > existing.lastUpdated)) {
        existing.lastUpdated = normalized;
      }
    }
  }

  return clientStore.items
    .map((client) => {
      const overview = map.get(client.id);
      return {
        id: client.id,
        name: client.name,
        email: client.email,
        status: overview ? `${overview.count} open quote${overview.count > 1 ? "s" : ""}` : "New lead",
        lastUpdated: overview?.lastUpdated,
      };
    })
    .sort((a, b) => {
      if (a.lastUpdated && b.lastUpdated) {
        return b.lastUpdated.getTime() - a.lastUpdated.getTime();
      }
      if (a.lastUpdated) return -1;
      if (b.lastUpdated) return 1;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 5);
});

const activity = computed(() => {
  return [...estimateStore.items]
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 6)
    .map((estimate) => {
      const updated = parseISO(estimate.updatedAt);
      const timeAgo = isValid(updated) ? formatDistanceToNowStrict(updated, { addSuffix: true }) : "recently";
      const labelMap: Record<string, { title: string; variant: string }> = {
        draft: { title: "Draft created", variant: "bg-slate-300" },
        sent: { title: "Quote sent", variant: "bg-blue-400" },
        seen: { title: "Quote viewed", variant: "bg-amber-400" },
        accepted: { title: "Quote accepted", variant: "bg-emerald-400" },
        declined: { title: "Quote declined", variant: "bg-rose-400" },
      };
      const meta = labelMap[estimate.status] ?? labelMap.draft;
      return {
        id: estimate.id,
        title: `${meta.title} • ${estimate.projectTitle}`,
        subtitle: `Client: ${estimate.clientId}`,
        timeAgo,
        variant: meta.variant,
      };
    });
});

const goTo = (name: string) => {
  router.push({ name });
};

const currency = (value: number) => currencyFormatter.format(value);
</script>
