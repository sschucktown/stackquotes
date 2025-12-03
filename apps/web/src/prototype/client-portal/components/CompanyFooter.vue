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
  <footer class="space-y-3 pb-6">
    <div class="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm">
      <div
        v-if="proposal.contractorBrand.logoUrl"
        class="h-12 w-12 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200"
      >
        <img :src="proposal.contractorBrand.logoUrl" alt="Brand logo" class="h-full w-full object-cover" />
      </div>
      <div class="space-y-1">
        <p class="text-sm font-semibold text-slate-900">
          {{ proposal.contractorBrand.name }}
        </p>
        <p class="text-sm leading-relaxed text-slate-700">
          {{ proposal.footerNote }}
        </p>
      </div>
    </div>
    <p class="text-center text-[0.7rem] text-slate-400">
      Powered by StackQuotes — proposal viewer prototype
    </p>
  </footer>
</template>
