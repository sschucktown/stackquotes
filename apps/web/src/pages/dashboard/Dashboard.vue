<template>
  <div class="min-h-screen">
    <div class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <header class="space-y-1">
        <h1 class="text-2xl font-semibold text-slate-900">Good Afternoon, Contractor</h1>
        <p class="text-sm text-slate-600">Balance your ambition with patience; trust the process.</p>
      </header>

      <!-- Mobile carousel / Desktop grid -->
      <section class="mt-4">
        <div class="flex snap-x snap-mandatory snap-center gap-4 overflow-x-auto px-4 pb-2 scroll-smooth md:grid md:grid-cols-2 md:gap-4 md:px-0">
          <!-- QuickQuotes -->
          <article class="min-w-[85%] snap-center shrink-0 rounded-xl bg-white p-4 shadow-md md:min-w-0 md:snap-none">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-semibold text-slate-900">QuickQuotes</h3>
                <p class="text-sm text-slate-600"><span class="font-semibold">2</span> new quotes today</p>
              </div>
              <span class="rounded-lg bg-brand-50 p-2 text-brand-700"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h7l-1 8 11-12h-7l1-8z"/></svg></span>
            </div>
            <button type="button" class="mt-4 w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-500" @click="go('quickquote-new')">New QuickQuote</button>
          </article>

          <!-- SmartProposals -->
          <article class="min-w-[85%] snap-center shrink-0 rounded-xl bg-white p-4 shadow-md md:min-w-0 md:snap-none">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-semibold text-slate-900">SmartProposals</h3>
                <p class="text-sm text-slate-600"><span class="font-semibold">3</span> awaiting client view</p>
              </div>
              <span class="rounded-lg bg-brand-50 p-2 text-brand-700"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 006.5 22h11A2.5 2.5 0 0020 19.5v-15A2.5 2.5 0 0017.5 2h-11A2.5 2.5 0 004 4.5v15z"/><path d="M8 10h8M8 14h6M8 6h8"/></svg></span>
            </div>
            <button type="button" class="mt-4 w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-500" @click="go('smart-proposals')">View All</button>
          </article>

          <!-- Payments -->
          <article class="min-w-[85%] snap-center shrink-0 rounded-xl bg-white p-4 shadow-md md:min-w-0 md:snap-none">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-semibold text-slate-900">Payments</h3>
                <p class="text-sm text-slate-600"><span class="font-semibold">$9,200</span> received / $2,300 pending</p>
              </div>
              <span class="rounded-lg bg-brand-50 p-2 text-brand-700"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg></span>
            </div>
            <button type="button" class="mt-4 w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-500" @click="go('payments')">Go to Payments</button>
          </article>

          <!-- ProfitPulse -->
          <article class="min-w-[85%] snap-center shrink-0 rounded-xl bg-white p-4 shadow-md md:min-w-0 md:snap-none">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-semibold text-slate-900">ProfitPulse</h3>
                <p class="text-sm text-slate-600"><span class="font-semibold">+18%</span> profit vs last month</p>
              </div>
              <span class="rounded-lg bg-brand-50 p-2 text-brand-700"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 14l4-4 3 3 5-5"/></svg></span>
            </div>
            <button type="button" class="mt-4 w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-500" @click="go('analytics')">View Analytics</button>
          </article>

          <!-- Profile / Settings -->
          <article class="min-w-[85%] snap-center shrink-0 rounded-xl bg-white p-4 shadow-md md:min-w-0 md:snap-none">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-base font-semibold text-slate-900">Profile / Settings</h3>
                <p class="text-sm text-slate-600">Pro Tier · Sync Active</p>
              </div>
              <span class="rounded-lg bg-brand-50 p-2 text-brand-700"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V22a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H2a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06A2 2 0 015.04 3.3l.06.06a1.65 1.65 0 001.82.33H7a1.65 1.65 0 001-1.51V2a2 2 0 014 0v.09a1.65 1.65 0 001 1.51h.02a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00.33 1.82V9c0 .68.27 1.33.75 1.81.48.48 1.13.75 1.81.75H22a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg></span>
            </div>
            <button type="button" class="mt-4 w-full rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50" @click="go('settings')">Manage</button>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
const router = useRouter();
const go = (name: string) => router.push({ name });
</script>

