<script setup lang="ts">
import type { ProposalData } from "../data/mockProposal";

defineProps<{
  proposal: ProposalData;
}>();
</script>

<template>
  <section class="space-y-3">
    <h2 class="text-lg font-semibold tracking-tight text-slate-900">Terms & Warranty</h2>
    <div class="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700 shadow-sm">
      <ul class="space-y-1.5 leading-relaxed">
        <li v-for="t in proposal.terms" :key="t" class="flex gap-2">
          <span class="mt-[5px] h-[5px] w-[5px] flex-none rounded-full bg-slate-300" />
          <span>{{ t }}</span>
        </li>
      </ul>
      <div class="mt-2 border-t border-slate-200 pt-2 text-[0.9rem]">
        <p class="font-semibold text-slate-900">Warranty</p>
        <p class="mt-1 leading-relaxed">
          {{ proposal.warranty }}
        </p>
      </div>
    </div>
  </section>
</template>
