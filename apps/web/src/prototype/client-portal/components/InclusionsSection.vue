<script setup lang="ts">
import type { InclusionGroup } from "../data/mockProposal";

defineProps<{
  title: string;
  groups: InclusionGroup[];
  variant?: "default" | "subtle";
}>();
</script>

<template>
  <section class="space-y-2">
    <h2 class="text-sm font-semibold text-slate-800">
      {{ title }}
    </h2>
    <div
      class="space-y-3 rounded-2xl border bg-white p-4 text-sm shadow-sm"
      :class="variant === 'subtle' ? 'border-dashed border-slate-200 bg-slate-50' : 'border-slate-200'"
    >
      <div v-for="group in groups" :key="group.id" class="space-y-1">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {{ group.title }}
        </p>
        <ul class="space-y-1 text-xs text-slate-600">
          <li v-for="item in group.items" :key="item" class="flex gap-2">
            <span class="mt-[3px] h-[5px] w-[5px] flex-none rounded-full bg-slate-300" />
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>
