<script setup lang="ts">
const props = defineProps<{
  lowEstimate: number;
  highEstimate: number;
  confidence: "High" | "Medium" | "Low";
  summary: string;
  manual: boolean;
}>();

const emit = defineEmits<{
  (e: "update:summary", value: string): void;
  (e: "regenerate"): void;
}>();

const confidenceTone = (value: string) => {
  if (value === "High") return { text: "text-emerald-700", bars: ["bg-emerald-200", "bg-emerald-300", "bg-emerald-400"] };
  if (value === "Medium") return { text: "text-blue-700", bars: ["bg-blue-200", "bg-blue-300", "bg-blue-400"] };
  return { text: "text-amber-700", bars: ["bg-amber-200", "bg-amber-300", "bg-amber-400"] };
};
</script>

<template>
  <section class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h3 class="text-lg font-semibold text-slate-900">Estimate Summary</h3>
        <p class="text-sm text-slate-500">Ballpark range and client-facing copy.</p>
      </div>
    </div>

    <div class="mt-3 grid gap-4 lg:grid-cols-2">
      <div class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 shadow-inner">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Estimated Range</p>
        <p class="text-2xl font-bold tracking-tight text-slate-900">
          {{ lowEstimate.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) }}
          -
          {{ highEstimate.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) }}
        </p>
        <p class="text-sm text-slate-600">Ballpark only. Final price is verified during the visit.</p>
      </div>

      <div class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 shadow-inner">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Confidence</p>
        <div class="flex items-center justify-between text-sm">
          <span class="font-semibold text-slate-900">Confidence</span>
          <span :class="confidenceTone(confidence).text" class="text-sm font-semibold">{{ confidence }}</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="flex flex-1 items-center gap-1">
            <div class="h-2 flex-1 rounded-full" :class="confidenceTone(confidence).bars[0]"></div>
            <div class="h-2 flex-1 rounded-full" :class="confidenceTone(confidence).bars[1]"></div>
            <div class="h-2 flex-1 rounded-full" :class="confidenceTone(confidence).bars[2]"></div>
          </div>
          <span class="text-xs text-slate-500">{{ confidence }}</span>
        </div>
      </div>
    </div>

    <div class="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
      <div class="mb-2 flex items-center justify-between">
        <h4 class="text-lg font-semibold text-slate-900">Client Summary</h4>
        <button
          v-if="manual"
          type="button"
          class="text-xs font-semibold text-blue-600 underline-offset-4 hover:underline"
          @click="emit('regenerate')"
        >
          Regenerate
        </button>
      </div>
      <textarea
        :value="summary"
        rows="4"
        class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-blue-300 focus:outline-none"
        @input="emit('update:summary', ($event.target as HTMLTextAreaElement).value)"
      />
      <p class="mt-1 text-xs text-slate-500">Auto-updates unless edited.</p>
    </div>
  </section>
</template>
