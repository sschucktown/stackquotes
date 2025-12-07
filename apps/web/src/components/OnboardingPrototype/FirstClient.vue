<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto max-w-xl px-4 py-12">
      <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
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

          <button
            type="submit"
            class="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-700"
          >
            Send Proposal →
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const clientName = ref("");
const clientEmail = ref("");
const projectName = ref("");

const sendProposal = () => {
  router.push("/onboarding/sent");
};
</script>
