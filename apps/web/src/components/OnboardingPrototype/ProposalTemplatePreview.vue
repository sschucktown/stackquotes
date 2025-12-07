<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto max-w-5xl px-4 py-12">
      <div class="space-y-6">
        <header class="text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Proposal template</p>
          <h1 class="mt-2 text-3xl font-bold text-slate-900">Good / Better / Best preview</h1>
          <p class="text-sm text-slate-600">Static mock of your SmartProposal layout.</p>
        </header>

        <section class="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <div class="grid gap-4 md:grid-cols-3">
            <article
              v-for="option in options"
              :key="option.label"
              class="relative overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br p-6 shadow-md"
              :class="option.accent || 'from-white to-white'"
            >
              <div class="flex items-center justify-between">
                <p class="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">{{ option.label }}</p>
                <span class="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 shadow-inner">
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
            </article>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Client-ready mock
              <span v-if="editHint" class="ml-2 rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700">
                {{ editHint }}
              </span>
            </div>
            <div class="flex flex-wrap gap-3">
              <button
                class="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-700"
                @click="goToClientPreview"
              >
                Preview client view →
              </button>
              <button
                class="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
                type="button"
                @click="handleEditClick"
              >
                Make edits
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from "vue";
import { useRouter } from "vue-router";
import { useOnboardingPrototypeStore } from "@/stores/onboardingPrototype";

const router = useRouter();
const store = useOnboardingPrototypeStore();

const options = computed(() => store.proposalOptions);
const editHint = ref("");
let editHintTimeout: number | undefined;

const goToClientPreview = () => {
  router.push("/onboarding/client-portal-preview");
};

const handleEditClick = () => {
  editHint.value = "Edits are disabled in this prototype.";
  if (editHintTimeout) {
    clearTimeout(editHintTimeout);
  }
  editHintTimeout = window.setTimeout(() => {
    editHint.value = "";
  }, 2000);
};

onBeforeUnmount(() => {
  if (editHintTimeout) {
    clearTimeout(editHintTimeout);
  }
});
</script>
