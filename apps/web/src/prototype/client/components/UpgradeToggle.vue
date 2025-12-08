<script setup lang="ts">
import type { Upgrade } from "../optionsData";

const props = defineProps<{
  upgrade: Upgrade;
  selected: boolean;
}>();

const emit = defineEmits<{
  (e: "toggle"): void;
}>();
</script>

<template>
  <div
    class="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition-all duration-300"
    :class="selected ? 'ring-2 ring-emerald-200 shadow-lg animate-[pulse_1s_ease-out]' : ''"
  >
    <div class="space-y-1">
      <p class="text-sm font-semibold text-slate-900">{{ upgrade.label }}</p>
      <p class="text-xs text-slate-600">{{ upgrade.description }}</p>
    </div>
    <div class="flex flex-col items-end gap-1 text-right">
      <span class="text-xs font-semibold text-slate-700 transition-transform duration-200" :class="selected ? 'translate-x-1' : ''">
        +{{ upgrade.priceDelta.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) }}
      </span>
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200"
        :class="selected ? 'bg-emerald-600 text-white shadow-inner' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
        @click.stop="emit('toggle')"
      >
        {{ selected ? "Added" : "Add" }}
      </button>
    </div>
  </div>
</template>
