<template>
  <nav class="w-full">
    <ol class="grid grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-md sm:grid-cols-4 lg:grid-cols-8">
      <li
        v-for="(step, index) in steps"
        :key="step.id"
        class="flex items-center gap-3 rounded-xl px-3 py-2 transition"
        :class="{
          'bg-emerald-50 border border-emerald-100 shadow-sm': index === currentIndex,
          'bg-slate-50 border border-slate-100': index !== currentIndex,
        }"
      >
        <div
          class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition"
          :class="index < currentIndex ? 'bg-emerald-600 text-white' : index === currentIndex ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'"
        >
          <span v-if="index < currentIndex">✓</span>
          <span v-else>{{ index + 1 }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{{ step.label }}</span>
          <span class="text-[11px] text-slate-500">{{ step.sub }}</span>
        </div>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue";

export type OnboardingStepId =
  | "upload"
  | "processing"
  | "trade"
  | "profile"
  | "lineitems"
  | "proposal"
  | "client"
  | "send";

const props = defineProps<{
  currentStep: OnboardingStepId;
}>();

const steps: { id: OnboardingStepId; label: string; sub: string }[] = [
  { id: "upload", label: "Upload", sub: "Drop your old file" },
  { id: "processing", label: "Processing", sub: "We scan for details" },
  { id: "trade", label: "Trade detection", sub: "Confirm your niche" },
  { id: "profile", label: "Profile", sub: "Auto-fill & edit" },
  { id: "lineitems", label: "Line items", sub: "Extracted pricing" },
  { id: "proposal", label: "Proposal template", sub: "Good / Better / Best" },
  { id: "client", label: "Client view", sub: "Portal preview" },
  { id: "send", label: "Send", sub: "Send your first one" },
];

const currentIndex = computed(() => {
  const idx = steps.findIndex((step) => step.id === props.currentStep);
  return idx === -1 ? 0 : idx;
});
</script>
