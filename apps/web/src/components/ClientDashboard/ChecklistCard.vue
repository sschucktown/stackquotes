<script setup lang="ts">
import { computed } from "vue";
import { CheckCircleIcon } from "@heroicons/vue/24/outline";

type Item = {
  label: string;
  complete: boolean;
};

const props = defineProps<{
  items: Item[];
}>();

const emit = defineEmits<{
  (event: "open"): void;
}>();

const completedCount = computed(() => props.items.filter((item) => item.complete).length);
const progressPercent = computed(() =>
  props.items.length ? Math.min(100, Math.round((completedCount.value / props.items.length) * 100)) : 0
);
const preview = computed(() => props.items.slice(0, 5));
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Pre-construction checklist</p>
        <p class="text-sm text-slate-600">Quick things that make day one smooth.</p>
      </div>
      <span class="text-xs font-semibold text-slate-500">{{ completedCount }} / {{ props.items.length }}</span>
    </div>

    <div class="mt-3 h-2 w-full rounded-full bg-slate-100">
      <div
        class="h-2 rounded-full bg-emerald-500 transition-all"
        :style="{ width: `${progressPercent}%` }"
      />
    </div>

    <ul class="mt-3 space-y-2">
      <li
        v-for="(item, index) in preview"
        :key="item.label"
        class="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2"
        :class="index >= 3 ? 'pointer-events-none opacity-50' : ''"
      >
        <CheckCircleIcon
          class="mt-[1px] h-5 w-5"
          :class="item.complete ? 'text-emerald-600' : 'text-slate-300'"
        />
        <span class="text-sm text-slate-800">{{ item.label }}</span>
      </li>
    </ul>

    <div class="mt-3 flex items-center justify-between gap-3">
      <p class="text-xs text-slate-500">Optional but recommended.</p>
      <button
        type="button"
        class="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-slate-800"
        @click="emit('open')"
      >
        Open checklist
      </button>
    </div>
  </section>
</template>
