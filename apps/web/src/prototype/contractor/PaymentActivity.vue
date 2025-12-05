<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <div class="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
      <header class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div class="space-y-2">
          <div class="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <button
              class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700 shadow-inner transition hover:bg-slate-200"
              @click="emit('close')"
            >
              <span class="text-lg leading-none">&larr;</span>
              <span>Back</span>
            </button>
            <span class="text-slate-400">|</span>
            <span class="font-semibold text-slate-800">Maple St Deck</span>
            <span class="text-slate-400">|</span>
            <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">Payments</span>
          </div>
          <div>
            <h1 class="text-xl font-semibold text-slate-900">Payment Activity</h1>
            <p class="text-sm text-slate-600">Track deposits, refunds, and remaining balance.</p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <div class="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
            <span class="text-slate-500">Remaining Balance:</span>
            <span class="text-slate-900">$17,400</span>
          </div>
          <button class="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700">
            Send Payment Link
          </button>
        </div>
      </header>

      <main class="grid gap-4 md:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)]">
        <!-- Summary column -->
        <div class="order-1 flex flex-col gap-4 md:order-2">
          <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-base font-semibold text-slate-900">Financial Summary</h2>
              <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Maple St Deck</span>
            </div>
            <div class="grid gap-3 sm:grid-cols-3">
              <div
                v-for="stat in summary"
                :key="stat.label"
                class="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-inner"
              >
                <p class="text-xs uppercase tracking-wide text-slate-500">{{ stat.label }}</p>
                <p class="mt-1 text-lg font-semibold text-slate-900">{{ stat.value }}</p>
              </div>
            </div>
          </section>

          <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-2 flex items-center justify-between">
              <h3 class="text-base font-semibold text-slate-900">Next Step</h3>
              <span class="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700 shadow-inner">Reminder</span>
            </div>
            <p class="text-sm text-slate-700">
              Send the remaining balance request after walk-through is complete.
            </p>
            <div class="mt-4 flex flex-wrap gap-2">
              <button class="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700">
                Send Final Payment Link
              </button>
              <button class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                Schedule Reminder
              </button>
            </div>
          </section>

          <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div class="mb-3 flex items-center justify-between">
              <h3 class="text-base font-semibold text-slate-900">Saved Methods</h3>
              <span class="text-xs text-slate-500">Mock UI</span>
            </div>
            <div class="space-y-2">
              <div class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-inner">
                <div class="flex items-center gap-3">
                  <div class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700">
                    CC
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-slate-900">Visa .... 4242</p>
                    <p class="text-xs text-slate-500">Primary</p>
                  </div>
                </div>
                <span class="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700 shadow-inner">Primary</span>
              </div>
              <div class="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div class="flex items-center gap-3">
                  <div class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                    ACH
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-slate-900">ACH - Ending in 9032</p>
                    <p class="text-xs text-slate-500">Stored</p>
                  </div>
                </div>
                <span class="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600 shadow-inner">Default</span>
              </div>
            </div>
          </section>
        </div>

        <!-- Timeline column -->
        <section class="order-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:order-1">
          <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-base font-semibold text-slate-900">Payment Activity</h2>
              <p class="text-sm text-slate-600">Chronological view of deposits, refunds, and balance updates.</p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button
                v-for="filter in filters"
                :key="filter.value"
                class="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition"
                :class="activeFilter === filter.value ? 'bg-slate-900 text-white shadow' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                @click="activeFilter = filter.value"
              >
                {{ filter.label }}
              </button>
              <div v-if="justSynced" class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-inner">
                ✓ Synced to Timeline
              </div>
            </div>
          </div>

          <div class="relative pl-6">
            <div class="absolute top-2 bottom-2 left-3 w-px bg-slate-200"></div>
            <div v-for="event in filteredEvents" :key="event.id" class="relative mb-6 last:mb-0">
              <div
                class="absolute -left-1 top-2 h-3 w-3 rounded-full shadow-sm"
                :class="dotClass(event.category)"
              ></div>
              <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-150 hover:-translate-y-0.5 hover:shadow-md">
                <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div class="flex items-start gap-3">
                    <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-700">
                      <component :is="iconFor(event.category)" class="h-5 w-5" />
                    </div>
                    <div class="space-y-1">
                      <div class="flex flex-wrap items-center gap-2">
                        <p class="text-sm font-semibold text-slate-900">{{ event.title }}</p>
                        <span class="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                          {{ event.type }}
                        </span>
                      </div>
                      <div class="flex items-center gap-2 text-xs text-slate-500">
                        <span>{{ event.time }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="flex flex-col items-end gap-2 sm:items-end">
                    <p class="text-sm font-semibold text-slate-900">{{ event.amount }}</p>
                    <span
                      class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      :class="statusClass(event.status)"
                    >
                      {{ event.status }}
                    </span>
                  </div>
                </div>
                <p class="mt-3 text-sm text-slate-700">{{ event.description }}</p>
                <div class="mt-3 flex flex-wrap gap-2">
                  <button
                    class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-inner transition hover:-translate-y-0.5 hover:bg-blue-100"
                    @click="triggerSync(event.amount)"
                  >
                    Mark Deposit Received
                  </button>
                  <button
                    class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
                    @click="triggerSync(event.amount, 'Payment Succeeded')"
                  >
                    Payment Succeeded
                  </button>
                  <button
                    class="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 shadow-inner transition hover:-translate-y-0.5 hover:bg-amber-100"
                    @click="triggerSync(event.amount, 'Offline Payment Recorded')"
                  >
                    Record Offline Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>

    <div class="sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur">
      <div class="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div class="text-sm font-semibold text-slate-800">Quick Actions</div>
        <div class="flex flex-wrap items-center gap-2">
          <button class="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700">
            Send Payment Link
          </button>
          <button class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
            Record Offline Payment
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, ref } from "vue";
import { addTimelineEvent } from "./usePrototypeEvents";

const emit = defineEmits<{
  (e: "close"): void;
}>();

type PaymentEvent = {
  id: string;
  title: string;
  type: string;
  category: "deposit" | "link" | "reminder" | "refund" | "failed" | "payout";
  amount: string;
  status: "Completed" | "Sent" | "Scheduled" | "Failed";
  time: string;
  description: string;
};

type SummaryStat = {
  label: string;
  value: string;
};

const summary: SummaryStat[] = [
  { label: "Contract Amount", value: "$19,800" },
  { label: "Paid to Date", value: "$2,400" },
  { label: "Remaining Balance", value: "$17,400" }
];

const filters = [
  { value: "all", label: "All" },
  { value: "deposit", label: "Deposits" },
  { value: "refund", label: "Refunds" },
  { value: "failed", label: "Failed" },
  { value: "payout", label: "Payouts" }
] as const;

const events = ref<PaymentEvent[]>([
  {
    id: "evt-1",
    title: "Deposit payment received",
    type: "Deposit",
    category: "deposit",
    amount: "$2,400",
    status: "Completed",
    time: "Jun 27, 2025 - 4:12 PM",
    description: "Paid via card - Auth code 59328 - Email receipt sent."
  },
  {
    id: "evt-2",
    title: "Payment link sent",
    type: "Payment Link",
    category: "link",
    amount: "$2,400",
    status: "Sent",
    time: "Jun 27, 2025 - 4:07 PM",
    description: "Deposit request link sent to Sarah Thompson."
  },
  {
    id: "evt-3",
    title: "Auto reminder scheduled",
    type: "Reminder",
    category: "reminder",
    amount: "--",
    status: "Scheduled",
    time: "Jun 26, 2025 - 9:15 AM",
    description: "1-day reminder if payment not completed."
  },
  {
    id: "evt-4",
    title: "Partial refund",
    type: "Refund",
    category: "refund",
    amount: "-$250",
    status: "Completed",
    time: "Jun 24, 2025 - 2:03 PM",
    description: "Material change credit."
  },
  {
    id: "evt-5",
    title: "Failed payment attempt",
    type: "Payment Attempt",
    category: "failed",
    amount: "$2,400",
    status: "Failed",
    time: "Jun 23, 2025 - 5:38 PM",
    description: "Card declined - Insufficient funds."
  }
]);

const activeFilter = ref<typeof filters[number]["value"]>("all");
const justSynced = ref(false);
const justSynced = ref(false);

const filteredEvents = computed(() => {
  if (activeFilter.value === "all") return events.value;
  if (activeFilter.value === "deposit") {
    return events.value.filter((event) => event.category === "deposit" || event.category === "link");
  }
  return events.value.filter((event) => event.category === activeFilter.value);
});

const triggerSync = (amount = "$2,400", title = "Payment Received") => {
  addTimelineEvent({
    id: `sync-${Date.now()}`,
    type: "payment",
    title,
    description: "Synced from Payment Activity (prototype)",
    amount,
    time: "Just now",
    method: "Card .... 4242",
    meta: "Payment"
  });
  justSynced.value = true;
  setTimeout(() => {
    justSynced.value = false;
  }, 1200);
};

function syncTimeline(amount = "$2,400") {
  addTimelineEvent({
    id: `sync-${Date.now()}`,
    type: "payment",
    title: "Payment Received",
    amount,
    description: "Synced from Payment Activity (prototype)",
    time: "Just now",
    method: "Card •••• 4242"
  });
  justSynced.value = true;
  setTimeout(() => {
    justSynced.value = false;
  }, 1200);
}

const dotClass = (category: PaymentEvent["category"]) => {
  if (category === "deposit" || category === "link") return "bg-blue-500";
  if (category === "reminder") return "bg-slate-400";
  if (category === "refund") return "bg-rose-500";
  if (category === "failed") return "bg-red-500";
  if (category === "payout") return "bg-emerald-500";
  return "bg-slate-400";
};

const statusClass = (status: PaymentEvent["status"]) => {
  if (status === "Completed") return "bg-emerald-50 text-emerald-700 border border-emerald-100";
  if (status === "Sent") return "bg-blue-50 text-blue-700 border border-blue-100";
  if (status === "Scheduled") return "bg-slate-100 text-slate-700 border border-slate-200";
  if (status === "Failed") return "bg-red-50 text-red-700 border border-red-100";
  return "bg-slate-100 text-slate-700 border border-slate-200";
};

const iconFor = (category: PaymentEvent["category"]) => {
  if (category === "deposit" || category === "payout") {
    return {
      render() {
        return h("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", class: "h-5 w-5", fill: "none", stroke: "currentColor", "stroke-width": 1.8, "stroke-linecap": "round", "stroke-linejoin": "round" }, [
          h("rect", { x: 2, y: 5, width: 20, height: 14, rx: 2 }),
          h("path", { d: "M2 10h20" }),
          h("path", { d: "M6 15h2" }),
          h("path", { d: "M10 15h2" })
        ]);
      }
    };
  }
  if (category === "link") {
    return {
      render() {
        return h("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", class: "h-5 w-5", fill: "none", stroke: "currentColor", "stroke-width": 1.8, "stroke-linecap": "round", "stroke-linejoin": "round" }, [
          h("path", { d: "M10 13a5 5 0 0 1 0-7l1.17-1.17a4 4 0 0 1 5.66 5.66L16 11" }),
          h("path", { d: "M14 11a5 5 0 0 1 0 7l-1.17 1.17a4 4 0 1 1-5.66-5.66L8 13" })
        ]);
      }
    };
  }
  if (category === "reminder") {
    return {
      render() {
        return h("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", class: "h-5 w-5", fill: "none", stroke: "currentColor", "stroke-width": 1.8, "stroke-linecap": "round", "stroke-linejoin": "round" }, [
          h("circle", { cx: 12, cy: 12, r: 8 }),
          h("path", { d: "M12 8v4l2.5 2.5" })
        ]);
      }
    };
  }
  if (category === "refund") {
    return {
      render() {
        return h("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", class: "h-5 w-5", fill: "none", stroke: "currentColor", "stroke-width": 1.8, "stroke-linecap": "round", "stroke-linejoin": "round" }, [
          h("path", { d: "M3 12a9 9 0 1 0 9-9" }),
          h("path", { d: "M3 12h9" }),
          h("path", { d: "m3 12 3 3" }),
          h("path", { d: "m3 12 3-3" })
        ]);
      }
    };
  }
  if (category === "failed") {
    return {
      render() {
        return h("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", class: "h-5 w-5", fill: "none", stroke: "currentColor", "stroke-width": 1.8, "stroke-linecap": "round", "stroke-linejoin": "round" }, [
          h("path", { d: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" }),
          h("path", { d: "M12 9v4" }),
          h("path", { d: "M12 17h.01" })
        ]);
      }
    };
  }
  return {
    render() {
      return h("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", class: "h-5 w-5", fill: "none", stroke: "currentColor", "stroke-width": 1.8, "stroke-linecap": "round", "stroke-linejoin": "round" }, [
        h("circle", { cx: 12, cy: 12, r: 9 }),
        h("path", { d: "M12 7v5l3 3" })
      ]);
    }
  };
};
</script>
