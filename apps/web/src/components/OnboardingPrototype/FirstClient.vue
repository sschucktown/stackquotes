<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
    <div class="mx-auto max-w-xl px-4 py-10 sm:py-12">
      <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-xl backdrop-blur">
        <header class="space-y-1 text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Add first client</p>
          <h1 class="text-3xl font-bold text-slate-900">Send your first proposal</h1>
          <p class="text-sm text-slate-600">No real emails — just a quick simulation.</p>
        </header>

        <form class="mt-8 space-y-4" @submit.prevent="sendProposal">
          <div class="space-y-2">
            <label class="text-sm font-semibold text-slate-800" for="client-name">Client name</label>
            <input
              id="client-name"
              v-model="clientName"
              required
              class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold text-slate-800" for="client-email">Client email</label>
            <input
              id="client-email"
              v-model="clientEmail"
              type="email"
              required
              class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold text-slate-800" for="project-name">Project name</label>
            <input
              id="project-name"
              v-model="projectName"
              required
              class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <transition name="fade">
            <p v-if="error" class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {{ error }}
            </p>
          </transition>

          <button
            type="submit"
            class="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            :disabled="!isValid"
          >
            Send Proposal →
          </button>
        </form>
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

const clientName = ref("");
const clientEmail = ref("");
const projectName = ref("");
const error = ref("");

const isValid = computed(() => Boolean(clientName.value && clientEmail.value && projectName.value));

const uuid = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `proposal-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

const sendProposal = () => {
  if (!isValid.value) {
    error.value = "Please fill in all fields.";
    return;
  }
  error.value = "";
  store.addProposal({
    id: uuid(),
    name: projectName.value,
    client: clientName.value,
    status: "Sent",
  });
  router.push("/onboarding/sent");
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
