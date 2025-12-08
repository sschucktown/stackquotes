<script setup lang="ts">
import { computed } from "vue";
import { useClientSchedulePrototype } from "@/stores/useClientSchedulePrototype";
import { CheckIcon } from "@heroicons/vue/24/outline";
import ScheduleTimeline from "@/components/schedule/ScheduleTimeline.vue";
import MotionFadeIn from "@/components/schedule/MotionFadeIn.vue";
import { useRouter } from "vue-router";

const scheduleStore = useClientSchedulePrototype();
const router = useRouter();

const formattedDate = computed(() => {
  const d = scheduleStore.proposedDate ? new Date(scheduleStore.proposedDate) : null;
  if (!d || isNaN(d.getTime())) return scheduleStore.proposedDate;
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
});

const currency = (value: number | null) =>
  (value || 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 text-slate-900">
    <MotionFadeIn>
      <div class="w-full max-w-lg rounded-3xl border border-slate-200 bg-white px-7 py-8 shadow-xl">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckIcon class="h-8 w-8" />
        </div>
        <h1 class="mt-4 text-center text-2xl font-semibold">Your schedule is confirmed!</h1>
        <p class="mt-1 text-center text-sm text-slate-600">Your contractor will now finalize project kickoff details.</p>

        <div class="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Start date</p>
          <p class="text-lg font-semibold text-slate-900">{{ formattedDate }}</p>
        </div>
        <div class="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Deposit</p>
          <p class="text-lg font-semibold text-emerald-700">{{ currency(scheduleStore.depositDue) }}</p>
        </div>

        <div class="mt-6">
          <ScheduleTimeline />
        </div>

        <div class="mt-6 flex justify-center">
          <button
            class="w-full rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-slate-800 sm:w-auto"
            @click="router.push('/prototype/client-portal')"
          >
            Return to project details
          </button>
        </div>
      </div>
    </MotionFadeIn>
  </main>
</template>
