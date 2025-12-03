<template>
  <div
    class="relative flex h-full flex-col overflow-hidden rounded-3xl border bg-white transition hover:-translate-y-1"
    :class="cardClass"
  >
    <div v-if="theme === 'best'" class="pointer-events-none absolute inset-0">
      <div class="absolute inset-4 rounded-3xl bg-amber-200/20 blur-3xl animate-pulse-slow"></div>
      <div class="sparkles absolute inset-0"></div>
    </div>

    <div class="relative flex-1 p-6">
      <div class="flex items-start justify-between">
        <Badge :variant="theme === 'good' ? 'subtle' : 'solid'" :tone="tone">
          {{ tier || option.badge || "Option" }}
        </Badge>
        <span
          class="rounded-full px-3 py-1 text-xs font-semibold"
          :class="selected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'"
        >
          {{ selected ? "Selected" : "Available" }}
        </span>
      </div>

      <div
        class="mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-white via-white to-slate-50 ring-1 ring-slate-100"
      >
        <img :src="fenceImage" alt="Fence illustration" class="h-40 w-full object-cover" />
      </div>

      <div class="mt-5 space-y-3">
        <div class="flex items-center justify-between gap-3">
          <h3 class="text-xl font-semibold text-slate-900">{{ option.title }}</h3>
          <Chip icon="M" :label="materialLabel" />
        </div>

        <ul class="space-y-2 text-sm text-slate-700">
          <li v-for="feat in option.features" :key="feat" class="flex items-start gap-2">
            <span class="mt-1 h-2 w-2 rounded-full" :class="bulletClass"></span>
            <span>{{ feat }}</span>
          </li>
        </ul>

        <div class="flex flex-wrap gap-2">
          <Chip v-for="chip in chips" :key="chip.label" :icon="chip.icon" :label="chip.label" />
        </div>

        <div class="rounded-2xl bg-white/80 p-4 ring-1 ring-inset" :class="priceRingClass">
          <div class="flex items-baseline justify-between gap-3">
            <div>
              <p class="text-xs uppercase tracking-[0.14em] text-slate-500">Project Investment</p>
              <p class="text-3xl font-bold text-slate-900">{{ option.price }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs uppercase tracking-[0.14em] text-slate-500">Deposit</p>
              <p class="text-lg font-semibold text-slate-800">{{ option.deposit }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-5 space-y-3">
        <OptionDetails
          :included="option.included || []"
          :excluded="option.excluded || []"
          :accent="tone"
        />
      </div>
    </div>

    <div class="relative border-t border-slate-200/80 bg-white/90 p-4">
      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition"
        :class="buttonClass"
        @click="handleSelect"
      >
        <span v-if="selected">Selected</span>
        <span v-else>Select Option</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Badge from "../ui/Badge.vue";
import Chip from "../ui/Chip.vue";
import OptionDetails from "./OptionDetails.vue";

interface ProposalOption {
  id: string;
  title: string;
  features: string[];
  material: string;
  price: string;
  deposit: string;
  badge?: string | null;
  included?: string[];
  excluded?: string[];
  chips?: { icon: string; label: string }[];
}

const props = defineProps<{
  option: ProposalOption;
  tier?: string | null;
  theme: "good" | "better" | "best";
  selected?: boolean;
}>();

const emit = defineEmits<{
  (e: "select", optionId: string): void;
}>();

const tone = computed(() => {
  if (props.theme === "best") return "amber";
  if (props.theme === "better") return "blue";
  return "slate";
});

const fenceImage = "/proposal-visuals/generic-good.svg";

const cardClass = computed(() => {
  if (props.theme === "best") return "border-amber-500 bg-amber-50 shadow-lg shadow-amber-100";
  if (props.theme === "better") return "border-blue-500 bg-blue-50 shadow-md shadow-blue-100";
  return "border-slate-200 bg-white shadow-sm";
});

const priceRingClass = computed(() => {
  if (props.theme === "best") return "ring-amber-200";
  if (props.theme === "better") return "ring-blue-200";
  return "ring-slate-200";
});

const buttonClass = computed(() => {
  if (props.selected) {
    return "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700";
  }
  if (props.theme === "best") return "bg-amber-500 text-slate-900 shadow-sm hover:bg-amber-600";
  if (props.theme === "better") return "bg-blue-600 text-white shadow-sm hover:bg-blue-700";
  return "bg-slate-800 text-white shadow-sm hover:bg-slate-900";
});

const bulletClass = computed(() => {
  if (props.theme === "best") return "bg-amber-500";
  if (props.theme === "better") return "bg-blue-500";
  return "bg-slate-400";
});

const chips = computed(() => {
  if (props.option.chips && props.option.chips.length) return props.option.chips;
  return [
    { icon: "D", label: props.option.material },
    { icon: "H", label: "6 ft height" },
    { icon: "G", label: "Walk + drive gates" },
  ];
});

const materialLabel = computed(() => props.option.material || "Premium fence system");

const handleSelect = () => emit("select", props.option.id);
</script>

<style scoped>
@keyframes spark {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-6px) scale(1.05);
    opacity: 0.2;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.6;
  }
}
.sparkles::before,
.sparkles::after {
  content: "";
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 20% 30%, rgba(251, 191, 36, 0.18) 0, transparent 25%),
    radial-gradient(circle at 70% 20%, rgba(251, 191, 36, 0.14) 0, transparent 24%),
    radial-gradient(circle at 40% 80%, rgba(251, 191, 36, 0.16) 0, transparent 22%);
  animation: spark 6s ease-in-out infinite;
  pointer-events: none;
}
.animate-pulse-slow {
  animation: pulse 4s ease-in-out infinite;
}
</style>
