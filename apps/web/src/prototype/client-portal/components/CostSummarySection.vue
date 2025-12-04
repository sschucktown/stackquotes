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
    <div class="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white p-6 text-sm shadow-sm sm:p-7">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-xs font-semibold tracking-wide text-slate-500">
            {{ proposal.costSummary.rangeLabel }}
          </p>
          <p class="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            {{ proposal.costSummary.rangeValue }}
          </p>
        </div>
        <div class="inline-flex items-center rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm">
          NO OBLIGATION UNTIL YOU APPROVE
        </div>
      </div>

      <p class="text-sm leading-relaxed text-slate-600">
        {{ proposal.costSummary.note }}
      </p>
      <p class="text-xs text-slate-500">
        You can add lighting, rail upgrades, or accessories later without losing your spot in our schedule.
      </p>
    </div>
  </section>
</template>
