<template>
  <div
    v-if="showBanner"
    class="flex flex-col gap-3 rounded-2xl border border-amber-300 bg-amber-50/80 px-5 py-4 text-amber-900 shadow-sm sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="space-y-1">
      <p class="text-sm font-semibold">Pro trial expires in {{ daysLabel }}.</p>
      <p class="text-xs text-amber-800/90">
        Unlock ScopeForge milestones, analytics, and 1% PayLink fees permanently before the countdown hits zero.
      </p>
    </div>
    <div class="flex items-center gap-3">
      <RouterLink
        to="/settings?tab=billing"
        class="inline-flex items-center rounded-lg bg-[#2563eb] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8]"
      >
        Upgrade to Pro
      </RouterLink>
      <button
        type="button"
        class="text-xs font-medium text-amber-700 underline underline-offset-2 hover:text-amber-800"
        @click="dismiss"
      >
        Dismiss
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";
import { useTier } from "@/composables/useTier";

const dismissed = ref(false);
const { inTrial, trialDaysRemaining } = useTier();

const showBanner = computed(() => {
  if (dismissed.value) return false;
  if (!inTrial.value) return false;
  const days = trialDaysRemaining.value ?? 0;
  // Show in last 4 days of a 14-day trial (days 1-4 remaining)
  return days > 0 && days <= 4;
});

const daysLabel = computed(() => {
  const days = trialDaysRemaining.value ?? 0;
  if (days <= 0) return "less than 24 hours";
  if (days === 1) return "1 day";
  return `${days} days`;
});

const emit = defineEmits<{ (event: "dismiss"): void }>();

const dismiss = () => {
  dismissed.value = true;
  emit("dismiss");
};
</script>
