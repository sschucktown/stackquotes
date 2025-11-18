<script setup lang="ts">
import { computed, ref } from "vue";
import { useContractorProfileStore } from "@/modules/contractor/stores/profileStore";
import { useEstimateStore } from "@/modules/quickquote/stores/estimateStore";
import CarouselModule, {
  type CarouselItem,
} from "@/components/dashboard/CarouselModule.vue";
import SummaryBand from "@/components/dashboard/SummaryBand.vue";
import ActionCenterModule from "@/components/dashboard/ActionCenterModule.vue";
import ActionCenter from "@/components/dashboard/ActionCenter.vue";
import AiInsightsWidget from "@/components/dashboard/AiInsightsWidget.vue";

const props = defineProps<{
  openProposals: number;
  pendingDeposits: number;
  closeRate: number; // 0..1
  overdueMilestones?: number;
  grossPaymentsMonth?: number;
  paymentItems: CarouselItem[];
  proposalItems: CarouselItem[];
  quickQuoteItems: CarouselItem[];
  snapshot: {
    latest_payments: Array<{
      id: string;
      amount: number;
      type: string;
      status: string;
      created_at: string;
      proposal_title?: string | null;
    }>;
    gross_margin: number;
    total_revenue: number;
    total_cost: number;
  };
  generatedAt: string | null;
  loading?: boolean;
  error?: string | null;
  focusOnly?: boolean;
  insightsSeenNotAccepted: number;
}>();

const emit = defineEmits<{
  (e: "filter", key: "proposals" | "deposits" | "close"): void;
  (e: "card-click", item: CarouselItem): void;
  (e: "nudge", item: CarouselItem): void;
  (e: "delete", item: CarouselItem): void;
  (e: "insights-cta"): void;
  (e: "retry"): void;
}>();

// Onboarding gate: controls Action Center visibility
const profileStore = useContractorProfileStore();
const estimateStore = useEstimateStore();
const profileComplete = computed(() => {
  const p: any = profileStore.profile;
  if (!p) return false;
  return Boolean(p.businessName && p.phone && p.email);
});
const stripeConnected = computed(
  () => (profileStore.profile as any)?.stripeAccountStatus === "active",
);
const quickQuotesCount = computed(() => estimateStore.items.length);
const skipFlag = ref(
  typeof window !== "undefined" &&
    (window.localStorage.getItem("onboarding_skipped") === "1" ||
      window.localStorage.getItem("onboarding_skipped") === "true")
    ? 1
    : 0,
);
const onboardingSkipped = computed(() =>
  Boolean((profileStore.profile as any)?.onboarding_skipped),
);
const showActionCenter = computed(
  () =>
    Boolean(skipFlag.value) ||
    onboardingSkipped.value ||
    (profileComplete.value && stripeConnected.value && quickQuotesCount.value > 0),
);

// If any starter task remains incomplete, we can bring the cards back
const needsStarterTasks = computed(
  () =>
    !profileComplete.value ||
    !stripeConnected.value ||
    quickQuotesCount.value === 0,
);

const showAttentionBar = computed(() => {
  const viewed = props.proposalItems.filter(
    (i) => i.stage === "viewed",
  ).length;
  return (
    props.pendingDeposits > 0 || props.openProposals > 0 || viewed > 0
  );
});

const attentionMessage = computed(() => {
  const parts: string[] = [];
  const deposits = props.pendingDeposits;
  const viewed = props.proposalItems.filter(
    (i) => i.stage === "viewed",
  ).length;

  if (deposits > 0) {
    parts.push(
      `${deposits} deposit${deposits === 1 ? "" : "s"} pending`,
    );
  }
  if (viewed > 0) {
    parts.push(
      `${viewed} client${viewed === 1 ? "" : "s"} viewed your quote`,
    );
  }
  if (!parts.length && props.openProposals > 0) {
    parts.push(
      `${props.openProposals} open proposal${props.openProposals === 1 ? "" : "s"}`,
    );
  }

  return parts.join(" · ");
});

const currency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value || 0);

const timeAgo = (iso?: string | null) => {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.round(ms / 60000));
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  return `${hours} hr ago`;
};

const colorMapPayments: Record<string, string> = {
  deposit_pending: "amber-500",
  deposit_received: "sky-400",
  final_due: "rose-500",
  paid: "emerald-500",
};
const colorMapProposals: Record<string, string> = {
  unsent: "slate-500",
  sent: "indigo-500",
  viewed: "indigo-400",
  accepted: "emerald-500",
};
const colorMapQuotes: Record<string, string> = {
  draft: "slate-500",
  ready_to_convert: "indigo-500",
  converted: "emerald-500",
};

const displayType = (t?: string | null) => {
  const v = (t || "").toString().toLowerCase();
  if (v === "deposit") return "Deposit";
  if (v === "upsell") return "Upsell";
  if (v === "installment") return "Installment";
  return "Payment";
};

const displayStatus = (s?: string | null) => {
  const v = (s || "").toString().toLowerCase();
  if (v === "succeeded" || v === "paid") return "Paid";
  if (v === "pending" || v === "processing") return "Pending";
  if (v === "failed" || v === "canceled" || v === "cancelled") return "Failed";
  return v ? v.charAt(0).toUpperCase() + v.slice(1) : "Status";
};

// Track starter (setup) cards from ActionCenter to coordinate with ActionCenterModule
const starterVisible = ref(0);
const starterTotal = ref(0);
const onVisibleCount = (p: { visible: number; total: number }) => {
  starterVisible.value = p.visible;
  starterTotal.value = p.total;
};

// Allow user to bring back Getting Started cards if previously skipped
const resumeGettingStarted = async () => {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("onboarding_skipped");
    }
    try {
      await profileStore.save({ onboarding_skipped: false } as any);
    } catch {
      // ignore
    }
  } finally {
    skipFlag.value = 0;
  }
};

// Hide ProfitPulse snapshot for brand new users with no activity
const showProfitPulse = computed(() => {
  const pay = Array.isArray(props.paymentItems)
    ? props.paymentItems.length
    : 0;
  const prop = Array.isArray(props.proposalItems)
    ? props.proposalItems.length
    : 0;
  const qq = Array.isArray(props.quickQuoteItems)
    ? props.quickQuoteItems.length
    : 0;
  return pay + prop + qq > 0;
});
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <header class="text-slate-900">
        <h1 class="text-2xl font-semibold">Command Center</h1>
        <p class="text-sm opacity-80">Show exactly what needs attention.</p>
      </header>

      <transition name="fade-up">
        <div
          v-if="showAttentionBar"
          class="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 ring-1 ring-amber-200"
        >
          {{ attentionMessage }}
        </div>
      </transition>

      <SummaryBand
        :open-proposals="openProposals"
        :pending-deposits="pendingDeposits"
        :close-rate="closeRate"
        :overdue-milestones="overdueMilestones"
        :gross-payments-month="grossPaymentsMonth"
      />

      <section class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        <div class="space-y-6">
          <ActionCenterModule
            :show-action-center="showActionCenter"
            :needs-starter-tasks="needsStarterTasks"
            :starter-visible="starterVisible"
            :starter-total="starterTotal"
            @resume="resumeGettingStarted"
          >
            <ActionCenter @visible-count="onVisibleCount" @skipped="resumeGettingStarted" />
          </ActionCenterModule>

          <div class="h-px bg-gradient-to-r from-slate-800/0 via-slate-800/40 to-slate-800/0" />

          <!-- Payments -->
          <CarouselModule
            v-if="paymentItems.length"
            title="Payments"
            :items="paymentItems"
            :stages="['deposit_pending', 'deposit_received', 'final_due', 'paid']"
            :color-map="colorMapPayments"
            kind="payments"
            :focus-only="focusOnly"
            :focus-stages="['deposit_pending', 'final_due']"
            @card-click="$emit('card-click', $event)"
          />

          <div class="h-px bg-gradient-to-r from-slate-800/0 via-slate-800/40 to-slate-800/0" />

          <!-- Proposals -->
          <CarouselModule
            v-if="proposalItems.length"
            title="Proposals"
            :items="proposalItems"
            :stages="['unsent', 'sent', 'viewed', 'accepted']"
            :color-map="colorMapProposals"
            kind="proposals"
            :focus-only="focusOnly"
            :focus-stages="['sent', 'viewed']"
            @card-click="$emit('card-click', $event)"
            @nudge="$emit('nudge', $event)"
          />

          <div class="h-px bg-gradient-to-r from-slate-800/0 via-slate-800/40 to-slate-800/0" />

          <!-- QuickQuotes -->
          <CarouselModule
            v-if="quickQuoteItems.length"
            title="QuickQuotes"
            :items="quickQuoteItems"
            :stages="['draft', 'ready_to_convert', 'converted']"
            :color-map="colorMapQuotes"
            kind="quickquotes"
            :focus-only="focusOnly"
            :focus-stages="['ready_to_convert']"
            @card-click="$emit('card-click', $event)"
            @delete="$emit('delete', $event)"
          />

          <div class="h-px bg-gradient-to-r from-slate-800/0 via-slate-800/40 to-slate-800/0" />

          <!-- ProfitPulse snapshot -->
          <article
            v-if="showProfitPulse"
            class="rounded-3xl bg-white/95 p-4 shadow-sm ring-1 ring-black/5"
          >
            <h3 class="text-sm font-semibold text-slate-900">
              ProfitPulse
            </h3>
            <div class="mt-2 grid gap-4 md:grid-cols-2">
              <div class="rounded-xl bg-slate-50 p-4">
                <p class="text-xs uppercase tracking-wide text-slate-500">
                  Gross Profit Margin
                </p>
                <p class="mt-1 text-3xl font-semibold text-slate-900">
                  {{ snapshot.gross_margin }}%
                </p>
                <p
                  v-if="generatedAt"
                  class="mt-1 text-xs text-slate-500"
                >
                  Updated {{ timeAgo(generatedAt) }}
                </p>
                <p class="mt-2 text-xs text-slate-500">
                  Revenue:
                  <span class="font-medium text-slate-700">
                    {{ currency(snapshot.total_revenue) }}
                  </span>
                  Cost:
                  <span class="font-medium text-slate-700">
                    {{ currency(snapshot.total_cost) }}
                  </span>
                </p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-wide text-slate-500">
                  Last 5 Payments
                </p>
                <ul
                  class="mt-2 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white"
                >
                  <li
                    v-for="p in snapshot.latest_payments"
                    :key="p.id"
                    class="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                  >
                    <div class="min-w-0">
                      <p class="font-medium text-slate-800">
                        {{ currency(p.amount) }}
                      </p>
                      <div
                        class="mt-1 flex flex-wrap items-center gap-1.5"
                      >
                        <span
                          class="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                        >
                          {{ displayType(p.type) }}
                        </span>
                        <span
                          class="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                        >
                          {{ displayStatus(p.status) }}
                        </span>
                        <span class="text-[11px] text-slate-500">
                          {{ timeAgo(p.created_at) }}
                        </span>
                      </div>
                      <p
                        v-if="p.proposal_title"
                        class="mt-0.5 truncate text-xs text-slate-400"
                      >
                        {{ p.proposal_title }}
                      </p>
                    </div>
                  </li>
                  <li
                    v-if="!snapshot.latest_payments.length"
                    class="px-3 py-3 text-xs text-slate-500"
                  >
                    No payments yet.
                  </li>
                </ul>
              </div>
            </div>
          </article>

          <div class="h-px bg-gradient-to-r from-slate-800/0 via-slate-800/40 to-slate-800/0" />
          <AiInsightsWidget
            :seen-not-accepted="insightsSeenNotAccepted"
            @cta="$emit('insights-cta')"
          />
        </div>

        <!-- Loading and Error States -->
        <section v-if="loading || error" class="space-y-6">
          <div v-if="loading" class="grid gap-3">
            <div
              class="animate-pulse rounded-2xl bg-slate-100 p-6 ring-1 ring-slate-200"
            />
            <div
              class="animate-pulse rounded-2xl bg-slate-100 p-16 ring-1 ring-slate-200"
            />
            <div
              class="animate-pulse rounded-2xl bg-slate-100 p-16 ring-1 ring-slate-200"
            />
            <div
              class="animate-pulse rounded-2xl bg-slate-100 p-10 ring-1 ring-slate-200"
            />
          </div>
          <div
            v-else
            class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900"
          >
            <p class="text-sm font-semibold">
              We couldn't load your summary
            </p>
            <p v-if="error" class="mt-1 text-sm opacity-80">
              {{ error }}
            </p>
            <div class="mt-3 flex gap-2">
              <button
                type="button"
                class="rounded-md bg-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-800 hover:bg-slate-300"
                @click="$emit('filter', 'proposals')"
              >
                Dismiss
              </button>
              <button
                type="button"
                class="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-500"
                @click="$emit('retry')"
              >
                Retry
              </button>
            </div>
          </div>
        </section>
      </section>
    </div>
  </div>
</template>

<style scoped>
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 200ms ease;
}
.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>

