<script setup lang="ts">
import type { OptionKey } from "./types";

const props = defineProps<{
  open: boolean;
  optionKey: OptionKey | null;
  upgrades: {
    id: string;
    label: string;
    desc: string;
    photo?: string;
  }[];
  selected: string[];
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "toggle", payload: { option: OptionKey; id: string; value: boolean }): void;
}>();
</script>

<template>
  <div
    v-if="open && optionKey"
    class="fixed inset-0 z-40 flex items-end justify-center bg-slate-900/40 px-4 py-6 backdrop-blur sm:items-center"
    @click.self="emit('close')"
  >
    <div class="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Edit options</p>
          <h3 class="text-lg font-semibold text-slate-900">Toggle upgrades for {{ optionKey }}</h3>
          <p class="text-sm text-slate-600">No pricing here. Just pick what to include.</p>
        </div>
        <button
          type="button"
          class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          @click="emit('close')"
        >
          Close
        </button>
      </div>

      <div class="mt-4 grid gap-3 sm:grid-cols-2">
        <div
          v-for="upgrade in upgrades"
          :key="upgrade.id"
          class="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-inner"
        >
          <div class="flex items-start gap-3">
            <div class="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-slate-200 to-slate-300">
              <img v-if="upgrade.photo" :src="upgrade.photo" class="h-full w-full object-cover" alt="" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-semibold text-slate-900">{{ upgrade.label }}</p>
              <p class="text-xs text-slate-600">{{ upgrade.desc }}</p>
            </div>
          </div>
          <div class="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Include in {{ optionKey }}</p>
            <button
              type="button"
              class="relative inline-flex h-6 w-11 cursor-pointer rounded-full border border-slate-200 transition"
              :class="selected.includes(upgrade.id) ? 'bg-emerald-200' : 'bg-slate-200'"
              role="switch"
              :aria-checked="selected.includes(upgrade.id)"
              @click="emit('toggle', { option: optionKey, id: upgrade.id, value: !selected.includes(upgrade.id) })"
            >
              <span
                class="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition"
                :class="selected.includes(upgrade.id) ? 'translate-x-5' : ''"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
