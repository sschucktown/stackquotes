<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue'

const props = defineProps<{
  openProposals: number
  pendingDeposits: number
  closeRate: number // 0..1
  overdueMilestones?: number
  grossPaymentsMonth?: number
}>()

const emit = defineEmits<{
  (e: 'filter', key: 'proposals' | 'deposits' | 'close'): void
}>()

const pct = computed(() => Math.round((props.closeRate || 0) * 100))

function animateNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

const currency = (value?: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0)
</script>

<template>
  <div class="rounded-xl bg-slate-900 text-slate-100 shadow-sm">
    <div class="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
      <button type="button" class="flex-1 rounded-lg bg-slate-800 px-4 py-3 text-left transition hover:bg-slate-700" @click="$emit('filter','proposals')">
        <p class="text-xs uppercase tracking-wide text-slate-400">Open Proposals</p>
        <p class="mt-0.5 text-2xl font-semibold">{{ animateNumber(openProposals) }}</p>
      </button>
      <button type="button" class="flex-1 rounded-lg bg-slate-800 px-4 py-3 text-left transition hover:bg-slate-700" @click="$emit('filter','deposits')">
        <p class="text-xs uppercase tracking-wide text-slate-400">Pending Deposits</p>
        <p class="mt-0.5 text-2xl font-semibold">{{ animateNumber(pendingDeposits) }}</p>
      </button>
      <button type="button" class="flex-1 rounded-lg bg-slate-800 px-4 py-3 text-left transition hover:bg-slate-700" @click="$emit('filter','close')">
        <p class="text-xs uppercase tracking-wide text-slate-400">Close Rate</p>
        <p class="mt-0.5 text-2xl font-semibold">{{ pct }}%</p>
      </button>
      <button
        v-if="overdueMilestones !== undefined"
        type="button"
        class="flex-1 rounded-lg bg-slate-800 px-4 py-3 text-left transition hover:bg-slate-700"
        @click="$emit('filter','proposals')"
      >
        <p class="text-xs uppercase tracking-wide text-slate-400">Overdue Milestones</p>
        <p class="mt-0.5 text-2xl font-semibold">{{ animateNumber(overdueMilestones || 0) }}</p>
      </button>
      <button
        v-if="grossPaymentsMonth !== undefined"
        type="button"
        class="flex-1 rounded-lg bg-slate-800 px-4 py-3 text-left transition hover:bg-slate-700"
        @click="$emit('filter','deposits')"
      >
        <p class="text-xs uppercase tracking-wide text-slate-400">Gross Payments This Month</p>
        <p class="mt-0.5 text-2xl font-semibold">{{ currency(grossPaymentsMonth || 0) }}</p>
      </button>
    </div>
  </div>
</template>

<style scoped>
</style>
