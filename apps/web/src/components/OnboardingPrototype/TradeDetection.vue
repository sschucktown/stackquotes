<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto max-w-4xl px-4 py-12">
      <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div class="grid gap-8 p-8 md:grid-cols-[1.1fr,0.9fr] md:p-10">
          <div class="space-y-4">
            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Trade detection</p>
            <h1 class="text-3xl font-bold text-slate-900">We think you're a {{ detectedTrade }}. Correct?</h1>
            <p class="text-sm text-slate-600">
              We’ll pre-fill your profile and proposal around this trade. Change it if we guessed wrong.
            </p>
            <div class="flex flex-wrap gap-3">
              <button
                class="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-700"
                @click="handleYes"
              >
                Yes, continue
              </button>
              <button
                class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
                @click="showSelector = true"
              >
                No, pick another trade
              </button>
            </div>

            <transition name="fade">
              <div v-if="showSelector" class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                <label class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Choose your trade</label>
                <select
                  v-model="selectedTrade"
                  class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
                >
                  <option v-for="trade in tradeOptions" :key="trade" :value="trade">
                    {{ trade }}
                  </option>
                </select>
                <div class="flex flex-wrap gap-2">
                  <button
                    class="inline-flex items-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-sky-700"
                    @click="handleConfirmTrade"
                  >
                    Continue
                  </button>
                  <button
                    class="text-sm font-semibold text-slate-600 transition hover:text-slate-800"
                    @click="showSelector = false"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </transition>
          </div>

          <aside class="space-y-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div class="rounded-xl bg-white p-4 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Our guess</p>
              <p class="mt-1 text-lg font-semibold text-slate-900">{{ detectedTrade }}</p>
              <p class="text-sm text-slate-600">Based on your upload, we lean toward outdoor builds.</p>
            </div>
            <div class="rounded-xl bg-white p-4 shadow-sm">
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">What this affects</p>
              <ul class="mt-2 space-y-1 text-sm text-slate-600">
                <li class="flex items-center gap-2">
                  <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
                  Pre-filled business profile
                </li>
                <li class="flex items-center gap-2">
                  <span class="h-2 w-2 rounded-full bg-sky-500"></span>
                  Proposal template defaults
                </li>
                <li class="flex items-center gap-2">
                  <span class="h-2 w-2 rounded-full bg-amber-500"></span>
                  The way we talk to your client
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useOnboardingPrototypeStore } from "@/stores/onboardingPrototype";

const router = useRouter();
const store = useOnboardingPrototypeStore();

const tradeOptions = [
  "Deck Builder",
  "Fence Builder",
  "Outdoor Living Contractor",
  "Remodeler",
  "Roofer",
  "Painter",
  "Landscaper",
  "HVAC Pro",
  "Electrician",
  "Plumber",
];

const detectedTrade = computed(() => store.trade || "Deck Builder");
const showSelector = ref(false);
const selectedTrade = ref(detectedTrade.value);

const handleYes = () => {
  store.setTrade(detectedTrade.value);
  router.push("/onboarding/profile-preview");
};

const handleConfirmTrade = () => {
  store.setTrade(selectedTrade.value);
  router.push("/onboarding/profile-preview");
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
</style>
