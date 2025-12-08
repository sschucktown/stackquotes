<script setup lang="ts">
import { computed } from "vue";
import { CalendarDaysIcon, CheckCircleIcon } from "@heroicons/vue/24/outline";

const props = defineProps<{
  proposedDate: string;
  confirmedDate: string | null;
}>();

const emit = defineEmits<{
  (event: "confirm"): void;
  (event: "requestChange"): void;
  (event: "addToCalendar"): void;
}>();

const hasConfirmed = computed(() => Boolean(props.confirmedDate));

const formatDate = (value: string | null) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const statusSteps = computed(() => [
  { label: "Proposal approved", complete: true },
  { label: "Schedule confirmed", complete: hasConfirmed.value },
  { label: "Deposit ready at scheduling", complete: true },
]);
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Schedule</p>
        <p class="text-sm text-slate-600">
          {{ hasConfirmed ? "You locked in a date with your contractor." : "Proposed start date pending your confirmation." }}
        </p>
      </div>
      <CalendarDaysIcon class="h-6 w-6 text-slate-700" />
    </div>

    <div class="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
        {{ hasConfirmed ? "Confirmed start" : "Proposed start" }}
      </p>
      <p class="text-lg font-semibold text-slate-900">
        {{ hasConfirmed ? formatDate(props.confirmedDate) : formatDate(props.proposedDate) }}
      </p>
      <p v-if="!hasConfirmed" class="text-xs text-slate-500">Hold expires after you confirm or request a change.</p>
    </div>

    <div v-if="hasConfirmed" class="mt-3 space-y-2">
      <div
        v-for="item in statusSteps"
        :key="item.label"
        class="flex items-center gap-2 text-sm text-slate-800"
      >
        <CheckCircleIcon
          class="h-5 w-5"
          :class="item.complete ? 'text-emerald-600' : 'text-slate-300'"
        />
        <span>{{ item.label }}</span>
      </div>
    </div>

    <div class="mt-4 grid gap-2 sm:grid-cols-2">
      <button
        v-if="!hasConfirmed"
        type="button"
        class="w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-700"
        @click="emit('confirm')"
      >
        Confirm &amp; lock
      </button>
      <button
        v-if="!hasConfirmed"
        type="button"
        class="w-full rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
        @click="emit('requestChange')"
      >
        Request a different date
      </button>
      <button
        v-else
        type="button"
        class="w-full rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-slate-800 sm:col-span-2"
        @click="emit('addToCalendar')"
      >
        Add to calendar
      </button>
    </div>
  </section>
</template>
