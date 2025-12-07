<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
    <div class="mx-auto max-w-5xl px-4 py-10 sm:py-12 lg:px-8">
      <header class="space-y-2">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Prototype dashboard</p>
        <h1 class="text-3xl font-bold text-slate-900 sm:text-4xl">Your proposals</h1>
        <p class="text-sm text-slate-600">This is static demo data. Rows are added when you send your first proposal.</p>
      </header>

      <section class="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-xl backdrop-blur">
        <div class="hidden grid-cols-[2fr,1.5fr,1fr,1fr] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 sm:grid">
          <span>Proposal</span>
          <span>Client</span>
          <span>Status</span>
          <span class="text-right">Actions</span>
        </div>
        <div v-if="proposals.length === 0" class="px-4 py-6 text-sm text-slate-600 sm:px-6">
          No proposals yet. Finish onboarding to send your first one.
        </div>
        <div v-else class="divide-y divide-slate-100">
          <div
            v-for="proposal in proposals"
            :key="proposal.id"
            class="grid grid-cols-1 gap-3 px-4 py-4 text-sm sm:grid-cols-[2fr,1.5fr,1fr,1fr] sm:items-center sm:px-6"
          >
            <div>
              <p class="font-semibold text-slate-900">{{ proposal.name }}</p>
              <p class="text-xs text-slate-500">ID: {{ proposal.id }}</p>
            </div>
            <p class="text-slate-700">{{ proposal.client }}</p>
            <span class="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
              {{ proposal.status }}
            </span>
            <div class="flex items-center justify-start sm:justify-end">
              <button
                class="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-700"
                @click="viewProposal"
              >
                View Proposal
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useOnboardingPrototypeStore } from "@/stores/onboardingPrototype";

const store = useOnboardingPrototypeStore();
const router = useRouter();

const proposals = computed(() => store.proposals);

const viewProposal = () => {
  router.push("/onboarding/client-portal-preview");
};
</script>
