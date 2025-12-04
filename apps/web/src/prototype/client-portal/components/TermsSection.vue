<script setup lang="ts">
import type { ProposalData } from "../data/mockProposal";

defineProps<{
  proposal: ProposalData;
}>();
</script>

<template>
  <section class="mt-16 space-y-4 sm:mt-16">
    <div>
      <h2 class="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 mb-2">Terms & Warranty</h2>
      <p class="text-sm text-slate-500 mb-4">Clear guardrails so you know exactly what to expect.</p>
    </div>
    <div class="space-y-4 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm sm:rounded-2xl sm:border-slate-200/80 sm:p-7">
      <div>
        <p class="text-sm font-semibold text-slate-900">Terms</p>
        <ul class="mt-3 space-y-1.5 text-sm leading-relaxed">
          <li v-for="t in proposal.terms" :key="t" class="flex gap-2">
            <span class="mt-[6px] h-[6px] w-[6px] flex-none rounded-full bg-slate-300" />
            <span>{{ t }}</span>
          </li>
        </ul>
      </div>
      <div class="pt-1">
        <p class="text-sm font-semibold text-slate-900">Warranty</p>
        <ul class="mt-3 space-y-1.5 text-sm leading-relaxed">
          <li class="flex gap-2">
            <span class="mt-[6px] h-[6px] w-[6px] flex-none rounded-full bg-slate-300" />
            <span>{{ proposal.warranty }}</span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
