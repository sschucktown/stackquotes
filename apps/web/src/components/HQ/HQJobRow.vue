<template>
  <article
    class="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:shadow-sm"
  >
    <div class="flex items-start gap-3">
      <div
        class="h-10 w-10 rounded-full border border-slate-200 bg-slate-100 bg-cover bg-center text-slate-700 shadow-sm"
        :style="job.photo ? { backgroundImage: `url(${job.photo})` } : {}"
      >
        <div v-if="!job.photo" class="flex h-full w-full items-center justify-center">
          <component :is="tradeIcons[job.trade] || tradeIcons.deck" class="h-5 w-5" />
        </div>
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h3 class="text-sm font-semibold leading-tight text-slate-900">{{ job.name }}</h3>
          <span class="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 border border-slate-200">
            {{ job.type }}
          </span>
        </div>
        <div class="mt-1 inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-medium" :class="statusClasses[job.status]">
          <span class="h-2 w-2 rounded-full" :class="dotClasses[job.status]"></span>
          {{ job.status }}
        </div>
        <p class="text-sm text-slate-500 mt-1">{{ job.detail }}</p>
      </div>
    </div>
    <div class="text-slate-400 opacity-0 transition group-hover:opacity-100 group-hover:translate-x-0.5">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5">
        <path fill="currentColor" d="m9 18 6-6-6-6v12Z" />
      </svg>
    </div>
  </article>
</template>

<script setup lang="ts">
import { h } from "vue";
type JobStatus = "In Progress" | "Scheduled" | "Pending" | "Needs Visit";
type TradeType = "deck" | "fence" | "patio";

defineProps<{
  job: {
    name: string;
    type: string;
    status: JobStatus;
    detail: string;
    photo?: string;
    trade: TradeType;
  };
}>();

const statusClasses: Record<JobStatus, string> = {
  "In Progress": "bg-emerald-50 text-emerald-700 border-emerald-100",
  Scheduled: "bg-blue-50 text-blue-700 border-blue-100",
  Pending: "bg-amber-50 text-amber-700 border-amber-100",
  "Needs Visit": "bg-slate-100 text-slate-700 border-slate-200",
};

const dotClasses: Record<JobStatus, string> = {
  "In Progress": "bg-emerald-500",
  Scheduled: "bg-blue-500",
  Pending: "bg-amber-500",
  "Needs Visit": "bg-slate-500",
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

const tradeIcons: Record<TradeType, any> = {
  deck: makeIcon("M4 5h16v2H4V5Zm0 4h16v2H4V9Zm0 4h16v2H4v-2Zm0 4h16v2H4v-2Z"),
  fence: makeIcon("M6 3 4 5v16h2v-6h2v6h2V5l-2-2-2 2-2-2Zm10 0-2 2v14h2v-4h2v4h2V5l-2-2-2 2-2-2Z"),
  patio: makeIcon("M4 4h16v4H4V4Zm0 6h16v4H4v-4Zm0 6h16v4H4v-4Z"),
};
</script>
