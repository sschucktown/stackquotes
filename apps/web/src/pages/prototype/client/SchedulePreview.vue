<script setup lang="ts">
import { computed } from "vue";
import { useSchedulingStore } from "@/stores/schedulingStore";

const schedulingStore = useSchedulingStore();

const latest = computed(() => schedulingStore.items[0]);
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
          <p class="font-medium text-slate-900">{{ latest.message || "No message provided." }}</p>
        </div>
      </div>

      <div v-else class="mt-5 text-center text-sm text-slate-500">
        No schedule proposed yet. Check back soon.
      </div>
    </div>
  </main>
</template>
