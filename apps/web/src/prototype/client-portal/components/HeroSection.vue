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
    class="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-50 shadow-xl transition-all duration-300 ease-out"
  >
    <div class="p-6 sm:p-8 space-y-4">
      <div class="flex items-start justify-between gap-6">
        <div class="space-y-1.5">
          <p class="text-[11px] uppercase tracking-[0.2em] text-slate-300">Proposal for</p>
          <h1 class="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
            {{ proposal.clientName }}
          </h1>
          <p class="text-sm leading-relaxed text-slate-200">
            {{ proposal.projectTitle }}
          </p>
          <p class="text-xs text-slate-300">
            {{ proposal.projectAddress }}
          </p>
        </div>

        <div class="flex flex-col items-end gap-2">
          <div v-if="proposal.contractorBrand.logoUrl" class="h-14 w-14 overflow-hidden rounded-2xl bg-slate-700">
            <img :src="proposal.contractorBrand.logoUrl" alt="Contractor logo" class="h-full w-full object-cover" />
          </div>
          <p class="text-xs text-slate-300">From</p>
          <p class="text-[0.8rem] font-semibold text-slate-50">
            {{ proposal.contractorBrand.name }}
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2 text-xs text-slate-200">
        <span class="rounded-full bg-slate-800/80 px-3 py-1 shadow-sm">
          Sent {{ proposal.createdAt }}
        </span>
        <span class="rounded-full bg-slate-800/80 px-3 py-1 shadow-sm">
          Expires {{ proposal.expiresAt }}
        </span>
        <span class="rounded-full px-3 py-1 font-semibold shadow-sm" :class="themeClasses.accentBg">
          3 package options
        </span>
      </div>

      <p class="text-sm leading-relaxed text-slate-200">
        {{ proposal.summaryBlurb }}
      </p>
    </div>
  </header>
</template>
