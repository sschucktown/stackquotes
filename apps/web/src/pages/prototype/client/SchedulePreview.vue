<script setup lang="ts">
import { computed } from "vue";
import { useSchedulesStore } from "@/stores/schedulesStore";
import { useSchedulingStore } from "@/stores/schedulingStore";

const schedulesStore = useSchedulesStore();
const schedulingStore = useSchedulingStore();

const latest = computed(() => {
  // Prefer new schedulesStore by job "job-maple" for prototype
  return schedulesStore.getSchedule("job-maple");
});

const currency = (value: number) => value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-900">
    <div class="w-full max-w-lg rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-md">
      <h1 class="text-center text-xl font-semibold">Schedule Preview</h1>
      <p class="mt-1 text-center text-sm text-slate-600">Awaiting your confirmation</p>

      <div v-if="latest" class="mt-5 space-y-3 text-sm">
        <div class="flex justify-between">
          <span class="text-slate-500">Requested start date</span>
          <span class="font-semibold text-slate-900">{{ latest.startDate }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-500">Deposit due</span>
          <span class="font-semibold text-emerald-700">{{ currency(latest.depositDue || 0) }}</span>
        </div>
        <div>
          <p class="text-slate-500">Message from contractor</p>
          <p class="font-medium text-slate-900">{{ latest.notes || "No message provided." }}</p>
        </div>
        <div class="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
          <span>Status</span>
          <span>Awaiting your confirmation</span>
        </div>
        <button
          type="button"
          class="mt-2 w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-700"
        >
          Confirm Schedule
        </button>
      </div>

      <div v-else class="mt-5 text-center text-sm text-slate-500">
        No schedule proposed yet. Check back soon.
      </div>
    </div>
  </main>
</template>
