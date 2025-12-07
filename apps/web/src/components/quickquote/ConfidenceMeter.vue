<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  label: string;
  low: number;
  high: number;
  base: number;
  pulseKey?: number;
}>();

const confidence = computed(() => {
  const base = props.base || 1;
  const raw = 100 - ((props.high - props.low) / base) * 100;
  const clamped = Math.min(95, Math.max(10, raw));
  return Math.round(clamped);
});

const tier = computed(() => {
  const value = confidence.value;
  if (value >= 80) return { label: "High", color: "from-emerald-400 to-emerald-600", text: "text-emerald-700" };
  if (value >= 60) return { label: "Medium", color: "from-blue-400 to-blue-600", text: "text-blue-700" };
  if (value >= 40) return { label: "Low", color: "from-amber-400 to-amber-600", text: "text-amber-700" };
  return { label: "Very low", color: "from-rose-400 to-rose-600", text: "text-rose-700" };
});

const widthStyle = computed(() => ({ width: `${confidence.value}%` }));
</script>

<template>
  <div class="space-y-1">
    <div class="flex items-center justify-between text-sm">
      <div class="flex items-center gap-2">
        <span class="font-semibold text-slate-900">{{ label }}</span>
        <span class="text-xs text-slate-500">{{ tier.label }} confidence</span>
      </div>
      <span class="text-sm font-semibold" :class="tier.text">{{ confidence }}%</span>
    </div>
    <div class="h-2 rounded-full bg-slate-200">
      <div
        class="h-2 rounded-full bg-gradient-to-r transition-all duration-300"
        :class="[tier.color, pulseKey ? 'animate-pulse' : '']"
        :style="widthStyle"
      ></div>
    </div>
  </div>
</template>
