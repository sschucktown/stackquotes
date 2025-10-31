<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { DocumentDuplicateIcon, DocumentTextIcon, BanknotesIcon, ChartBarIcon, Cog6ToothIcon } from "@heroicons/vue/24/outline";
import { useEstimateStore } from "@modules/quickquote/stores/estimateStore";

const router = useRouter();
const estimateStore = useEstimateStore();

const todayNewQuotes = computed(() => {
  try {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return estimateStore.items.filter((e) => new Date(e.createdAt) >= start).length;
  } catch {
    return 2;
  }
});

const smartProposalsAwaiting = computed(() => 3);
const paymentsSummary = computed(() => ({ received: 9200, pending: 2300 }));
const profitChange = computed(() => 18);

const go = (name: string) => router.push({ name });
</script>

<template>
  <section class="relative">
    <div class="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-[#F8F9FA] to-transparent md:hidden" />
    <div class="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-[#F8F9FA] to-transparent md:hidden" />

    <div
      class="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-3"
      style="scrollbar-width: none; -ms-overflow-style: none;"
    >
      <style scoped>
      ::-webkit-scrollbar { display: none; }
      </style>

      <article
        class="snap-start shrink-0 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:shrink md:w-auto"
        style="width: 90vw; max-width: 420px;"
      >
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-base font-semibold text-slate-900">QuickQuotes</h3>
            <p class="text-sm text-slate-600"><span class="font-semibold">{{ todayNewQuotes }}</span> new quotes today</p>
          </div>
          <span class="rounded-lg bg-brand-50 p-2 text-brand-700"><DocumentDuplicateIcon class="h-5 w-5" /></span>
        </div>
        <button
          type="button"
          class="mt-4 w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-500"
          @click="go('quickquote-new')"
        >
          New QuickQuote
        </button>
      </article>

      <article class="snap-start shrink-0 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:shrink md:w-auto" style="width: 90vw; max-width: 420px;">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-base font-semibold text-slate-900">SmartProposals</h3>
            <p class="text-sm text-slate-600"><span class="font-semibold">{{ smartProposalsAwaiting }}</span> awaiting client view</p>
          </div>
          <span class="rounded-lg bg-brand-50 p-2 text-brand-700"><DocumentTextIcon class="h-5 w-5" /></span>
        </div>
        <button type="button" class="mt-4 w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-500" @click="go('smart-proposals')">View All</button>
      </article>

      <article class="snap-start shrink-0 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:shrink md:w-auto" style="width: 90vw; max-width: 420px;">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-base font-semibold text-slate-900">Payments</h3>
            <p class="text-sm text-slate-600">
              <span class="font-semibold">${{ paymentsSummary.received.toLocaleString() }}</span> received
              / ${{ paymentsSummary.pending.toLocaleString() }} pending
            </p>
          </div>
          <span class="rounded-lg bg-brand-50 p-2 text-brand-700"><BanknotesIcon class="h-5 w-5" /></span>
        </div>
        <button type="button" class="mt-4 w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-500" @click="go('payments')">Go to Payments</button>
      </article>

      <article class="snap-start shrink-0 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:shrink md:w-auto" style="width: 90vw; max-width: 420px;">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-base font-semibold text-slate-900">ProfitPulse</h3>
            <p class="text-sm text-slate-600"><span class="font-semibold">+{{ profitChange }}%</span> vs last month</p>
          </div>
          <span class="rounded-lg bg-brand-50 p-2 text-brand-700"><ChartBarIcon class="h-5 w-5" /></span>
        </div>
        <button type="button" class="mt-4 w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-500" @click="go('analytics')">View Analytics</button>
      </article>

      <article class="snap-start shrink-0 rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 md:shrink md:w-auto" style="width: 90vw; max-width: 320px;">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-base font-semibold text-slate-900">Profile</h3>
            <p class="text-sm text-slate-600">Pro Tier · Sync Active</p>
          </div>
          <span class="rounded-lg bg-brand-50 p-2 text-brand-700"><Cog6ToothIcon class="h-5 w-5" /></span>
        </div>
        <button type="button" class="mt-4 w-full rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50" @click="go('settings')">Manage</button>
      </article>
    </div>
  </section>
</template>

