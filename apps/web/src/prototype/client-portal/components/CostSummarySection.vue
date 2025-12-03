<script setup lang="ts">
import type { ProposalData } from "../data/mockProposal";

defineProps<{
  proposal: ProposalData;
  themeClasses: {
    accent: string;
    accentBg: string;
    accentSoftBg: string;
    accentBorder: string;
  };
}>();
</script>

<template>
  <section class="space-y-2">
    <h2 class="text-sm font-semibold text-slate-800">Investment Summary</h2>
    <div class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {{ proposal.costSummary.rangeLabel }}
          </p>
          <p class="text-base font-semibold text-slate-900">
            {{ proposal.costSummary.rangeValue }}
          </p>
        </div>
        <div
          class="rounded-full px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-slate-50"
          :class="themeClasses.accentBg"
        >
          No obligation until you approve
        </div>
      </div>

      <p class="text-xs text-slate-600">
        {{ proposal.costSummary.note }}
      </p>
    </div>
  </section>
</template>
