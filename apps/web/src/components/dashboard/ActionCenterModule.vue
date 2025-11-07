<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useDemoStore } from '@/stores/demoStore'
// Using local styles instead of UI kit components to avoid build deps
import { supabase } from '@/lib/supabase'

type ActionItem = {
  id: string
  type: 'proposal' | 'payment'
  title: string
  amount: number
  urgency_score: number
  status: string
  due_at: string | null
  viewed_at: string | null
}

const emit = defineEmits<{
  (e: 'card-click', item: ActionItem): void
  (e: 'refresh'): void
}>()

const actionItems = ref<ActionItem[]>([])
const completion = computed(() => {
  const items = actionItems.value
  const total = items.length
  if (!total) return 0
  const done = items.filter(i => ['paid', 'accepted'].includes(String(i.status).toLowerCase())).length
  return Math.round((done / total) * 100)
})
const loading = ref(false)
const error = ref<string | null>(null)
const demo = useDemoStore()


const loadUrgencyFeed = async () => {
  loading.value = true
  error.value = null
  try {
    if (demo.active) {
      // Seed demo items client-side
      const now = Date.now()
      actionItems.value = [
        { id: 'demo-pay-1', type: 'payment', title: 'Payment Due — Deck Remodel', amount: 3200, urgency_score: 0.86, status: 'pending', due_at: new Date(now - 2 * 3600_000).toISOString(), viewed_at: null },
        { id: 'demo-prop-1', type: 'proposal', title: 'Charleston Deck Remodel', amount: 4500, urgency_score: 0.72, status: 'sent', due_at: new Date(now - 20 * 3600_000).toISOString(), viewed_at: new Date(now - 3 * 3600_000).toISOString() },
        { id: 'demo-prop-2', type: 'proposal', title: 'Deck Lighting Upgrade', amount: 1750, urgency_score: 0.61, status: 'accepted', due_at: new Date(now - 3 * 24 * 3600_000).toISOString(), viewed_at: null },
        { id: 'demo-pay-2', type: 'payment', title: 'Final Payment — Lighting Upgrade', amount: 2100, urgency_score: 0.58, status: 'processing', due_at: new Date(now - 6 * 3600_000).toISOString(), viewed_at: null },
      ]
    } else {
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData?.user?.id
      if (!uid) {
        loading.value = false
        return
      }
      const { data, error: rpcError } = await supabase.rpc('get_urgency_feed', { uid })
      if (rpcError) throw rpcError
      actionItems.value = (data as ActionItem[]) || []
    }
    // completion is derived; no manual recompute needed
  } catch (e: any) {
    console.error('Urgency feed error:', e)
    error.value = e?.message ?? 'Failed to load action items'
  } finally {
    loading.value = false
  }
}

onMounted(loadUrgencyFeed)

// --- Demo behavior setup ---
const isDemo = demo.active || (import.meta as any).env?.VITE_DEMO_MODE === 'true'

// simple toast fallback
const toast = {
  success: (msg: string) => (typeof window !== 'undefined' ? window.alert(msg) : void 0),
  error: (msg: string) => (typeof window !== 'undefined' ? window.alert(`Error: ${msg}`) : void 0),
}

const handleDemoAction = async (item: ActionItem) => {
  if (!isDemo) {
    // In real mode, bubble to parent to navigate or act
    emit('card-click', item)
    return
  }
  ;(item as any).loading = true
  await new Promise(r => setTimeout(r, 1200))
  ;(item as any).loading = false
  // remove the card
  actionItems.value = actionItems.value.filter(i => i.id !== item.id)
  // completion is derived from items; no manual increment
  toast.success(`${item.title} — ${item.type === 'payment' ? 'Reminder sent' : 'Follow-up sent'}`)
}

const resetDemo = () => loadUrgencyFeed()
</script>

<template>
  <section class="sticky top-0 z-20 rounded-b-3xl border-b border-slate-200 bg-gradient-to-b from-slate-100/90 to-white/80 p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] backdrop-blur-lg">
    <div class="mx-auto w-full max-w-3xl">
    <div class="mb-3 flex items-end justify-between gap-3">
      <div>
        <h2 class="mb-1 text-2xl font-semibold text-slate-800">🔥 Action Center</h2>
        <p class="text-sm text-slate-500">You’re on track — {{ completion }}% of today’s key actions done.</p>
      </div>
      <button
        type="button"
        class="rounded-md bg-slate-800 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700 active:scale-95"
        @click="loadUrgencyFeed(); $emit('refresh')"
      >
        Refresh
      </button>
    </div>

    <div v-if="error" class="mb-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">
      {{ error }}
    </div>

    <div v-if="loading" class="mb-3 h-10 animate-pulse rounded-xl bg-slate-200/70" />

    <transition-group name="fade" tag="div">
    <div v-for="item in actionItems" :key="item.id" class="mb-3">
      <div
        class="flex items-center justify-between rounded-2xl border-l-4 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-md"
        :class="{
          'border-blue-500': item.type === 'proposal' && item.status === 'sent',
          'border-amber-500': item.type === 'proposal' && item.status === 'accepted',
          'border-red-500': item.type === 'payment' && (item.status === 'pending' || item.status === 'processing'),
          'border-green-500': item.status === 'paid'
        }"
      >
        <div class="min-w-0">
          <p class="truncate text-base font-semibold text-slate-800">{{ item.title }}</p>
          <div class="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
            <span class="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
              {{ item.type === 'payment' ? 'Payment' : 'Proposal' }}
            </span>
            <span class="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
              {{ item.status }}
            </span>
            
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="hidden text-xs text-slate-400 sm:inline">Score: {{ Math.round(item.urgency_score * 100) }}</span>
        <button
          class="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white shadow transition-transform hover:bg-blue-700 active:scale-95"
          @click="handleDemoAction(item)"
        >
          <span v-if="!(item as any).loading">{{ item.type === 'payment' ? 'Send Reminder' : 'Follow Up' }}</span>
          <span v-else class="inline-flex items-center gap-1">Sending<span class="animate-pulse">…</span></span>
        </button>
        </div>
      </div>
    </div>
    </transition-group>

    <div class="mt-4">
      <div class="h-3 w-full rounded-full bg-slate-200 overflow-hidden">
        <div
          class="h-3 rounded-full transition-all"
          :class="{ 'progress-fill': completion < 100, 'progress-complete': completion === 100 }"
          :style="{ width: `${completion}%` }"
        />
      </div>
    </div>

    <div v-if="!actionItems.length" class="mt-4">
      <div class="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-6 text-center shadow-sm">
        <h3 class="text-lg font-semibold text-emerald-700">🎉 All caught up</h3>
        <p class="mt-1 text-sm text-emerald-600">Nothing urgent right now — check ongoing jobs below.</p>
      </div>
      <!-- Optional subtle confetti -->
      <div class="relative mx-auto mt-2 h-6 w-full max-w-xs overflow-hidden">
        <div class="absolute inset-0 -skew-x-12 bg-gradient-to-r from-emerald-300 via-emerald-200 to-emerald-300 bg-[length:200%_100%] animate-[shimmer_1.2s_linear_infinite] opacity-30 rounded-full" />
      </div>
    </div>
    
    <button
      v-if="isDemo"
      class="absolute right-6 top-6 rounded-md bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-300 active:scale-95"
      @click="resetDemo"
    >
      Reset Demo
    </button>
    </div>
  </section>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.progress-fill {
  background: linear-gradient(90deg, #3b82f6, #60a5fa, #93c5fd);
  background-size: 200% 100%;
  animation: progressPulse 3s linear infinite;
}
.progress-complete {
  background: linear-gradient(90deg, #10b981, #34d399, #6ee7b7);
  background-size: 100% 100%;
  animation: none;
}
@keyframes progressPulse {
  0% { background-position: 0% 0%; }
  100% { background-position: 200% 0%; }
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>
