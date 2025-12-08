<script setup lang="ts">
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { CalendarDaysIcon } from "@heroicons/vue/24/outline";
import MotionFadeIn from "@/components/schedule/MotionFadeIn.vue";
import { usePrototypePaymentStore } from "@/stores/prototypePaymentStore";

const router = useRouter();
const route = useRoute();
const paymentStore = usePrototypePaymentStore();
const jobId = (route.query.jobId as string) || "job-maple";

const contractPacket = {
  client: {
    name: "Sarah Thompson",
    email: "sarah.t@example.com",
  },
  project: {
    name: "Maple St Deck",
    address: "482 Maple St, Seattle, WA",
  },
  selection: {
    optionLabel: "Better · Premium comfort",
    price: 23800,
    deposit: 3570,
  },
  schedule: {
    startDateLabel: "Friday, December 12, 2025",
  },
  scope: {
    base: ["Structural framing", "Standard rails", "Stairs + landings"],
    upgrades: ["Composite decking surface", "Hidden fasteners", "Powder-coated aluminum railing"],
  },
  terms: [
    "Deposit is due at scheduling to lock in the date.",
    "Weather may shift day-of timing, but start week will remain the same unless you request changes.",
    "Change orders will be reviewed and approved before additional work is performed.",
  ],
  nextSteps: [
    "You’ll get a separate email with your invoice and payment link.",
    "We’ll confirm any final site access details 3–5 days before the start date.",
    "You’ll receive day-of arrival window and crew lead contact info.",
  ],
};

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const download = () => {
  console.log("[ContractPacket] download", { jobId });
};

const depositPaid = computed(() => paymentStore.isPaid(jobId));
const terms = computed(() => [
  depositPaid.value ? "Deposit already collected to lock in the date." : "Deposit is due at scheduling to lock in the date.",
  contractPacket.terms[1],
  contractPacket.terms[2],
]);
const nextSteps = computed(() => {
  const steps = [...contractPacket.nextSteps];
  steps[0] = depositPaid.value ? "We'll email your receipt and confirm the deposit is applied." : contractPacket.nextSteps[0];
  return steps;
});
</script>

<template>
  <main class="min-h-screen bg-slate-50 text-slate-900">
    <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Your Contract Packet</p>
          <h1 class="text-xl font-semibold text-slate-900">Everything we’ll build together, in one place.</h1>
        </div>
        <span class="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-inner">
          Prototype Only
        </span>
      </div>

      <div class="mt-4 space-y-4">
        <MotionFadeIn>
          <section class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Project</p>
                <p class="text-sm font-semibold text-slate-900">{{ contractPacket.project.name }}</p>
                <p class="text-sm text-slate-600">{{ contractPacket.project.address }}</p>
              </div>
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Client</p>
                <p class="text-sm font-semibold text-slate-900">{{ contractPacket.client.name }}</p>
                <p class="text-sm text-slate-600">{{ contractPacket.client.email }}</p>
              </div>
            </div>
            <p class="mt-3 text-xs text-slate-500">
              Please confirm these details are correct. Let your contractor know if anything looks off.
            </p>
          </section>
        </MotionFadeIn>

        <MotionFadeIn>
          <section class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Chosen option</p>
                <p class="text-lg font-semibold text-slate-900">{{ contractPacket.selection.optionLabel }}</p>
              </div>
              <p class="text-2xl font-bold text-slate-900">{{ formatCurrency(contractPacket.selection.price) }}</p>
            </div>
            <div class="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Deposit</p>
                  <p class="text-lg font-semibold" :class="depositPaid ? 'text-emerald-700' : 'text-slate-900'">
                    {{ formatCurrency(contractPacket.selection.deposit) }}
                  </p>
                </div>
                <span
                  class="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold"
                  :class="depositPaid ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600 border border-slate-200'"
                >
                  {{ depositPaid ? "Paid" : "Due at scheduling" }}
                </span>
              </div>
              <p class="text-xs text-slate-500">
                {{ depositPaid ? "Marked as collected in this prototype." : "Due once your schedule is locked in." }}
              </p>
            </div>
          </section>
        </MotionFadeIn>

        <MotionFadeIn>
          <section class="space-y-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
            <p class="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Scope of work</p>
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Base build</p>
                <ul class="mt-2 space-y-1 text-sm text-slate-800">
                  <li v-for="item in contractPacket.scope.base" :key="item" class="flex items-start gap-2">
                    <span class="mt-[7px] h-2 w-2 rounded-full bg-slate-300"></span>
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Upgrades included</p>
                <ul class="mt-2 space-y-1 text-sm text-slate-800">
                  <li v-for="item in contractPacket.scope.upgrades" :key="item" class="flex items-start gap-2">
                    <span class="mt-[7px] h-2 w-2 rounded-full bg-slate-300"></span>
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </MotionFadeIn>

        <MotionFadeIn>
          <section class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
            <p class="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Confirmed start date</p>
            <div class="mt-3 flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
              <CalendarDaysIcon class="h-5 w-5 text-slate-800" />
              <span class="text-sm font-semibold text-slate-900">{{ contractPacket.schedule.startDateLabel }}</span>
            </div>
            <ul class="mt-4 space-y-2 text-sm text-slate-800">
              <li class="flex items-center gap-2">
                <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span>Schedule proposed</span>
              </li>
              <li class="flex items-center gap-2">
                <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span>You confirmed this date</span>
              </li>
              <li class="flex items-center gap-2">
                <span :class="depositPaid ? 'h-2 w-2 rounded-full bg-emerald-500' : 'h-2 w-2 rounded-full bg-slate-300'"></span>
                <span>{{ depositPaid ? "Deposit already collected" : "Deposit due at scheduling" }}</span>
              </li>
            </ul>
          </section>
        </MotionFadeIn>

        <MotionFadeIn>
          <section class="space-y-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Key terms (plain language)</p>
              <p class="text-sm text-slate-600">Friendly summary for clarity. Not legal advice.</p>
            </div>
            <ul class="space-y-2 text-sm text-slate-800">
              <li v-for="item in terms" :key="item" class="flex items-start gap-2">
                <span class="mt-[7px] h-2 w-2 rounded-full bg-slate-300"></span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </section>
        </MotionFadeIn>

        <MotionFadeIn>
          <section class="space-y-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
            <p class="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">What happens next</p>
            <ol class="list-decimal space-y-2 pl-5 text-sm text-slate-800">
              <li v-for="item in nextSteps" :key="item">{{ item }}</li>
            </ol>
          </section>
        </MotionFadeIn>
      </div>
    </div>

    <div class="sticky inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-6px_20px_-18px_rgba(15,23,42,0.3)] sm:px-6 lg:px-8">
      <div class="mx-auto flex max-w-4xl flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p class="text-xs text-slate-500">This packet is a summary of your project, schedule, and deposit.</p>
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            class="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-700"
            @click="download"
          >
            Download PDF
          </button>
          <button
            class="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            @click="router.push('/prototype/smartproposal/client')"
          >
            Back to project
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
