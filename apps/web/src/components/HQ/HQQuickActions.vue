<template>
  <div class="flex flex-wrap gap-4 sm:gap-5 md:gap-6">
    <div
      v-for="action in actions"
      :key="action.label"
      class="flex min-w-[120px] flex-1 basis-[140px] flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-4 text-center shadow-sm transition hover:shadow"
    >
      <div
        class="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.06)]"
      >
        <component :is="iconMap[action.icon]" class="h-6 w-6" />
      </div>
      <span class="text-sm font-medium text-slate-800">{{ action.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h } from "vue";
type ActionIcon = "document" | "sparkles" | "swap" | "calendar" | "card";

const actions = [
  { label: "New Quote", icon: "document" as ActionIcon },
  { label: "New Proposal", icon: "sparkles" as ActionIcon },
  { label: "Change Order", icon: "swap" as ActionIcon },
  { label: "Schedule Visit", icon: "calendar" as ActionIcon },
  { label: "Send Payment Link", icon: "card" as ActionIcon },
];

const makeIcon = (path: string) => ({
  render() {
    return h(
      "svg",
      { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor" },
      h("path", { d: path })
    );
  },
});

const iconMap: Record<ActionIcon, any> = {
  document: makeIcon("M6 2h8l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm7 2H6v16h12V8h-5V4Z"),
  sparkles: makeIcon("M12 2 9.8 8.2 4 10l5.8 1.8L12 18l2.2-6.2L20 10l-5.8-1.8L12 2Zm-6 11-1 2-2 1 2 1 1 2 1-2 2-1-2-1-1-2Zm12 0-1 2-2 1 2 1 1 2 1-2 2-1-2-1-1-2Z"),
  swap: makeIcon("M7 2 1 8h4v5h2V8h4L7 2Zm10 20 6-6h-4v-5h-2v5h-4l4 6Z"),
  calendar: makeIcon("M7 2h2v2h6V2h2v2h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3V2Zm13 8H4v10h16V10Z"),
  card: makeIcon("M3 5h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm18 4V7H3v2h18ZM3 17h18v-4H3v4Z"),
};
</script>
