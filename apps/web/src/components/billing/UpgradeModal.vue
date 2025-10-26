<template>
  <teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 px-4 backdrop-blur-sm"
    >
      <div class="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          class="absolute right-4 top-4 text-slate-400 transition hover:text-slate-600"
          @click="$emit('close')"
        >
          <span class="sr-only">Close modal</span>
          ×
        </button>

        <div class="space-y-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">Upgrade required</p>
            <h2 class="mt-2 text-2xl font-semibold text-slate-900">Unlock this Pro feature</h2>
            <p class="mt-1 text-sm text-slate-600">
              {{ featureMessage }}
            </p>
          </div>

          <ul class="space-y-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <li class="flex items-center gap-2">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              1% PayLink platform fees on every payment
            </li>
            <li class="flex items-center gap-2">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              ScopeForge milestone scheduling + change orders
            </li>
            <li class="flex items-center gap-2">
              <span class="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              ProfitPulse analytics &amp; performance dashboards
            </li>
          </ul>

          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-700"
              @click="$emit('close')"
            >
              Not now
            </button>
            <RouterLink
              to="/settings?tab=billing"
              class="inline-flex items-center justify-center rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8]"
              @click="$emit('close')"
            >
              View Pro plans
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterLink } from "vue-router";

const props = defineProps<{
  open: boolean;
  feature?: string;
}>();

const featureMessage = computed(() =>
  props.feature
    ? `${props.feature} is available for StackQuotes Pro teams.`
    : "Upgrade to StackQuotes Pro to access advanced workflows."
);

defineEmits<{
  (event: "close"): void;
}>();
</script>
