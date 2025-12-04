<script setup lang="ts">
import ProposalCommentsFab from "@/components/proposals/ProposalCommentsFab.vue";

const contractor = {
  name: "Northstar Deck & Fence",
  trade: "Outdoor Living Contractor",
  license: "License #SQ-29475",
  avatar:
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80",
  badge: "Licensed / Insured / Local",
};

const gallery = [
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
];

const inclusions = [
  "Labor and standard materials",
  "Disposal of debris",
  "Basic site preparation",
  "Final walkthrough + cleanup",
  "Project support from our team",
];

const addOns = [
  "Premium composite materials",
  "Built-in lighting",
  "Permitting assistance",
  "Additional structural work (if needed)",
];

const steps = [
  {
    title: "Review your estimate",
    detail: "Confirm the range looks right for your project.",
  },
  {
    title: "Schedule an on-site visit",
    detail: "We measure, verify access, and talk through materials.",
  },
  {
    title: "Receive your final proposal",
    detail: "Lock in the scope, price, and schedule with confidence.",
  },
];
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <div class="mx-auto flex min-h-screen max-w-3xl flex-col px-4 pb-28 pt-8 sm:px-6 lg:px-0">
      <!-- Hero -->
      <section
        class="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-50 shadow-[0_4px_18px_rgba(0,0,0,0.10)]"
      >
        <div class="p-6 sm:p-8 space-y-5">
          <div class="flex items-start justify-between gap-6">
            <div class="space-y-2">
              <p class="text-[11px] uppercase tracking-[0.2em] text-slate-300">QuickQuote Portal</p>
              <h1 class="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                Your QuickQuote Estimate
              </h1>
              <p class="text-sm leading-relaxed text-slate-200">
                For Jordan Miller | Fast estimate based on your project details
              </p>
            </div>

            <div class="flex items-center gap-3 rounded-2xl bg-slate-800/60 px-3 py-2 shadow-inner">
              <img
                :src="contractor.avatar"
                alt="Contractor"
                class="h-10 w-10 rounded-xl object-cover ring-2 ring-white/10"
              />
              <div class="space-y-0.5 text-right">
                <p class="text-[11px] uppercase tracking-[0.18em] text-slate-300">Contractor</p>
                <p class="text-sm font-semibold text-slate-50">{{ contractor.name }}</p>
                <p class="text-xs text-slate-300">{{ contractor.trade }}</p>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 text-xs text-slate-200">
            <span class="rounded-full bg-slate-800/80 px-3 py-1 shadow-sm">
              {{ contractor.badge }}
            </span>
            <span class="rounded-full bg-slate-800/80 px-3 py-1 shadow-sm">
              Estimate prepared today
            </span>
            <span class="rounded-full bg-blue-600 px-3 py-1 font-semibold shadow-sm">10 min review</span>
          </div>
        </div>
      </section>

      <div class="my-6 h-px w-full bg-slate-200/70"></div>

      <!-- Gallery -->
      <section class="space-y-4">
        <div>
          <h2 class="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 mb-2">Photos & Inspiration</h2>
          <p class="text-sm text-slate-500 mb-2">A quick visual benchmark to align on finish level.</p>
        </div>
        <div class="relative">
          <div class="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-slate-50 to-transparent"></div>
          <div class="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-slate-50 to-transparent"></div>
          <div class="flex gap-3 snap-x snap-mandatory overflow-x-auto overscroll-x-contain sm:gap-4">
            <div
              v-for="url in gallery"
              :key="url"
              class="h-28 w-48 shrink-0 snap-start overflow-hidden rounded-lg bg-slate-200 border border-slate-200/70 transition-all duration-300 ease-out sm:h-32 sm:w-56 sm:rounded-2xl sm:shadow-md sm:hover:-translate-y-1 sm:hover:shadow-lg"
            >
              <div class="relative h-full w-full">
                <img :src="url" alt="Project inspiration" class="h-full w-full object-cover" />
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Price Snapshot -->
      <section class="mt-12 space-y-4">
        <div>
          <h2 class="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 mb-2">Estimated Project Range</h2>
          <p class="text-sm text-slate-500 mb-4">Lightweight snapshot so you can decide the next step quickly.</p>
        </div>
        <div
          class="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm shadow-sm sm:rounded-3xl sm:p-8 sm:shadow-md"
        >
          <div class="flex flex-wrap items-center gap-4">
            <div>
              <p class="text-[11px] font-semibold tracking-wide text-slate-500 uppercase sm:text-xs">Range</p>
              <p class="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl sm:font-bold">
                $9,800 - $14,900
              </p>
            </div>
            <span
              class="ml-auto inline-flex items-center rounded-full bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm sm:px-4 sm:py-2 sm:text-xs sm:shadow-md"
            >
              QuickQuote preview
            </span>
          </div>
          <p class="text-sm leading-relaxed text-slate-600">
            Final price depends on material choice, access, and build complexity.
          </p>
          <p class="text-xs text-slate-500">We refine this during the on-site visit - no obligation until you approve.</p>
        </div>
      </section>

      <!-- Lists -->
      <section class="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:rounded-2xl sm:p-6">
          <p class="text-sm font-semibold text-slate-900">What’s Included</p>
          <p class="mt-1 text-sm text-slate-500">A streamlined scope to get started.</p>
          <ul class="mt-4 space-y-2 text-sm leading-relaxed text-slate-700">
            <li v-for="item in inclusions" :key="item" class="flex gap-2">
              <span class="mt-[6px] h-[6px] w-[6px] flex-none rounded-full bg-slate-300" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:rounded-2xl sm:p-6">
          <p class="text-sm font-semibold text-slate-900">Possible Add-Ons</p>
          <p class="mt-1 text-sm text-slate-500">Upgrade ideas if you want more.</p>
          <ul class="mt-4 space-y-2 text-sm leading-relaxed text-slate-700">
            <li v-for="item in addOns" :key="item" class="flex gap-2">
              <span class="mt-[6px] h-[6px] w-[6px] flex-none rounded-full bg-slate-300" />
              <span>{{ item }}</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- Next Steps -->
      <section class="mt-12 space-y-4">
        <div>
          <h2 class="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 mb-2">Next Steps</h2>
          <p class="text-sm text-slate-500 mb-2">A simple 3-step glidepath from estimate to proposal.</p>
        </div>
        <div class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm shadow-sm sm:rounded-2xl sm:p-7">
          <div v-for="(step, index) in steps" :key="step.title" class="flex gap-4">
            <div class="flex flex-col items-center">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white shadow-sm"
              >
                {{ index + 1 }}
              </div>
              <div v-if="index < steps.length - 1" class="mt-1 h-full w-px flex-1 bg-slate-200/80" />
            </div>
            <div class="flex-1 space-y-1">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ step.title }}</p>
              <p class="text-sm leading-relaxed text-slate-700">{{ step.detail }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="mt-12 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <p class="text-base font-semibold text-slate-900">Ready to move forward?</p>
        <p class="mt-2 text-sm text-slate-600">Schedule a quick visit so we can finalize the proposal together.</p>
        <div class="mt-6 flex flex-col items-center gap-3">
          <button
            type="button"
            class="inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto sm:text-base"
          >
            Schedule On-Site Visit
          </button>
          <button type="button" class="text-sm font-medium text-blue-700 hover:text-blue-800">
            Ask a question
          </button>
        </div>
      </section>

      <!-- Contractor Footer -->
      <footer class="mt-12 space-y-3 pb-4">
        <div class="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm">
          <div class="h-12 w-12 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
            <img :src="contractor.avatar" alt="Brand logo" class="h-full w-full object-cover" />
          </div>
          <div class="space-y-1">
            <p class="text-sm font-semibold text-slate-900">{{ contractor.name }}</p>
            <p class="text-sm leading-relaxed text-slate-700">{{ contractor.trade }}</p>
            <p class="text-xs text-slate-500">{{ contractor.license }}</p>
          </div>
        </div>
        <p class="mt-4 text-center text-[0.72rem] text-slate-400">
          Powered by StackQuotes - quickquote portal prototype
        </p>
      </footer>
    </div>

    <ProposalCommentsFab proposal-id="quickquote-prototype" :contractor-name="contractor.name" />
  </div>
</template>
