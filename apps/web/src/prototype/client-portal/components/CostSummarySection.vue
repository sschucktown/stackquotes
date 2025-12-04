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
  <section class="mt-16 space-y-4">
    <div>
      <h2 class="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 mb-2">Investment Summary</h2>
      <p class="text-sm text-slate-500 mb-4">Your reassuring midpoint: choose what fits today, add upgrades later.</p>
    </div>
    <div class="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-7 text-sm shadow-md sm:p-8">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-xs font-semibold tracking-wide text-slate-500">
            {{ proposal.costSummary.rangeLabel }}
          </p>
          <p class="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            {{ proposal.costSummary.rangeValue }}
          </p>
        </div>
        <div class="ml-auto inline-flex items-center rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md">
          NO OBLIGATION UNTIL YOU APPROVE
        </div>
      </div>

      <p class="text-sm leading-relaxed text-slate-600">
        {{ proposal.costSummary.note }}
      </p>
      <p class="text-xs text-slate-500">
        You can add lighting, rail upgrades, or accessories later without losing your spot in our schedule.
      </p>
      <p class="text-xs text-slate-500">
        You're in full control. We only move forward when you approve.
      </p>
    </div>
  </section>
</template>
