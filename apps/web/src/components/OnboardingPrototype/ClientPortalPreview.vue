<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
    <div class="mx-auto max-w-6xl px-4 py-12 lg:px-8">
      <div class="space-y-8">
        <header class="flex flex-col gap-3 text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Client portal preview</p>
          <h1 class="text-3xl font-bold text-slate-900 sm:text-4xl">How your client will see it</h1>
          <p class="text-sm text-slate-600">Static wow-moment screen. Accept and pay modals are simulated.</p>
        </header>

        <section class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <div class="flex flex-col gap-6 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-8 text-white md:flex-row md:items-center md:justify-between md:px-10">
            <div class="flex items-center gap-3">
              <div class="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-lg font-bold">
                SQ
              </div>
              <div>
                <p class="text-sm uppercase tracking-[0.2em] text-white/70">Contractor</p>
                <p class="text-lg font-semibold">{{ businessInfo.businessName }}</p>
                <p class="text-sm text-white/70">{{ businessInfo.serviceArea }}</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4 text-sm text-white/80 sm:grid-cols-3">
              <div>
                <p class="text-xs uppercase tracking-[0.16em] text-white/60">Trade</p>
                <p class="font-semibold text-white">{{ businessInfo.trade }}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-[0.16em] text-white/60">Contact</p>
                <p class="font-semibold text-white">{{ businessInfo.phone }}</p>
                <p>{{ businessInfo.email }}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-[0.16em] text-white/60">Payment terms</p>
                <p class="font-semibold text-white">{{ businessInfo.paymentTerms }}</p>
              </div>
            </div>
          </div>

          <div class="grid gap-6 p-6 md:grid-cols-[1.3fr,0.7fr] md:p-10">
            <div class="space-y-5">
              <div class="grid gap-4 lg:grid-cols-3">
                <article
              v-for="option in options"
              :key="option.label"
              class="rounded-2xl border border-slate-100 bg-gradient-to-br p-5 shadow-md"
              :class="option.accent || 'from-white to-white'"
            >
                  <div class="flex items-center justify-between">
                    <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">{{ option.label }}</p>
                    <span class="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 shadow-inner">
                      {{ option.price }}
                    </span>
                  </div>
                  <h3 class="mt-3 text-lg font-bold text-slate-900">{{ option.headline }}</h3>
                  <ul class="mt-3 space-y-2 text-sm text-slate-700">
                <li v-for="detail in option.details" :key="detail" class="flex items-center gap-2">
                  <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span>{{ detail }}</span>
                </li>
              </ul>
              <button
                class="mt-4 inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
                type="button"
                @click="toggleScope(option.label)"
              >
                {{ expandedOption === option.label ? "Hide scope" : "Expand scope" }}
              </button>
              <transition name="fade">
                <div
                  v-if="expandedOption === option.label"
                  class="mt-3 rounded-xl border border-white/70 bg-white/80 p-3 text-sm text-slate-700 shadow-inner"
                >
                  <p class="font-semibold text-slate-900">Scope details</p>
                  <ul class="mt-2 space-y-1">
                    <li
                      v-for="item in (optionScopes[option.label] || defaultOptionScope)"
                      :key="item"
                      class="flex items-center gap-2"
                    >
                      <span class="h-2 w-2 rounded-full bg-sky-500"></span>
                      <span>{{ item }}</span>
                    </li>
                  </ul>
                </div>
              </transition>
            </article>
          </div>

              <div class="rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Scope highlights</p>
                <div class="mt-3 grid gap-3 md:grid-cols-2">
                  <div v-for="scope in scopes" :key="scope.title" class="rounded-xl bg-white p-4 shadow-sm">
                    <p class="text-sm font-semibold text-slate-900">{{ scope.title }}</p>
                    <ul class="mt-2 space-y-1 text-sm text-slate-600">
                      <li v-for="item in scope.items" :key="item" class="flex items-center gap-2">
                        <span class="h-2 w-2 rounded-full bg-sky-500"></span>
                        <span>{{ item }}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <aside class="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <div class="rounded-xl bg-white p-4 shadow-sm">
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Investment summary</p>
                <div class="mt-3 flex items-center justify-between">
                  <p class="text-sm text-slate-600">Best option</p>
                  <p class="text-lg font-bold text-slate-900">{{ bestPrice }}</p>
                </div>
                <div class="mt-2 flex items-center justify-between">
                  <p class="text-sm text-slate-600">Deposit (30%)</p>
                  <p class="text-sm font-semibold text-slate-900">{{ deposit }}</p>
                </div>
                <p class="mt-3 text-xs text-slate-500">Totals are static in this prototype.</p>
              </div>

              <div class="space-y-2 rounded-xl bg-white p-4 shadow-sm">
                <button
                  class="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-700"
                  @click="showAcceptModal = true"
                >
                  Accept Proposal
                </button>
                <button
                  class="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
                  @click="showPayModal = true"
                >
                  Pay Deposit
                </button>
              </div>

              <div class="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
                <p class="font-semibold">Client reassurance</p>
                <p class="mt-1">Warranty: {{ businessInfo.warranty }}</p>
              </div>
            </aside>
          </div>
        </section>

        <div class="flex flex-col items-center gap-3 rounded-3xl border border-slate-200 bg-white px-6 py-6 text-center shadow-lg">
          <p class="text-lg font-semibold text-slate-900">Ready to lock this in as your default?</p>
          <p class="text-sm text-slate-600">We’ll use this proposal style for every new client.</p>
          <button
            class="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-700"
            @click="goToFirstClient"
          >
            Use this as my default proposal
          </button>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div
        v-if="showAcceptModal || showPayModal"
        class="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/50 px-4"
        @click.self="closeModals"
      >
        <transition name="slide-up">
          <div v-if="showAcceptModal || showPayModal" class="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {{ showAcceptModal ? "Accept Proposal" : "Pay Deposit" }}
            </p>
            <h2 class="mt-2 text-xl font-bold text-slate-900">
              {{ showAcceptModal ? "Proposal Accepted" : "Pay Deposit" }}
            </h2>
            <p class="mt-1 text-sm text-slate-600">
              <span v-if="showAcceptModal">Your contractor will be notified.</span>
              <span v-else>Deposit (30%): {{ deposit }} — Demo only, payment not processed.</span>
            </p>
            <div class="mt-5 flex justify-end">
              <button
                class="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5"
                @click="closeModals"
              >
                Close
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useOnboardingPrototypeStore } from "@/stores/onboardingPrototype";

const router = useRouter();
const store = useOnboardingPrototypeStore();

const options = computed(() => store.proposalOptions);
const businessInfo = computed(() => store.businessInfo);
const showAcceptModal = ref(false);
const showPayModal = ref(false);
const expandedOption = ref<string | null>(null);

const scopes = [
  { title: "Structure", items: ["Helical piers/footings", "Pressure-treated frame", "Code-compliant hardware"] },
  { title: "Finish details", items: ["Picture-frame decking", "Low-voltage lighting", "Color-matched fascia"] },
  { title: "Protection", items: ["One-year workmanship warranty", "Touch-up visit after 30 days", "Dedicated client portal"] },
  { title: "Communication", items: ["Weekly updates", "Messaging hub", "Shared project timeline"] },
];

const optionScopes: Record<string, string[]> = {
  Good: ["Pressure-treated decking package", "Standard railing system", "Basic stairs and landing"],
  Better: ["Composite decking upgrade", "Hidden fasteners throughout", "Upgraded railing and posts"],
  Best: ["Premium composite with picture frame", "Aluminum railing with lighting", "Accent fascia and riser lighting"],
};

const defaultOptionScope = ["Custom scope details", "Selections and allowances", "Client-friendly explanations"];

const bestPrice = computed(() => options.value[2]?.price ?? "$16,900");
const deposit = computed(() => {
  const numeric = parseFloat(bestPrice.value.replace(/[^0-9.]/g, ""));
  if (!numeric) return "$5,070";
  return "$" + Math.round(numeric * 0.3).toLocaleString();
});

const closeModals = () => {
  showAcceptModal.value = false;
  showPayModal.value = false;
};

const goToFirstClient = () => {
  closeModals();
  router.push("/onboarding/first-client");
};

const toggleScope = (label: string) => {
  expandedOption.value = expandedOption.value === label ? null : label;
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-up-enter-active,
.slide-up-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
