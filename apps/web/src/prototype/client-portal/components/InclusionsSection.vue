<script setup lang="ts">
import type { InclusionGroup } from "../data/mockProposal";

defineProps<{
  title: string;
  groups: InclusionGroup[];
  variant?: "default" | "subtle";
  description?: string;
}>();
</script>

<template>
  <section class="mt-16 space-y-4">
    <div>
      <h2 class="text-lg sm:text-xl font-semibold tracking-tight text-slate-900 mb-2">
        {{ title }}
      </h2>
      <p v-if="description" class="text-sm text-slate-500 mb-4">
        {{ description }}
      </p>
    </div>
    <div
      class="space-y-5 rounded-2xl border bg-white p-5 text-sm shadow-sm sm:p-6"
      :class="variant === 'subtle' ? 'border-dashed border-slate-200 bg-slate-50' : 'border-slate-200/80'"
    >
      <div v-for="group in groups" :key="group.id" class="space-y-2.5">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {{ group.title }}
        </p>
        <ul class="space-y-1.5 text-sm leading-relaxed text-slate-700">
          <li v-for="item in group.items" :key="item" class="flex gap-2">
            <span class="mt-[6px] h-[6px] w-[6px] flex-none rounded-full bg-slate-300" />
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
