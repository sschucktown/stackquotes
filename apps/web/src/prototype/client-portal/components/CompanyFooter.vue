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
  <footer class="space-y-2 pb-4">
    <div class="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600 shadow-sm">
      <p class="font-semibold text-slate-800">
        {{ proposal.contractorBrand.name }}
      </p>
      <p class="mt-1">
        {{ proposal.footerNote }}
      </p>
    </div>
    <p class="text-center text-[0.65rem] text-slate-400">
      Powered by StackQuotes — proposal viewer prototype
    </p>
  </footer>
</template>
