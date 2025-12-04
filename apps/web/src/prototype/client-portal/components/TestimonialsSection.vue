<script setup lang="ts">
import type { ProposalData } from "../data/mockProposal";

defineProps<{
  proposal: ProposalData;
}>();

const starArray = (rating: number) => Array.from({ length: 5 }, (_, i) => i < rating);
</script>

<template>
  <section class="space-y-4">
    <div class="mt-12">
      <h2 class="text-lg font-semibold tracking-tight text-slate-900">What other homeowners are saying</h2>
      <p class="text-sm text-slate-600">Proof from recent projects in your area.</p>
    </div>
    <div class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm shadow-sm">
      <article
        v-for="t in proposal.testimonials"
        :key="t.id"
        class="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-[2px] hover:shadow-md"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-700">
              {{ t.name.charAt(0) }}
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-900">{{ t.name }}</p>
              <p class="text-[0.85rem] text-slate-600">{{ t.location }}</p>
            </div>
          </div>
          <div class="flex items-center gap-1 text-base">
            <span
              v-for="(filled, i) in starArray(t.rating)"
              :key="i"
              :class="filled ? 'text-amber-400' : 'text-slate-300'"
            >
              ★
            </span>
          </div>
        </div>
        <div class="mt-3 flex items-start gap-3 text-sm leading-relaxed text-slate-700">
          <span class="text-lg text-slate-300">“</span>
          <p>{{ t.quote }}</p>
        </div>
      </article>
    </div>
  </section>
</template>
