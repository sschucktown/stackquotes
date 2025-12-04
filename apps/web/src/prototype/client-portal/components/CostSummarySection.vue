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
  <section class="mt-16 space-y-4 sm:mt-16">
    <div>
      <h2 class="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 mb-2">Investment Summary</h2>
      <p class="text-sm text-slate-500 mb-4">Your reassuring midpoint: choose what fits today, add upgrades later.</p>
    </div>
    <div class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 text-sm shadow-sm sm:rounded-3xl sm:bg-gradient-to-b sm:from-white sm:to-slate-50 sm:p-8 sm:shadow-md">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-[11px] font-semibold tracking-wide text-slate-500 uppercase sm:text-xs sm:normal-case sm:tracking-wide">
            {{ proposal.costSummary.rangeLabel }}
          </p>
          <p class="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:mt-2 sm:text-3xl sm:font-bold sm:tracking-tight sm:text-slate-900">
            {{ proposal.costSummary.rangeValue }}
          </p>
        </div>
        <div class="ml-auto inline-flex items-center rounded-full bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm sm:px-4 sm:py-2 sm:text-xs sm:shadow-md">
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
