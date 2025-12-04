<template>
  <article
    class="flex min-w-[200px] flex-col gap-1.5 rounded-xl p-4 shadow-sm"
    :class="toneClasses[alert.tone]"
  >
    <div class="flex items-center gap-3">
      <div class="flex h-10 w-10 items-center justify-center rounded-full bg-white/60 text-current shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
        <component :is="iconMap[alert.icon] || iconMap.info" class="h-5 w-5" />
      </div>
      <div class="flex-1">
        <p class="text-sm font-semibold text-slate-900">{{ alert.title }}</p>
        <p class="text-xs text-slate-600">{{ alert.subtitle }}</p>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { h } from "vue";
type AlertTone = "info" | "success" | "warning" | "danger";
type AlertIcon = "info" | "check" | "alert" | "flag";

defineProps<{
  alert: {
    title: string;
    subtitle: string;
    tone: AlertTone;
    icon: AlertIcon;
  };
}>();

const toneClasses: Record<AlertTone, string> = {
  info: "bg-[#E8F0FF] text-sky-900",
  success: "bg-[#E9F8EF] text-emerald-900",
  warning: "bg-[#FFF7E5] text-amber-900",
  danger: "bg-[#FDEEEE] text-rose-900",
};

const makeIcon = (path: string) => ({
  render() {
    return h(
      "svg",
      { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor" },
      h("path", { d: path })
    );
  },
});

const iconMap: Record<AlertIcon, any> = {
  info: makeIcon("M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 7V7h2v2h-2Zm0 8v-6h2v6h-2Z"),
  check: makeIcon("M9.55 18 4 12.45l1.41-1.4 4.14 4.12L18.59 6l1.41 1.41Z"),
  alert: makeIcon("M12 2 1 21h22L12 2Zm1 15h-2v-2h2v2Zm0-4h-2V9h2v4Z"),
  flag: makeIcon("M6 3h13l-1.8 5H19l-3.6 7H6v6H4V3Zm2 2v8h6.4l2.4-5H13l1.2-3H8Z"),
};
</script>
