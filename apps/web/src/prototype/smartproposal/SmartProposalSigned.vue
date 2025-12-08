<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const option = computed(() => {
  const value = String(route.query.option || "").toLowerCase();
  if (["good", "better", "best"].includes(value)) return value;
  return "better";
});

const optionLabel = computed(() => {
  const map: Record<string, string> = {
    good: "Good",
    better: "Better",
    best: "Best",
  };
  return map[option.value] ?? "Selected";
});

const handleReturn = () => router.push("/prototype/smartproposal/client");
const handleClose = () => {
  if (typeof window !== "undefined") {
    window.close();
  }
};
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-14 text-slate-900">
    <div class="w-full max-w-lg rounded-3xl border border-slate-200 bg-white px-7 py-8 shadow-lg">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 class="mt-5 text-center text-2xl font-semibold">Thanks! We’ve received your approval.</h1>
      <p class="mt-2 text-center text-sm text-slate-600">Your contractor will confirm next steps shortly.</p>
      <p class="mt-3 text-center text-sm font-semibold text-emerald-700">Chosen option: {{ optionLabel }}</p>

      <ol class="mt-6 space-y-3 text-sm text-slate-800">
        <li class="flex items-start gap-3">
          <span class="mt-[6px] h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
          <div>
            <p class="font-semibold text-slate-900">Approval received</p>
            <p class="text-[13px] text-slate-600">We’ve locked in your selection ({{ optionLabel }}).</p>
          </div>
        </li>
        <li class="flex items-start gap-3">
          <span class="mt-[6px] h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
          <div>
            <p class="font-semibold text-slate-900">Contractor reviews details</p>
            <p class="text-[13px] text-slate-600">Your contractor will double-check scope and scheduling.</p>
          </div>
        </li>
        <li class="flex items-start gap-3">
          <span class="mt-[6px] h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
          <div>
            <p class="font-semibold text-slate-900">Schedule &amp; deposit confirmation</p>
            <p class="text-[13px] text-slate-600">You’ll confirm dates and deposit to lock the job.</p>
          </div>
        </li>
      </ol>

      <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          class="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition-all duration-200 ease-out hover:-translate-y-[1px] hover:bg-slate-50"
          @click="handleReturn"
        >
          Return to proposal
        </button>
        <button
          class="inline-flex flex-1 items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 ease-out hover:-translate-y-[1px] hover:bg-emerald-700"
          @click="handleClose"
        >
          Close window
        </button>
      </div>
    </div>
  </main>
</template>

<style scoped>
main {
  font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
</style>
