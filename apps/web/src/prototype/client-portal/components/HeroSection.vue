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
  <header
    class="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-50 shadow-lg"
  >
    <div class="p-4 sm:p-6">
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-xs uppercase tracking-wide text-slate-300">Proposal for</p>
          <h1 class="mt-1 text-xl font-semibold sm:text-2xl">
            {{ proposal.clientName }}
          </h1>
          <p class="mt-1 text-sm text-slate-300">
            {{ proposal.projectTitle }}
          </p>
          <p class="mt-1 text-xs text-slate-400">
            {{ proposal.projectAddress }}
          </p>
        </div>

        <div class="flex flex-col items-end gap-2">
          <div v-if="proposal.contractorBrand.logoUrl" class="h-12 w-12 overflow-hidden rounded-full bg-slate-700">
            <img :src="proposal.contractorBrand.logoUrl" alt="Contractor logo" class="h-full w-full object-cover" />
          </div>
          <p class="text-xs text-slate-300">From</p>
          <p class="text-[0.75rem] font-medium">
            {{ proposal.contractorBrand.name }}
          </p>
        </div>
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-300">
        <span class="rounded-full bg-slate-800/80 px-3 py-1">
          Sent {{ proposal.createdAt }}
        </span>
        <span class="rounded-full bg-slate-800/80 px-3 py-1">
          Expires {{ proposal.expiresAt }}
        </span>
        <span class="rounded-full bg-slate-50/10 px-3 py-1 font-medium" :class="themeClasses.accentBg">
          3 package options
        </span>
      </div>

      <p class="mt-4 text-sm text-slate-200">
        {{ proposal.summaryBlurb }}
      </p>
    </div>
  </header>
</template>
