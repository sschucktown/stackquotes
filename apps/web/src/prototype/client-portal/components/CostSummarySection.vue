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
  <section class="space-y-4">
    <div class="mt-12">
      <h2 class="text-lg font-semibold tracking-tight text-slate-900">Investment Summary</h2>
      <p class="text-sm text-slate-600">Choose the path that fits — you can add upgrades later.</p>
    </div>
    <div class="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm shadow-sm">
      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {{ proposal.costSummary.rangeLabel }}
          </p>
          <p class="text-xl font-semibold text-slate-900">
            {{ proposal.costSummary.rangeValue }}
          </p>
        </div>
        <div
          class="rounded-full px-3 py-1 text-[0.8rem] font-semibold uppercase tracking-wide text-slate-50"
          :class="themeClasses.accentBg"
        >
          No obligation until you approve
        </div>
      </div>

      <p class="text-sm leading-relaxed text-slate-700">
        {{ proposal.costSummary.note }}
      </p>
      <p class="text-[0.85rem] text-slate-600">
        Lock in your project with zero obligation — you only proceed when you’re ready.
      </p>
    </div>
  </section>
</template>
