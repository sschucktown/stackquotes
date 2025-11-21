<template>
  <div class="flex flex-col gap-6">
    <header class="rounded-3xl bg-white/90 p-6 shadow-sm ring-1 ring-slate-100">
      <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">SmartProposal V2 sandbox</p>
      <div class="mt-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">Tesla-inspired proposal builder</h1>
          <p class="text-sm text-slate-600">
            Iterate on layout, branding, and section choreography without touching production data.
          </p>
        </div>
        <div class="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-2 text-xs text-slate-500">
          <span class="h-2 w-2 rounded-full bg-emerald-500" />
          Mock state only &mdash; no API calls.
        </div>
      </div>
    </header>

    <Spv2BuilderShell />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import Spv2BuilderShell from "@/modules/smartproposals-v2/components/Spv2BuilderShell.vue";
import { useSpv2Store } from "@/modules/smartproposals-v2/stores/useSpv2Store";

const store = useSpv2Store();

onMounted(() => {
  store.resetToDefaults();
});
</script>
