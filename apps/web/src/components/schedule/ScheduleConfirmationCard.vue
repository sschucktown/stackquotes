<script setup lang="ts">
import { computed } from "vue";
import { CalendarDaysIcon } from "@heroicons/vue/24/outline";
import ScheduleTimeline from "./ScheduleTimeline.vue";
import MotionFadeIn from "./MotionFadeIn.vue";

const props = defineProps<{
  proposedDate: string;
  depositDue: number;
  contractorMessage?: string | null;
}>();

const formattedDate = computed(() => {
  const date = props.proposedDate ? new Date(props.proposedDate) : null;
  if (!date || isNaN(date.getTime())) return props.proposedDate;
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
});

const currency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
</script>

<template>
  <MotionFadeIn>
    <div class="w-full max-w-lg rounded-2xl border border-slate-200 bg-white px-8 py-10 shadow-xl">
      <div class="text-center">
        <h1 class="text-xl font-semibold text-slate-900">Review your scheduled start date</h1>
        <p class="mt-1 text-sm text-slate-600">Your contractor proposed the following start date. Confirm to lock it in.</p>
      </div>

      <div class="mt-6 flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
        <div class="rounded-xl bg-white p-3 shadow-inner">
          <CalendarDaysIcon class="h-6 w-6 text-slate-800" />
        </div>
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">Proposed start date</p>
          <p class="text-2xl font-semibold text-slate-900">{{ formattedDate }}</p>
        </div>
      </div>

      <div class="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
        <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Deposit at scheduling</p>
        <p class="text-2xl font-bold text-emerald-700">{{ currency(depositDue) }}</p>
        <p class="text-sm text-slate-600">Due once you confirm your date.</p>
      </div>

      <div
        v-if="contractorMessage"
        class="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3"
      >
        <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-600">Message from your contractor</p>
        <p class="mt-1 text-sm text-slate-800">{{ contractorMessage }}</p>
      </div>

      <div class="mt-6">
        <ScheduleTimeline />
      </div>
    </div>
  </MotionFadeIn>
</template>
