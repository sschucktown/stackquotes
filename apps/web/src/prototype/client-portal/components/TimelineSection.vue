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
  <section class="space-y-3">
    <div>
      <h2 class="text-lg font-semibold tracking-tight text-slate-900">What the process looks like</h2>
      <p class="text-sm text-slate-600">Exactly how we move from approval to completion.</p>
    </div>
    <div class="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm">
      <div v-for="(step, index) in proposal.timeline" :key="step.id" class="flex gap-4">
        <div class="flex flex-col items-center">
          <div
            class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-slate-50 shadow-sm"
            :class="themeClasses.accentBg"
          >
            {{ index + 1 }}
          </div>
          <div v-if="index < proposal.timeline.length - 1" class="mt-1 h-full w-px flex-1 bg-slate-200" />
        </div>
        <div class="flex-1 space-y-1.5">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {{ step.label }}
          </p>
          <p class="text-sm leading-relaxed text-slate-700">
            {{ step.description }}
          </p>
          <p class="text-[0.8rem] font-medium text-slate-600">
            Typical timing: {{ step.days }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
