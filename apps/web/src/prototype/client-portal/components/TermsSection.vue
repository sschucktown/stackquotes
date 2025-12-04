<script setup lang="ts">
import type { ProposalData } from "../data/mockProposal";

defineProps<{
  proposal: ProposalData;
}>();
</script>

<template>
  <section class="space-y-4">
    <div class="mt-12">
      <h2 class="text-lg font-semibold tracking-tight text-slate-900">Terms & Warranty</h2>
    </div>
    <div class="space-y-3 rounded-2xl border border-slate-200/50 bg-slate-50 p-6 text-sm text-slate-700 shadow-sm">
      <ul class="space-y-1.5 leading-relaxed">
        <li v-for="t in proposal.terms" :key="t" class="flex gap-2">
          <span class="mt-[5px] h-[5px] w-[5px] flex-none rounded-full bg-slate-400" />
          <span>{{ t }}</span>
        </li>
      </ul>
      <div class="mt-3 border-t border-slate-200 pt-3 text-[0.95rem]">
        <p class="font-semibold text-slate-900">Warranty</p>
        <p class="mt-1 leading-relaxed">
          {{ proposal.warranty }}
        </p>
      </div>
    </div>
  </section>
</template>
