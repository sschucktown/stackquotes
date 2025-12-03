<script setup lang="ts">
import type { ProposalData } from "../data/mockProposal";

defineProps<{
  proposal: ProposalData;
}>();
</script>

<template>
  <section class="space-y-3">
    <div>
      <h2 class="text-lg font-semibold tracking-tight text-slate-900">Project Photos & Inspiration</h2>
      <p class="text-sm text-slate-600">Visualize the finish level we’re targeting for your project.</p>
    </div>
    <div class="overflow-x-auto">
      <div class="flex gap-4">
        <div
          v-for="url in proposal.galleryUrls"
          :key="url"
          class="h-40 w-64 flex-none overflow-hidden rounded-2xl bg-slate-200 shadow-md ring-1 ring-slate-100 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg"
        >
          <div class="relative h-full w-full">
            <img :src="url" alt="Deck preview" class="h-full w-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
