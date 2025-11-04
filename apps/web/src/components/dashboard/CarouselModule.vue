<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue'
import SQBadge from '@stackquotes/ui/components/SQBadge.vue'

export interface CarouselItem {
  id: string
  title: string
  client?: string
  amount?: number
  stage: string
  updatedAt?: string
  route?: string
}

const props = defineProps<{
  title: string
  items: CarouselItem[]
  stages: string[]
  colorMap: Record<string, string> // values like 'emerald-500'
  focusOnly?: boolean // optional focus mode filter
  focusStages?: string[] // considered “awaiting action”
}>()

const emit = defineEmits<{
  (e: 'card-click', item: CarouselItem): void
  (e: 'nudge', item: CarouselItem): void
}>()

const currency = (value?: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0)

// Ensure Tailwind generates these dynamic border classes
// no-unused-locals – referenced to keep classes in build
const __SAFE_BORDER_CLASSES = [
  'border-emerald-500','border-rose-500','border-amber-500','border-indigo-500','border-indigo-400','border-slate-500','border-slate-400','border-sky-500','border-sky-400'
]

const colorFor = (stage: string) => `border-${props.colorMap[stage] ?? 'slate-400'}`

const filteredItems = computed(() => {
  if (!props.focusOnly || !props.focusStages?.length) return props.items
  return props.items.filter(i => props.focusStages!.includes(i.stage))
})

const stageLabel = (s: string) => s.replaceAll('_', ' ').toUpperCase()

const onClick = (item: CarouselItem) => emit('card-click', item)
</script>

<template>
  <section class="rounded-3xl bg-white/95 p-4 shadow-sm ring-1 ring-black/5">
    <header class="mb-3 flex items-center justify-between">
      <h3 class="text-sm font-semibold text-slate-900">{{ title }}</h3>
    </header>

    <div class="flex gap-3 overflow-x-auto pb-2 snap-x">
      <article
        v-for="item in filteredItems"
        :key="item.id"
        class="group min-w-[260px] snap-start rounded-2xl border border-slate-200 bg-white p-3 transition-all hover:-translate-y-0.5 hover:shadow-md"
        :class="[ 'border-t-4', colorFor(item.stage) ]"
        @click="onClick(item)"
      >
        <div class="flex items-start justify-between">
          <p class="line-clamp-1 pr-2 text-sm font-semibold text-slate-900">{{ item.title || 'Untitled' }}</p>
          <SQBadge size="xs">{{ stageLabel(item.stage) }}</SQBadge>
        </div>

        <p v-if="item.client" class="mt-1 line-clamp-1 text-xs text-slate-500">{{ item.client }}</p>

        <div class="mt-2 flex items-center justify-between">
          <p v-if="item.amount !== undefined" class="text-sm font-medium text-slate-900">{{ currency(item.amount) }}</p>
          <p v-if="item.updatedAt" class="text-[11px] text-slate-500">{{ item.updatedAt }}</p>
        </div>

        <div class="mt-2 flex items-center justify-between">
          <div class="h-8 flex-1 rounded-md bg-slate-50 text-center text-xs text-slate-500 transition group-active:scale-[0.99] group-hover:bg-slate-100 flex items-center justify-center">
            View Details
          </div>
          <button
            v-if="item.stage === 'viewed'"
            type="button"
            class="ml-2 shrink-0 rounded-md bg-indigo-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-indigo-500"
            @click.stop="$emit('nudge', item)"
          >
            Nudge Client
          </button>
        </div>
      </article>

      <div v-if="!filteredItems.length" class="min-w-full rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
        Nothing here right now.
      </div>
    </div>
  </section>
</template>

<style scoped>
</style>
