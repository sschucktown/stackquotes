<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8">
      <header class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Welcome back</p>
        <h1 class="text-3xl font-semibold text-slate-900">StackQuotes Dashboard</h1>
        <p class="text-sm text-slate-600">Your daily pulse - quotes, wins, and insights at a glance.</p>
      </header>

      <transition name="fade">
        <div
          v-if="showSeedingBanner"
          class="rounded-3xl border border-blue-200 bg-blue-50/80 p-5 text-sm text-blue-700 shadow-sm"
        >
          <p class="text-sm font-semibold text-blue-900">Loading starter projects...</p>
          <p class="mt-1">
            We're generating SmartProposals for {{ onboardingTradeLabel }} jobs. Hang tight - your workspace will be ready
            in a moment.
          </p>
        </div>
      </transition>

      <section class="rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-slate-100">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500">Today&apos;s Pulse</h2>
          <SQButton
            class="hidden items-center gap-2 !bg-[#3A7D99] !px-4 !py-2 !text-white text-xs font-medium transition-all duration-200 hover:-translate-y-0.5 hover:!bg-[#4f8faa] focus-visible:ring-[#3A7D99]/60 md:flex"
            @click="createEstimate"
          >
            + New QuickQuote
          </SQButton>
        </div>
        <div v-if="isLoading" class="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div v-for="skeleton in 4" :key="`metric-skeleton-${skeleton}`" class="h-32 rounded-xl bg-slate-100 animate-pulse" />
        </div>
        <TransitionGroup
          v-else
          name="fade-up"
          tag="div"
          class="mt-4 flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-4"
        >
          <button
            v-for="card in metricsCards"
            :key="card.title"
            type="button"
            class="group relative min-w-[16rem] rounded-xl border p-6 text-left shadow-sm transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md focus:outline-none md:min-w-0"
            :class="[card.surface, card.border]"
            @click="goTo(card.route)"
          >
            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ card.title }}</p>
                <p class="mt-2 text-3xl font-semibold text-slate-900">
                  <span v-if="card.isCurrency">{{ currency(card.value) }}</span>
                  <span v-else>{{ card.value.toLocaleString() }}</span>
                </p>
                <p class="mt-1 text-xs text-slate-600">{{ card.subtitle }}</p>
              </div>
              <div
                class="rounded-lg bg-white/80 p-2 text-slate-600 shadow-sm transition-transform duration-200 group-hover:-translate-y-1"
              >
                <component :is="card.icon" class="h-5 w-5" />
              </div>
            </div>
          </button>
        </TransitionGroup>
      </section>

      <section
        v-if="starterProjectsLoading || starterProjects.length"
        class="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm"
      >
        <header class="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Starter Library</p>
            <h2 class="text-base font-semibold text-slate-900">Projects seeded for you</h2>
          </div>
        </header>
        <div v-if="starterProjectsLoading" class="grid gap-4 md:grid-cols-3">
          <div v-for="n in 3" :key="`starter-skeleton-${n}`" class="h-32 rounded-2xl bg-slate-100 animate-pulse" />
        </div>
        <div v-else-if="starterProjects.length" class="grid gap-4 md:grid-cols-3">
          <article
            v-for="project in starterProjects"
            :key="project.id"
            class="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div>
              <p class="text-xs uppercase tracking-wide text-slate-500">{{ project.trade }}</p>
              <h3 class="mt-1 text-lg font-semibold text-slate-900">{{ project.projectName }}</h3>
              <p v-if="project.description" class="mt-1 text-sm text-slate-600">{{ project.description }}</p>
            </div>
            <div class="mt-4 space-y-2 text-xs text-slate-500">
              <p v-if="project.basePrice">Baseline: {{ currency(project.basePrice ?? 0) }}</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="proposal in project.proposals"
                  :key="proposal.id"
                  class="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-600"
                >
                  <span class="font-semibold text-slate-800">{{ proposal.tier }}</span>
                  <span v-if="proposal.totalPrice">- {{ currency(proposal.totalPrice ?? 0) }}</span>
                </span>
              </div>
            </div>
          </article>
        </div>
        <p v-else class="text-sm text-slate-500">
          Starter content will appear as soon as seeding finishes.
        </p>
      </section>

      <section class="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <article class="space-y-4 rounded-3xl bg-slate-50/80 p-6 shadow-sm ring-1 ring-slate-100">
          <header class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="text-base font-semibold text-slate-900">Pipeline Overview</h2>
              <p class="text-sm text-slate-600">Conversion insights across your sales funnel.</p>
            </div>
            <button
              type="button"
              class="flex items-center gap-1 text-sm font-medium text-[#3A7D99] transition hover:text-[#4f8faa]"
              @click="goTo('analytics')"
            >
              View analytics
              <ChevronRight class="h-4 w-4" />
            </button>
          </header>

          <div v-if="isLoading" class="space-y-4">
            <div v-for="skeleton in 4" :key="`pipeline-skeleton-${skeleton}`" class="h-20 rounded-xl bg-white/70 animate-pulse" />
          </div>
          <ul v-else class="grid gap-4 sm:grid-cols-2">
            <li v-for="stage in pipeline" :key="stage.label">
              <button
                type="button"
                class="group flex w-full flex-col gap-3 rounded-xl border border-slate-200 bg-white/80 p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                :title="stage.tooltip"
                @click="goTo(stage.route)"
              >
                <div class="flex items-start justify-between">
                  <div>
                    <p class="text-sm font-semibold text-slate-800">{{ stage.label }}</p>
                    <p class="text-xs uppercase tracking-wide text-slate-500">{{ stage.description }}</p>
                  </div>
                  <p class="text-xl font-semibold text-slate-900">{{ stage.value.toLocaleString() }}</p>
                </div>
                <div class="w-full rounded-full bg-slate-100">
                  <div
                    class="h-2 rounded-full transition-all duration-300"
                    :class="stage.barClass"
                    :style="{ width: `${stage.progress}%` }"
                  />
                </div>
                <div class="flex items-center justify-between text-xs text-slate-500">
                  <span>{{ stage.statusDetail }}</span>
                  <span v-if="stage.amount !== undefined">{{ currency(stage.amount) }}</span>
                </div>
              </button>
            </li>
          </ul>
        </article>

        <aside class="space-y-4">
          <article class="space-y-4 rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-slate-100">
            <header class="flex items-center justify-between">
              <div>
                <h2 class="text-base font-semibold text-slate-900">Hot Leads</h2>
                <p class="text-sm text-slate-600">Clients you should follow up with next.</p>
              </div>
              <button
                type="button"
                class="text-sm font-medium text-[#3A7D99] transition hover:text-[#4f8faa]"
                @click="goTo('quickquote-dashboard')"
              >
                Manage
              </button>
            </header>
            <ul v-if="isLoading" class="space-y-3">
              <li v-for="skeleton in 3" :key="`lead-skeleton-${skeleton}`" class="h-16 rounded-xl bg-slate-100 animate-pulse" />
            </ul>
            <ul v-else class="space-y-3">
              <li
                v-for="(lead, index) in hotLeads"
                :key="lead.id"
                class="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <div class="flex items-center gap-3">
                  <span
                    class="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold"
                    :class="avatarPalette[index % avatarPalette.length]"
                  >
                    {{ lead.initials }}
                  </span>
                  <div>
                    <p class="text-sm font-semibold text-slate-900">{{ lead.name }}</p>
                    <p class="text-xs text-slate-500">{{ lead.email }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="rounded-full px-2.5 py-1 text-xs font-medium" :class="lead.badgeClass">
                    {{ lead.statusLabel }}
                  </span>
                  <SQButton
                    variant="secondary"
                    class="hidden !bg-white !px-3 !py-1.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm sm:flex"
                    @click="goTo('quickquote-dashboard')"
                  >
                    Follow Up
                    <ArrowRight class="ml-1 h-3.5 w-3.5" />
                  </SQButton>
                </div>
              </li>
              <li v-if="!hotLeads.length" class="rounded-xl border border-dashed border-slate-200 bg-white/60 p-6 text-center text-sm text-slate-500">
                Add clients to see who&apos;s ready for outreach.
              </li>
            </ul>
          </article>

          <article
            v-if="showInsights"
            class="space-y-3 rounded-3xl bg-slate-50 p-6 shadow-sm ring-1 ring-slate-100"
          >
            <div class="flex items-center gap-2">
              <span class="rounded-full bg-white p-2 text-[#3A7D99] shadow-sm">
                <Brain class="h-5 w-5" />
              </span>
              <div>
                <p class="text-sm font-semibold text-slate-900">AI Insights</p>
                <p class="text-xs text-slate-500">Your performance at a glance.</p>
              </div>
            </div>
            <ul class="space-y-3 text-sm text-slate-600">
              <li v-for="insight in insights" :key="insight.id" class="rounded-lg bg-white/70 p-3 ring-1 ring-slate-100">
                <p class="font-medium text-slate-800">{{ insight.title }}</p>
                <p class="mt-1 text-xs text-slate-500">{{ insight.detail }}</p>
              </li>
            </ul>
          </article>
        </aside>
      </section>

      <section class="rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-slate-100">
        <header class="mb-4 flex items-center justify-between">
          <div>
            <h2 class="text-base font-semibold text-slate-900">Recent Activity</h2>
            <p class="text-sm text-slate-600">Latest updates across QuickQuote and SmartProposal.</p>
          </div>
          <button
            type="button"
            class="flex items-center gap-1 text-sm font-medium text-[#3A7D99] transition hover:text-[#4f8faa]"
            @click="goTo('analytics')"
          >
            View timeline
            <ChevronRight class="h-4 w-4" />
          </button>
        </header>

        <div v-if="isLoading" class="space-y-3">
          <div v-for="skeleton in 5" :key="`activity-skeleton-${skeleton}`" class="h-16 rounded-xl bg-slate-100 animate-pulse" />
        </div>
        <div v-else class="relative">
          <div class="absolute left-[1.2rem] top-0 h-full w-px bg-slate-200" />
          <TransitionGroup name="fade-up" tag="ul" class="space-y-5">
            <li
              v-for="item in activity"
              :key="item.id"
              class="relative pl-16"
              :title="item.timestampFull"
            >
              <span
                class="absolute left-4 top-1 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow ring-1 ring-slate-100"
              >
                <component :is="item.icon" class="h-4.5 w-4.5" :class="item.iconColor" />
              </span>
              <div class="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
                <p class="text-sm font-semibold text-slate-900">{{ item.title }}</p>
                <p class="mt-1 text-xs text-slate-500">{{ item.subtitle }}</p>
                <p class="mt-2 text-xs font-medium uppercase tracking-wide text-slate-400">{{ item.timeAgo }}</p>
              </div>
            </li>
          </TransitionGroup>
          <p v-if="!activity.length" class="py-6 text-center text-sm text-slate-500">
            Activity will appear here as you engage clients and send quotes.
          </p>
        </div>
      </section>
    </div>

    <SQButton
      class="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full !bg-[#3A7D99] !text-white shadow-lg transition-all duration-200 hover:-translate-y-1 hover:!bg-[#4f8faa] focus-visible:ring-[#3A7D99]/60 md:hidden"
      @click="createEstimate"
    >
      +
    </SQButton>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { format, formatDistanceToNowStrict, isValid, parseISO } from "date-fns";
import { useTransition, TransitionPresets } from "@vueuse/core";
import { storeToRefs } from "pinia";
import SQButton from "@stackquotes/ui/components/SQButton.vue";
import {
  ClipboardList,
  CheckCircle2,
  DollarSign,
  Trophy,
  ChevronRight,
  ArrowRight,
  FileText,
  Send,
  Eye,
  Check,
  XCircle,
  Brain,
} from "lucide-vue-next";
import { useEstimateStore } from "@modules/quickquote/stores/estimateStore";
import { useClientStore } from "@modules/quickquote/stores/clientStore";
import { useContractorProfileStore } from "@modules/contractor/stores/profileStore";
import { useStarterProjectsStore } from "@modules/contractor/stores/starterProjectsStore";

const router = useRouter();
const estimateStore = useEstimateStore();
const clientStore = useClientStore();
const profileStore = useContractorProfileStore();
const starterProjectsStore = useStarterProjectsStore();
const { items: starterProjects, loading: starterProjectsLoading } = storeToRefs(starterProjectsStore);

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
  if (!profileStore.profile && !profileStore.loading) {
    await profileStore.load();
  }
};

const ensureStarterProjectsLoaded = async (force = false) => {
  if (starterProjectsLoading.value) return;
  if (!force && starterProjects.value.length) return;
  await starterProjectsStore.load(force);
};

onMounted(() => {
  void ensureDataLoaded();
  void ensureStarterProjectsLoaded();
});

watch(
  () => profileStore.profile?.tradeSeeded,
  (seeded, previous) => {
    if (seeded && !previous) {
      void ensureStarterProjectsLoaded(true);
    }
  }
);

const isLoading = computed(() => estimateStore.loading || clientStore.loading);

const showSeedingBanner = computed(() => {
  if (profileStore.isDemo) return false;
  const profile = profileStore.profile;
  if (!profile) return false;
  return Boolean(profile.trade) && profile.tradeSeeded === false;
});

const onboardingTradeLabel = computed(() => profileStore.profile?.trade ?? "your trade");

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

const seenCount = computed(() => estimateStore.items.filter((estimate) => estimate.status === "seen").length);
const declinedValue = computed(() =>
  estimateStore.items
    .filter((estimate) => estimate.status === "declined")
    .reduce((acc, estimate) => acc + estimate.total, 0)
);

const activeQuotesAnimated = useTransition(
  computed(() => summary.value.sentCount),
  { duration: 600, transition: TransitionPresets.easeOutExpo }
);
const acceptedAnimated = useTransition(
  computed(() => summary.value.acceptedCount),
  { duration: 600, transition: TransitionPresets.easeOutExpo }
);
const moneyAnimated = useTransition(
  computed(() => summary.value.moneyInMotion),
  { duration: 600, transition: TransitionPresets.easeOutExpo }
);
const wonAnimated = useTransition(
  computed(() => summary.value.wonValue),
  { duration: 600, transition: TransitionPresets.easeOutExpo }
);

const metricsCards = computed(() => [
  {
    title: "Active Quotes",
    subtitle: "Sent & awaiting response",
    value: Math.round(activeQuotesAnimated.value ?? summary.value.sentCount ?? 0),
    isCurrency: false,
    icon: ClipboardList,
    surface: "bg-blue-50",
    border: "border-blue-200",
    route: "quickquote-dashboard",
  },
  {
    title: "Accepted",
    subtitle: "Won in the last 30 days",
    value: Math.round(acceptedAnimated.value ?? summary.value.acceptedCount ?? 0),
    isCurrency: false,
    icon: CheckCircle2,
    surface: "bg-emerald-50",
    border: "border-emerald-200",
    route: "smart-proposals",
  },
  {
    title: "Money in Motion",
    subtitle: "Potential revenue on the table",
    value: Math.round(moneyAnimated.value ?? summary.value.moneyInMotion ?? 0),
    isCurrency: true,
    icon: DollarSign,
    surface: "bg-amber-50",
    border: "border-amber-200",
    route: "quickquote-dashboard",
  },
  {
    title: "Won Revenue",
    subtitle: "Accepted estimates this month",
    value: Math.round(wonAnimated.value ?? summary.value.wonValue ?? 0),
    isCurrency: true,
    icon: Trophy,
    surface: "bg-indigo-50",
    border: "border-indigo-200",
    route: "analytics",
  },
]);

const pipeline = computed(() => {
  const total = Math.max(estimateStore.items.length, 1);
  const draft = estimateStore.items.filter((estimate) => estimate.status === "draft");
  const sent = estimateStore.items.filter((estimate) => ["sent", "seen"].includes(estimate.status));
  const accepted = estimateStore.items.filter((estimate) => estimate.status === "accepted");
  const declined = estimateStore.items.filter((estimate) => estimate.status === "declined");

  return [
    {
      label: "Drafts",
      description: "Quotes in progress",
      value: draft.length,
      progress: Math.min(100, Math.round((draft.length / total) * 100)),
      barClass: "bg-slate-400",
      statusDetail: `${draft.length} in draft`,
      amount: undefined,
      tooltip: `${draft.length} draft quotes ready for polish`,
      route: "quickquote-dashboard",
    },
    {
      label: "Sent",
      description: "Awaiting client action",
      value: sent.length,
      progress: Math.min(100, Math.round((sent.length / total) * 100)),
      barClass: "bg-blue-400",
      statusDetail: `${seenCount.value} viewed`,
      amount: summary.value.moneyInMotion,
      tooltip: `${seenCount.value} of ${sent.length || 0} sent quotes viewed`,
      route: "quickquote-dashboard",
    },
    {
      label: "Accepted",
      description: "Ready for proposals",
      value: accepted.length,
      progress: Math.min(100, Math.round((accepted.length / total) * 100)),
      barClass: "bg-emerald-500",
      statusDetail: `${accepted.length} wins`,
      amount: summary.value.wonValue,
      tooltip: "Trigger SmartProposals from accepted quotes",
      route: "smart-proposals",
    },
    {
      label: "Declined",
      description: "Follow up or archive",
      value: declined.length,
      progress: Math.min(100, Math.round((declined.length / total) * 100)),
      barClass: "bg-rose-400",
      statusDetail: `${declined.length} lost`,
      amount: declinedValue.value,
      tooltip: "Re-engage declined opportunities with a new angle",
      route: "analytics",
    },
  ];
});

const avatarPalette = ["bg-blue-100 text-blue-700", "bg-emerald-100 text-emerald-700", "bg-indigo-100 text-indigo-700", "bg-amber-100 text-amber-700"];

const hotLeads = computed(() => {
  const sentEstimates = estimateStore.items.filter((estimate) => ["sent", "seen"].includes(estimate.status));
  const overview = new Map<
    string,
    {
      count: number;
      lastUpdated: Date | null;
    }
  >();

  for (const estimate of sentEstimates) {
    const updated = parseISO(estimate.updatedAt);
    const normalized = isValid(updated) ? updated : null;
    const current = overview.get(estimate.clientId);
    if (!current) {
      overview.set(estimate.clientId, { count: 1, lastUpdated: normalized });
    } else {
      current.count += 1;
      if (normalized && (!current.lastUpdated || normalized > current.lastUpdated)) {
        current.lastUpdated = normalized;
      }
    }
  }

  return clientStore.items
    .map((client) => {
      const snapshot = overview.get(client.id);
      const statusLabel = snapshot ? `${snapshot.count} open quote${snapshot.count > 1 ? "s" : ""}` : "New lead";
      const initials = client.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");
      return {
        id: client.id,
        name: client.name,
        email: client.email,
        initials: initials || client.name.charAt(0).toUpperCase(),
        badgeClass: snapshot ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700",
        statusLabel,
        lastUpdated: snapshot?.lastUpdated ?? null,
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

const activityIconMap: Record<
  string,
  {
    icon: typeof FileText;
    color: string;
    label: string;
  }
> = {
  draft: { icon: FileText, color: "text-slate-500", label: "Draft created" },
  sent: { icon: Send, color: "text-blue-500", label: "Quote sent" },
  seen: { icon: Eye, color: "text-amber-500", label: "Quote viewed" },
  accepted: { icon: Check, color: "text-emerald-500", label: "Quote accepted" },
  declined: { icon: XCircle, color: "text-rose-500", label: "Quote declined" },
};

const activity = computed(() => {
  return [...estimateStore.items]
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
    .slice(0, 6)
    .map((estimate) => {
      const updated = parseISO(estimate.updatedAt);
      const timeAgo = isValid(updated) ? formatDistanceToNowStrict(updated, { addSuffix: true }) : "recently";
      const iconMeta = activityIconMap[estimate.status] ?? activityIconMap.draft;
      return {
        id: estimate.id,
        title: `${iconMeta.label} • ${estimate.projectTitle}`,
        subtitle: `Client: ${estimate.clientId}`,
        timeAgo,
        timestampFull: isValid(updated) ? format(updated, "PPpp") : "",
        icon: iconMeta.icon,
        iconColor: iconMeta.color,
      };
    });
});

const insights = computed(() => {
  const totalSent = summary.value.sentCount;
  const totalAccepted = summary.value.acceptedCount;
  const acceptanceRate = totalSent ? Math.round((totalAccepted / totalSent) * 100) : null;
  const averageAccepted = totalAccepted ? summary.value.wonValue / totalAccepted : null;

  if (!estimateStore.items.length) {
    return [
      {
        id: "getting-started",
        title: "Share your first QuickQuote",
        detail: "Send a quote to unlock instant insights and SmartProposal automation.",
      },
    ];
  }

  return [
    {
      id: "close-rate",
      title: acceptanceRate !== null ? "Your close rate is trending up" : "Measure your close rate",
      detail:
        acceptanceRate !== null
          ? `Close rate sits at ${acceptanceRate}% over the last 30 days. keep the momentum going.`
          : "Send and mark a few quotes to start tracking your conversion rate.",
    },
    {
      id: "avg-quote",
      title: "Average accepted quote",
      detail:
        averageAccepted && averageAccepted > 0
          ? `Average accepted quote is ${currency(averageAccepted)} (+6% vs last week).`
          : "Once a quote is accepted we’ll surface your average win value here.",
    },
  ];
});

const showInsights = computed(() => insights.value.length > 0);

const goTo = (name: string) => {
  router.push({ name });
};

const createEstimate = () => {
  router.push("/quickquotes/new");
};

const currency = (value: number) => currencyFormatter.format(value || 0);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.3s ease;
}
.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active,
  .fade-up-enter-active,
  .fade-up-leave-active {
    transition: none !important;
  }
  .fade-enter-from,
  .fade-leave-to,
  .fade-up-enter-from,
  .fade-up-leave-to {
    transform: none !important;
  }
}
</style>
