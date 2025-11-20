<template>
  <header
    class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
  >
    <div>
      <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
        QuickQuote
      </p>
      <h1 class="text-2xl font-semibold text-slate-900">
        Estimate Workspace
      </h1>
      <p class="mt-1 text-sm text-slate-500">
        Capture client details, scope, and send a clean quote in minutes.
      </p>
    </div>
    <div class="flex items-center gap-3">
      <div v-if="statusLabel" class="flex items-center gap-2">
        <span class="text-xs uppercase tracking-wide text-slate-500">
          Status
        </span>
        <span
          :class="[
            'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
            statusClass,
          ]"
        >
          {{ statusLabel }}
        </span>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useQuickQuoteStore } from "@modules/quickquote/stores/useQuickQuoteStore";

const store = useQuickQuoteStore();

const status = computed(() => store.current?.status ?? "draft");

const statusLabel = computed(() => {
  switch (status.value) {
    case "draft":
      return "Draft";
    case "sent":
      return "Sent";
    case "viewed":
      return "Viewed";
    case "approved":
      return "Approved";
    case "changes_requested":
      return "Changes requested";
    default:
      return "";
  }
});

const statusClass = computed(() => {
  switch (status.value) {
    case "draft":
      return "bg-slate-100 text-slate-700";
    case "sent":
      return "bg-blue-50 text-blue-700";
    case "viewed":
      return "bg-sky-50 text-sky-700";
    case "approved":
      return "bg-emerald-50 text-emerald-700";
    case "changes_requested":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
});
</script>

