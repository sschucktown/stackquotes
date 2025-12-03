<script setup lang="ts">
import type { ProposalData } from "../data/mockProposal";

defineProps<{
  proposal: ProposalData;
}>();

const starArray = (rating: number) => Array.from({ length: 5 }, (_, i) => i < rating);
</script>

<template>
  <section class="space-y-2">
    <h2 class="text-sm font-semibold text-slate-800">What other homeowners are saying</h2>
    <div class="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
      <article v-for="t in proposal.testimonials" :key="t.id" class="border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
        <div class="flex items-center justify-between gap-2">
          <div>
            <p class="text-xs font-semibold text-slate-800">
              {{ t.name }}
            </p>
            <p class="text-[0.7rem] text-slate-500">
              {{ t.location }}
            </p>
          </div>
          <div class="flex items-center gap-1">
            <span
              v-for="(filled, i) in starArray(t.rating)"
              :key="i"
              class="text-xs"
              :class="filled ? 'text-amber-400' : 'text-slate-300'"
            >
              ★
            </span>
          </div>
        </div>
        <p class="mt-1 text-xs text-slate-600">
          "{{ t.quote }}"
        </p>
      </article>
    </div>
  </section>
</template>
