<script setup lang="ts">
import type { ProposalData } from "../data/mockProposal";

defineProps<{
  proposal: ProposalData;
}>();
</script>

<template>
  <section class="space-y-2">
    <h2 class="text-sm font-semibold text-slate-800">Project Photos & Inspiration</h2>
    <div class="overflow-x-auto">
      <div class="flex gap-3">
        <div
          v-for="url in proposal.galleryUrls"
          :key="url"
          class="h-40 w-64 flex-none overflow-hidden rounded-xl bg-slate-200 shadow-sm"
        >
          <img :src="url" alt="Deck preview" class="h-full w-full object-cover" />
        </div>
      </div>
    </div>
  </section>
</template>
