<script setup lang="ts">
import type { OptionKey, Upgrade } from "@/stores/smartProposalPrototype";

const props = defineProps<{
  open: boolean;
  optionKey: OptionKey | null;
  optionLabel?: string;
  upgrades: Upgrade[];
  price: number;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "toggle", payload: { option: OptionKey; id: string; value: boolean }): void;
}>();

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="translate-x-full opacity-0"
    enter-to-class="translate-x-0 opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="translate-x-0 opacity-100"
    leave-to-class="translate-x-full opacity-0"
  >
    <div v-if="open && optionKey" class="fixed inset-0 z-40 flex justify-end bg-slate-900/40 backdrop-blur" @click.self="emit('close')">
      <div class="flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl">
        <div class="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Customize {{ optionLabel || optionKey }}</p>
            <p class="text-sm text-slate-600">Toggle upgrades. Pricing updates automatically.</p>
            <p class="text-lg font-semibold text-slate-900">{{ formatCurrency(price) }}</p>
          </div>
          <button
            type="button"
            class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            @click="emit('close')"
          >
            Done
          </button>
        </div>

        <div class="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          <div
            v-for="upgrade in upgrades"
            :key="upgrade.id"
            class="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 shadow-inner"
          >
            <div class="space-y-1">
              <p class="text-sm font-semibold text-slate-900">{{ upgrade.label }}</p>
              <p class="text-xs text-slate-600">{{ upgrade.desc }}</p>
            </div>
            <button
              type="button"
              class="relative inline-flex h-6 w-11 cursor-pointer rounded-full border border-slate-200 transition"
              :class="upgrade.active ? 'bg-emerald-200' : 'bg-slate-200'"
              role="switch"
              :aria-checked="upgrade.active"
              @click="emit('toggle', { option: optionKey, id: upgrade.id, value: !upgrade.active })"
            >
              <span
                class="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition"
                :class="upgrade.active ? 'translate-x-5' : ''"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
