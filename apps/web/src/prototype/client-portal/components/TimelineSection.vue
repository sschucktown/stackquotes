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
    <h2 class="text-sm font-semibold text-slate-800">What the process looks like</h2>
    <div class="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
      <div v-for="(step, index) in proposal.timeline" :key="step.id" class="flex gap-3">
        <div class="flex flex-col items-center">
          <div class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-slate-50" :class="themeClasses.accentBg">
            {{ index + 1 }}
          </div>
          <div v-if="index < proposal.timeline.length - 1" class="mt-1 h-full w-px flex-1 bg-slate-200" />
        </div>
        <div class="flex-1 space-y-1">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {{ step.label }}
          </p>
          <p class="text-xs text-slate-600">
            {{ step.description }}
          </p>
          <p class="text-[0.7rem] font-medium text-slate-500">
            Typical timing: {{ step.days }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
