<script setup lang="ts">
const props = defineProps<{
  seenNotAccepted: number
}>()
const emit = defineEmits<{ (e: 'cta'): void }>()
</script>

<template>
  <div class="rounded-2xl border border-slate-800/40 bg-slate-900/80 p-4 text-slate-100 ring-1 ring-black/5">
    <div class="flex items-start justify-between gap-3">
      <div>
        <p class="text-sm font-medium">AI Insights</p>
        <p class="mt-1 text-sm text-slate-300">
          {{ seenNotAccepted }} quotes seen but not accepted — Send reminders?
        </p>
      </div>
      <button type="button" class="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-500" @click="$emit('cta')">
        Send Reminders
      </button>
    </div>
  </div>
</template>

<style scoped>
</style>
