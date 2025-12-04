<script setup lang="ts">
import type { ProposalData } from "../data/mockProposal";

defineProps<{
  proposal: ProposalData;
}>();
</script>

<template>
  <section class="mt-6 space-y-4 sm:mt-12">
    <div>
      <h2 class="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 mb-2">Project Photos & Inspiration</h2>
      <p class="text-sm text-slate-500 mb-4">Visualize the finish level we're targeting for your project.</p>
    </div>
    <div class="relative">
      <div class="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-slate-50 to-transparent"></div>
      <div class="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-slate-50 to-transparent"></div>
      <div class="flex gap-3 snap-x snap-mandatory overflow-x-auto overscroll-x-contain sm:gap-4">
        <div
          v-for="url in proposal.galleryUrls"
          :key="url"
          class="h-40 w-60 shrink-0 snap-start overflow-hidden rounded-lg bg-slate-200 border border-slate-200/70 transition-all duration-300 ease-out sm:h-40 sm:w-64 sm:rounded-2xl sm:shadow-md sm:hover:-translate-y-1 sm:hover:shadow-lg"
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
