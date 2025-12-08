<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { CheckIcon } from "@heroicons/vue/24/outline";

const router = useRouter();
const route = useRoute();

const option = computed(() => {
  const value = String(route.query.option || "").toLowerCase();
  return ["good", "better", "best"].includes(value) ? value : "better";
});

const optionLabel = computed(() => {
  const map: Record<string, string> = { good: "Good", better: "Better", best: "Best" };
  return map[option.value] ?? "Selected";
});

const formattedDate = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date());
const formattedTime = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date());

const handleReturn = () => router.push("/prototype/smartproposal/client");
const handleClose = () => {
  if (typeof window !== "undefined") window.close();
};
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-slate-900">
    <transition name="card">
      <div
        class="w-full max-w-[480px] rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-xl sm:px-8 sm:py-8"
        key="card"
      >
        <transition name="check">
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50" key="check">
            <CheckIcon class="h-8 w-8 text-emerald-600" />
          </div>
        </transition>

        <h1 class="mt-4 text-center text-xl font-semibold text-slate-900">Thanks! We’ve received your approval.</h1>
        <p class="mt-1 text-center text-sm text-slate-600">Your contractor will follow up shortly with next steps.</p>

        <div class="mx-auto mt-4 w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          {{ optionLabel.toUpperCase() }} OPTION SELECTED
        </div>

        <ul class="mt-6 space-y-4 text-sm text-slate-700">
          <li class="flex items-start gap-3">
            <div class="mt-1 h-2 w-2 rounded-full bg-emerald-500"></div>
            <div>
              <p class="font-semibold text-slate-900">Approval received</p>
              <p class="text-sm text-slate-600">We've locked in your selection ({{ optionLabel }}).</p>
            </div>
          </li>
          <li class="flex items-start gap-3">
            <div class="mt-1 h-2 w-2 rounded-full bg-emerald-500"></div>
            <div>
              <p class="font-semibold text-slate-900">Contractor reviews details</p>
              <p class="text-sm text-slate-600">Your contractor will double-check scope and scheduling.</p>
            </div>
          </li>
          <li class="flex items-start gap-3">
            <div class="mt-1 h-2 w-2 rounded-full bg-emerald-500"></div>
            <div>
              <p class="font-semibold text-slate-900">Schedule &amp; deposit confirmation</p>
              <p class="text-sm text-slate-600">You’ll confirm dates and deposit to lock in the job.</p>
            </div>
          </li>
        </ul>

        <div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            class="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 ease-out hover:-translate-y-[1px] hover:bg-slate-50"
            @click="handleReturn"
          >
            Return to proposal
          </button>
          <button
            class="rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow transition-all duration-200 ease-out hover:-translate-y-[1px] hover:bg-emerald-700"
            @click="handleClose"
          >
            Close window
          </button>
        </div>

        <p class="mt-4 text-center text-xs text-slate-400">Approved on {{ formattedDate }} at {{ formattedTime }}</p>
      </div>
    </transition>
  </main>
</template>

<style scoped>
.card-enter-active {
  transition: opacity 220ms ease-out, transform 220ms ease-out;
}
.card-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.card-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.check-enter-active {
  transition: transform 180ms ease-out;
}
.check-enter-from {
  transform: scale(0.9);
}
.check-enter-to {
  transform: scale(1);
}
</style>
