<template>
  <article
    class="flex min-w-[210px] flex-col gap-1.5 rounded-xl p-4 shadow-sm transition hover:translate-y-[1px] hover:cursor-pointer hover:shadow-sm animate-alert-bounce"
    :class="toneClasses[alert.tone]"
  >
    <div class="flex items-center gap-3">
      <div
        class="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-current shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
      >
        <component :is="iconMap[alert.icon] || iconMap.info" class="h-5 w-5" />
      </div>
      <div class="flex-1">
        <p class="text-base font-semibold text-slate-900">{{ alert.title }}</p>
        <p class="text-xs text-slate-600 opacity-60">{{ alert.subtitle }}</p>
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

const iconMap: Record<AlertIcon, any> = {
  info: makeIcon(["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z", "M12 8h.01", "M11.5 12h1v4h1"]),
  check: makeIcon(["M20 6 9 17l-5-5"]),
  alert: makeIcon(["m12 9-2 4h4l-2 4", "M12 5v.01"]),
  flag: makeIcon(["M4 5h12l-1 5 1 5H4V5Z", "M4 3v2", "M4 15v3"]),
};
</script>

<style scoped>
@keyframes alert-bounce {
  0% {
    transform: translateY(4px);
    opacity: 0;
  }
  60% {
    transform: translateY(-2px);
    opacity: 1;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
.animate-alert-bounce {
  animation: alert-bounce 0.45s ease-out both;
}
</style>
