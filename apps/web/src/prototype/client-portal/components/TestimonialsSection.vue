<script setup lang="ts">
import type { ProposalData } from "../data/mockProposal";

defineProps<{
  proposal: ProposalData;
}>();

const starArray = (rating: number) => Array.from({ length: 5 }, (_, i) => i < rating);
</script>

<template>
  <section class="mt-16 space-y-4">
    <div>
      <h2 class="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 mb-2">What other homeowners are saying</h2>
      <p class="text-sm text-slate-500 mb-4">Proof from recent projects in your area.</p>
    </div>
    <div class="rounded-2xl border border-slate-200/60 bg-white p-6 text-sm shadow-sm sm:p-7 space-y-5">
      <article
        v-for="(t, index) in proposal.testimonials"
        :key="t.id"
        class="space-y-3"
        :class="index !== 0 ? 'border-t border-slate-200/60 pt-5' : ''"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-700">
              {{ t.name.charAt(0) }}
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-900">{{ t.name }}</p>
              <p class="text-xs text-slate-500">{{ t.location }}</p>
            </div>
          </div>
          <div class="flex items-center gap-[2px] text-amber-400">
            <svg
              v-for="(filled, i) in starArray(t.rating)"
              :key="i"
              class="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
              :class="filled ? 'opacity-100' : 'opacity-30'"
            >
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.785.57-1.84-.197-1.54-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z"
              />
            </svg>
          </div>
        </div>
        <div class="text-sm leading-relaxed text-slate-700">
          <p class="text-base font-medium text-slate-900">“{{ t.quote }}”</p>
        </div>
      </article>
    </div>
  </section>
</template>
