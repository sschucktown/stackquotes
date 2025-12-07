<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto max-w-xl px-4 py-12">
      <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <svg class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="m5 13 4 4L19 7" />
          </svg>
        </div>
        <h1 class="mt-4 text-3xl font-bold text-slate-900">Your proposal has been sent!</h1>
        <p class="mt-2 text-sm text-slate-600">
          You'll be notified when your client views, selects an option, or pays a deposit.
        </p>

        <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            class="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-700"
            @click="startAnother"
          >
            Create another proposal
          </button>
          <button
            class="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
            @click="goToDashboard"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useOnboardingPrototypeStore } from "@/stores/onboardingPrototype";

const router = useRouter();
const store = useOnboardingPrototypeStore();

const startAnother = () => {
  store.reset();
  router.push("/onboarding/upload");
};

const goToDashboard = () => {
  router.push("/dashboard");
};
</script>
