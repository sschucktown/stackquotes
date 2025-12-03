<script setup lang="ts">
import type { ProposalData } from "../data/mockProposal";

defineProps<{
  proposal: ProposalData;
}>();
</script>

<template>
  <section class="space-y-2">
    <h2 class="text-sm font-semibold text-slate-800">Terms & Warranty</h2>
    <div class="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600 shadow-sm">
      <ul class="space-y-1">
        <li v-for="t in proposal.terms" :key="t" class="flex gap-2">
          <span class="mt-[3px] h-[4px] w-[4px] flex-none rounded-full bg-slate-300" />
          <span>{{ t }}</span>
        </li>
      </ul>
      <div class="mt-2 border-t border-slate-100 pt-2 text-[0.75rem]">
        <p class="font-semibold text-slate-800">Warranty</p>
        <p class="mt-1">
          {{ proposal.warranty }}
        </p>
      </div>
    </div>
  </section>
</template>
