<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
    <div class="mx-auto max-w-5xl px-4 py-10 sm:py-12">
      <div class="space-y-6">
        <header class="text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Line item library</p>
          <h1 class="mt-2 text-3xl font-bold text-slate-900">Here’s what we pulled from your proposal</h1>
          <p class="text-sm text-slate-600">Scroll the list, then jump to your SmartProposal preview.</p>
        </header>

        <section class="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl">
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div class="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              <span class="inline-block h-2 w-2 rounded-full bg-sky-500"></span>
              <span>Mock extracted items</span>
            </div>
            <button
              class="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-700"
              @click="goToProposal"
            >
              Continue to proposal →
            </button>
          </div>

          <div class="mt-6 max-h-96 space-y-3 overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50/80 p-3">
            <div
              v-for="item in lineItems"
              :key="item.label"
              class="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm"
            >
              <div>
                <p class="text-sm font-semibold text-slate-900">{{ item.label }}</p>
                <p v-if="item.description" class="text-xs text-slate-600">{{ item.description }}</p>
              </div>
              <p class="text-sm font-semibold text-slate-800">{{ item.value }}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useOnboardingPrototypeStore } from "@/stores/onboardingPrototype";

const router = useRouter();
const store = useOnboardingPrototypeStore();

const lineItems = computed(() => store.lineItems);

const goToProposal = () => {
  router.push("/onboarding/proposal-preview");
};
</script>
