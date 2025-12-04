<template>
  <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:flex lg:flex-wrap lg:gap-5">
    <div
      v-for="action in actions"
      :key="action.label"
      class="flex min-h-[130px] min-w-[120px] flex-1 basis-[140px] flex-col items-center gap-2 rounded-xl border border-slate-200 px-3 py-4 text-center shadow-sm transition hover:-translate-y-[1px] hover:scale-[1.03] hover:shadow-md"
      :class="action.tint"
    >
      <div
        class="flex h-14 w-14 items-center justify-center rounded-full bg-white/70 text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
      >
        <component :is="iconMap[action.icon]" class="h-6 w-6" :class="action.iconClass" />
      </div>
      <span class="text-sm font-medium text-slate-800">{{ action.label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h } from "vue";
type ActionIcon = "document" | "sparkles" | "swap" | "calendar" | "card";

const actions = [
  { label: "New Quote", icon: "document" as ActionIcon, tint: "bg-blue-50/80", iconClass: "text-blue-600" },
  { label: "New Proposal", icon: "sparkles" as ActionIcon, tint: "bg-violet-50/80", iconClass: "text-violet-600" },
  { label: "Change Order", icon: "swap" as ActionIcon, tint: "bg-orange-50/80", iconClass: "text-orange-600" },
  { label: "Schedule Visit", icon: "calendar" as ActionIcon, tint: "bg-green-50/80", iconClass: "text-green-600" },
  { label: "Send Payment Link", icon: "card" as ActionIcon, tint: "bg-amber-50/80", iconClass: "text-amber-600" },
];

const makeIcon = (paths: string | string[]) => ({
  render() {
    const parts = Array.isArray(paths) ? paths : [paths];
    return h(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": 1.8,
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      },
      parts.map((d) => h("path", { d }))
    );
  },
});

const iconMap: Record<ActionIcon, any> = {
  document: makeIcon(["M12 2 19 9v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h5Z", "M12 2v7h7"]),
  sparkles: makeIcon(["M12 3 10.5 8.5 5 10l5.5 1.5L12 17l1.5-5.5L19 10l-5.5-1.5L12 3Z", "M5 16l-1 2-2 1 2 1 1 2 1-2 2-1-2-1-1-2Z", "M19 16l-1 2-2 1 2 1 1 2 1-2 2-1-2-1-1-2Z"]),
  swap: makeIcon(["M7 3 3 7h4v6", "m17 21 4-4h-4v-6", "M7 7h4", "M13 13h4"]),
  calendar: makeIcon(["M7 3v2", "M17 3v2", "M4 7h16", "M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"]),
  card: makeIcon(["M3 5h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z", "M3 9h18", "M7 15h4"]),
};
</script>
