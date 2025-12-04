<script setup lang="ts">
import { reactive, ref } from "vue";
import QuickQuoteCommentsFab from "./QuickQuoteCommentsFab.vue";

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
    title: "Review your estimate and confirm it matches your project goals.",
    detail: "Look over the range and make sure it aligns with what you want to build.",
  },
  {
    title: "We measure, verify access, and walk through materials.",
    detail: "On-site visit to confirm layout, access, and the material options you prefer.",
  },
  {
    title: "Your final proposal includes Good/Better/Best options tailored for you.",
    detail: "We finalize price, timeline, and scope so you can approve with confidence.",
  },
];

const fabRef = ref<InstanceType<typeof QuickQuoteCommentsFab> | null>(null);
const isVisitModalOpen = ref(false);
const visitSubmitted = ref(false);
const visitForm = reactive({
  date: "",
  timeWindow: "morning",
  name: "Jordan Miller",
  email: "jordan@example.com",
  phone: "(843) 555-1122",
  notes: "",
});

const openChat = () => {
  fabRef.value?.open();
};

const openVisitModal = () => {
  visitSubmitted.value = false;
  isVisitModalOpen.value = true;
};

const closeVisitModal = () => {
  isVisitModalOpen.value = false;
};

const submitVisit = () => {
  visitSubmitted.value = true;
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <div class="mx-auto flex min-h-screen max-w-3xl flex-col px-4 pb-28 pt-8 sm:px-6 lg:px-0">
      <!-- Hero -->
      <section
        class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0E1A2B] via-[#0f2138] to-[#102544] text-slate-50 shadow-[0_4px_18px_rgba(0,0,0,0.10)]"
      >
        <div class="p-6 sm:p-8 space-y-5">
          <div class="flex items-start justify-between gap-6">
            <div class="space-y-2">
              <p class="text-[11px] uppercase tracking-[0.2em] text-slate-300">QuickQuote Portal</p>
              <div class="space-y-1">
                <h1 class="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                  Your QuickQuote Estimate
                </h1>
                <p class="text-sm font-normal text-slate-200">Fast estimate prepared using your project details</p>
              </div>
              <p class="text-sm leading-relaxed text-slate-200">For Jordan Miller</p>
            </div>

            <div class="flex items-center gap-3 rounded-2xl bg-slate-800/60 px-3 py-2 shadow-inner">
              <img
                :src="contractor.avatar"
                alt="Contractor"
                class="h-10 w-10 rounded-xl object-cover ring-2 ring-white/10"
              />
              <div class="space-y-0.5 text-right max-w-[170px]">
                <p class="text-[11px] uppercase tracking-[0.18em] text-slate-300">Contractor</p>
                <p class="text-sm font-semibold text-slate-50 line-clamp-2">{{ contractor.name }}</p>
                <p class="text-xs text-slate-300 line-clamp-1">{{ contractor.trade }}</p>
              </div>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2 text-xs text-slate-200">
            <span class="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-3 py-1 shadow-sm">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Licensed
            </span>
            <span class="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-3 py-1 shadow-sm">
              <span class="h-1.5 w-1.5 rounded-full bg-blue-300" /> Insured
            </span>
            <span class="inline-flex items-center gap-1 rounded-full bg-slate-800/80 px-3 py-1 shadow-sm">
              <span class="h-1.5 w-1.5 rounded-full bg-sky-300" /> Local
            </span>
            <span class="rounded-full bg-slate-800/80 px-3 py-1 shadow-sm">
              Prepared 10 min ago
            </span>
            <span class="rounded-full bg-blue-600 px-3 py-1 font-semibold shadow-sm">10 min review</span>
          </div>
        </div>

        <div class="absolute bottom-4 right-5 rounded-full bg-white/5 px-3 py-1 text-[12px] text-slate-200">
          Powered by StackQuotes
        </div>
      </section>

      <div class="my-6 h-px w-full bg-[#E8EDF3]"></div>

      <!-- Gallery -->
      <section class="space-y-4">
        <div class="h-px w-full bg-[#E8EDF3]"></div>
        <div>
          <h2 class="text-lg sm:text-xl font-medium tracking-tight text-slate-900 mb-2">Photos & Inspiration</h2>
          <p class="text-sm text-slate-500 mb-2">A quick visual benchmark to align on finish level.</p>
        </div>
        <div class="relative">
          <div class="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-slate-50 to-transparent"></div>
          <div class="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-slate-50 to-transparent"></div>
          <div class="flex gap-3 snap-x snap-mandatory overflow-x-auto overscroll-x-contain sm:gap-4">
            <div
              v-for="url in gallery"
              :key="url"
              class="h-28 w-48 shrink-0 snap-center overflow-hidden rounded-[10px] bg-slate-200 border border-[#E8EDF3] transition-all duration-300 ease-out sm:h-32 sm:w-56 sm:rounded-[10px] sm:shadow-md sm:hover:-translate-y-1 sm:hover:shadow-lg"
            >
              <div class="relative h-full w-full">
                <img :src="url" alt="Project inspiration" class="h-full w-full object-cover" />
                <div class="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
        <p class="text-xs text-slate-500">These photos reflect general finish levels - not exact materials.</p>
        <div class="h-px w-full bg-[#E8EDF3]"></div>
      </section>

      <!-- Price Snapshot -->
      <section class="mt-12 space-y-4">
        <div>
          <h2 class="text-lg sm:text-xl font-medium tracking-tight text-slate-900 mb-2">Estimated Project Range</h2>
          <p class="text-sm text-slate-500 mb-4">Lightweight snapshot so you can decide the next step quickly.</p>
        </div>
        <div
          class="flex flex-col gap-4 rounded-2xl border border-[#E8EDF3] bg-white p-6 text-sm shadow-sm sm:rounded-3xl sm:p-8 sm:shadow-md"
        >
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div>
              <p class="text-sm font-medium text-slate-700">Your Estimated Project Range</p>
              <p class="mt-1 text-[11px] font-semibold tracking-wide text-slate-500 uppercase sm:text-xs">Range</p>
              <p class="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl sm:font-bold">
                <span class="font-bold">$9,800 - $14,900</span>
              </p>
            </div>
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-full border border-blue-200 px-3 py-1 text-[12px] font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
            >
              How this was calculated
            </button>
          </div>
          <p class="text-sm leading-relaxed text-slate-600">
            Final price depends on site access, materials, and build complexity.
          </p>
          <p class="text-xs text-slate-500">We refine this during the on-site visit - no obligation until you approve.</p>
        </div>
        <p class="text-xs text-slate-500">We'll confirm this range during the on-site visit.</p>
      </section>

      <!-- Lists -->
      <section class="mt-12 space-y-4">
        <div>
          <h2 class="text-lg sm:text-xl font-medium tracking-tight text-slate-900 mb-1">What This Includes</h2>
          <p class="text-sm text-slate-500">A simple breakdown so you know what is covered.</p>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="rounded-2xl border border-[#E8EDF3] bg-white p-6 shadow-sm sm:rounded-2xl sm:p-6">
            <p class="text-sm font-medium text-slate-900">What's Included</p>
            <p class="mt-1 text-sm text-slate-500">A streamlined scope to get started.</p>
            <ul class="mt-4 space-y-2 text-sm leading-5 text-slate-700">
              <li
                v-for="(item, idx) in inclusions"
                :key="item"
                class="flex gap-2"
                :class="inclusions.length > 5 && idx < inclusions.length - 1 ? 'border-b border-slate-100 pb-2' : ''"
              >
                <span class="mt-[6px] h-[6px] w-[6px] flex-none rounded-full bg-slate-300" />
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>

          <div class="rounded-2xl border border-[#E8EDF3] bg-white p-6 shadow-sm sm:rounded-2xl sm:p-6">
            <p class="text-sm font-medium text-slate-900">Possible Add-Ons</p>
            <p class="mt-1 text-sm text-slate-500">Upgrade ideas if you want more.</p>
            <ul class="mt-4 space-y-2 text-sm leading-5 text-slate-700">
              <li
                v-for="(item, idx) in addOns"
                :key="item"
                class="flex gap-2"
                :class="addOns.length > 5 && idx < addOns.length - 1 ? 'border-b border-slate-100 pb-2' : ''"
              >
                <span class="mt-[6px] h-[6px] w-[6px] flex-none rounded-full bg-slate-300" />
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Next Steps -->
      <section class="mt-12 space-y-4">
        <div>
          <h2 class="text-lg sm:text-xl font-medium tracking-tight text-slate-900 mb-2">Next Steps</h2>
          <p class="text-sm text-slate-500 mb-2">A simple 3-step glidepath from estimate to proposal.</p>
        </div>
        <div class="space-y-4 rounded-2xl border border-[#E8EDF3] bg-white p-6 text-sm shadow-sm sm:rounded-2xl sm:p-7">
          <div v-for="(step, index) in steps" :key="step.title" class="flex gap-4">
            <div class="flex flex-col items-center">
              <div
                class="flex h-9 w-9 items-center justify-center rounded-full border-2 border-blue-500 bg-white text-sm font-semibold text-blue-700 shadow-sm"
              >
                {{ index + 1 }}
              </div>
              <div v-if="index < steps.length - 1" class="mt-1 h-full w-px flex-1 bg-[#E8EDF3]" />
            </div>
            <div class="flex-1 space-y-1">
              <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ step.title }}</p>
              <p class="text-sm leading-relaxed text-slate-700">{{ step.detail }}</p>
            </div>
          </div>
        </div>
        <p class="text-xs text-slate-500">No obligation until you approve the final proposal.</p>
      </section>

      <!-- CTA -->
      <section class="mt-12 rounded-3xl border border-[#E8EDF3] bg-white p-8 text-center shadow-sm sm:p-10">
        <p class="text-base font-semibold text-slate-900">Ready to move forward?</p>
        <p class="mt-2 text-sm text-slate-600">Schedule a quick visit so we can finalize the proposal together.</p>
        <div class="mt-6 flex flex-col items-center gap-3">
          <button
            type="button"
            class="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#1E5EFF] to-[#1b4fd1] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-full md:w-auto md:min-w-[240px] md:text-base"
            @click="openVisitModal"
          >
            Schedule On-Site Visit
          </button>
          <button type="button" class="text-sm font-medium text-blue-700 hover:text-blue-800" @click="openChat">
            Ask a question
          </button>
        </div>
        <p class="mt-3 text-xs text-slate-500">This helps us finalize the proposal accurately.</p>
      </section>

      <!-- Contractor Footer -->
      <footer class="mt-12 space-y-3 pb-4">
        <div class="flex items-start gap-4 rounded-2xl border border-[#E8EDF3] bg-white p-5 text-sm shadow-sm">
          <div class="h-12 w-12 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
            <img :src="contractor.avatar" alt="Brand logo" class="h-full w-full object-cover" />
          </div>
          <div class="space-y-1">
            <p class="text-sm font-semibold text-slate-900">{{ contractor.name }}</p>
            <p class="text-sm leading-relaxed text-slate-700">{{ contractor.trade }}</p>
            <div class="flex items-center gap-2 text-xs text-emerald-600">
              <span class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-3.5 w-3.5">
                  <path fill="currentColor" d="M9.5 16.2 5.8 12.5 4.4 13.9 9.5 19 20 8.5 18.6 7.1z" />
                </svg>
              </span>
              Verified Contractor
            </div>
            <p class="text-xs text-slate-500">{{ contractor.license }}</p>
          </div>
        </div>
        <p class="mt-4 text-center text-[0.72rem] text-slate-400">
          Powered by StackQuotes - quickquote portal prototype
        </p>
      </footer>
    </div>

    <QuickQuoteCommentsFab ref="fabRef" :contractor-name="contractor.name" />

    <!-- Visit Modal / Bottom Sheet -->
    <Transition name="fade">
      <div v-if="isVisitModalOpen" class="fixed inset-0 z-50 flex items-end justify-center px-4 pb-4 md:items-center">
        <div class="absolute inset-0 bg-black/40" @click="closeVisitModal"></div>
        <div
          class="relative w-full max-w-full rounded-t-2xl bg-white shadow-xl md:max-w-[480px] md:rounded-2xl"
        >
          <div class="absolute right-3 top-3">
            <button
              class="rounded-full p-2 text-slate-500 hover:bg-slate-100"
              @click="closeVisitModal"
            >
              <span class="sr-only">Close</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5">
                <path
                  fill="currentColor"
                  d="M6.225 4.811 4.81 6.225 10.586 12l-5.775 5.775 1.414 1.414L12 13.414l5.775 5.775 1.414-1.414L13.414 12l5.775-5.775-1.414-1.414L12 10.586z"
                />
              </svg>
            </button>
          </div>

          <div class="p-6 space-y-6 md:p-8">
            <div class="space-y-1">
              <p class="text-lg font-semibold text-slate-900">Schedule On-Site Visit</p>
              <p class="text-xs text-slate-500">Pick a time that works and we will confirm shortly.</p>
            </div>

            <div v-if="!visitSubmitted" class="space-y-4 text-sm text-slate-900">
              <div class="space-y-2">
                <label class="text-sm font-medium text-slate-800">Preferred Date</label>
                <input
                  v-model="visitForm.date"
                  type="date"
                  class="w-full rounded-xl border border-[#E8EDF3] px-3 py-2 text-sm focus:border-[#1E5EFF] focus:outline-none focus:ring-2 focus:ring-[#1E5EFF]/60"
                />
              </div>

              <div class="space-y-2">
                <p class="text-sm font-medium text-slate-800">Preferred Time Window</p>
                <div class="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <label class="flex items-center gap-2 rounded-xl border border-[#E8EDF3] px-3 py-2">
                    <input type="radio" value="morning" v-model="visitForm.timeWindow" />
                    <span class="text-sm text-slate-800">Morning (8-11)</span>
                  </label>
                  <label class="flex items-center gap-2 rounded-xl border border-[#E8EDF3] px-3 py-2">
                    <input type="radio" value="afternoon" v-model="visitForm.timeWindow" />
                    <span class="text-sm text-slate-800">Afternoon (12-3)</span>
                  </label>
                  <label class="flex items-center gap-2 rounded-xl border border-[#E8EDF3] px-3 py-2">
                    <input type="radio" value="evening" v-model="visitForm.timeWindow" />
                    <span class="text-sm text-slate-800">Evening (3-6)</span>
                  </label>
                </div>
              </div>

              <div class="space-y-3">
                <div class="space-y-2">
                  <label class="text-sm font-medium text-slate-800">Name</label>
                  <input
                    v-model="visitForm.name"
                    type="text"
                    class="w-full rounded-xl border border-[#E8EDF3] px-3 py-2 text-sm focus:border-[#1E5EFF] focus:outline-none focus:ring-2 focus:ring-[#1E5EFF]/60"
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-slate-800">Email</label>
                  <input
                    v-model="visitForm.email"
                    type="email"
                    class="w-full rounded-xl border border-[#E8EDF3] px-3 py-2 text-sm focus:border-[#1E5EFF] focus:outline-none focus:ring-2 focus:ring-[#1E5EFF]/60"
                  />
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-medium text-slate-800">Phone</label>
                  <input
                    v-model="visitForm.phone"
                    type="text"
                    class="w-full rounded-xl border border-[#E8EDF3] px-3 py-2 text-sm focus:border-[#1E5EFF] focus:outline-none focus:ring-2 focus:ring-[#1E5EFF]/60"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium text-slate-800">Notes (Optional)</label>
                <textarea
                  v-model="visitForm.notes"
                  rows="3"
                  placeholder="Anything we should know before the visit?"
                  class="w-full rounded-xl border border-[#E8EDF3] px-3 py-2 text-sm focus:border-[#1E5EFF] focus:outline-none focus:ring-2 focus:ring-[#1E5EFF]/60"
                ></textarea>
              </div>

              <div class="pt-2">
                <button
                  type="button"
                  class="w-full rounded-xl bg-sq-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                  @click="submitVisit"
                >
                  Submit Request
                </button>
              </div>
            </div>

            <div v-else class="space-y-4 text-center">
              <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-6 w-6">
                  <path fill="currentColor" d="M9.5 16.2 5.8 12.5 4.4 13.9 9.5 19 20 8.5 18.6 7.1z" />
                </svg>
              </div>
              <div class="space-y-1">
                <p class="text-lg font-semibold text-slate-900">Your visit request has been sent.</p>
                <p class="text-sm text-slate-600">We will confirm the time shortly.</p>
              </div>
              <div class="pt-2">
                <button
                  type="button"
                  class="w-full rounded-xl bg-sq-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
                  @click="closeVisitModal"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
