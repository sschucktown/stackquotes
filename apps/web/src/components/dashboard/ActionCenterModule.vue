<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
const completion = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)
const demo = useDemoStore()

const recomputeCompletion = () => {
  const items = actionItems.value
  const total = items.length
  const done = items.filter(i => ['paid', 'accepted'].includes(i.status)).length
  completion.value = total ? Math.round((done / total) * 100) : 0
}

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
    recomputeCompletion()
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
  // increment progress (assume ~5 items typical)
  completion.value = Math.min(100, completion.value + Math.round(100 / 5))
  toast.success(`${item.title} — ${item.type === 'payment' ? 'Reminder sent' : 'Follow-up sent'}`)
}

const resetDemo = () => loadUrgencyFeed()
</script>

<template>
  <section class="sticky top-0 z-20 rounded-b-3xl border-b border-slate-200 bg-gradient-to-b from-slate-100/90 to-white/80 p-6 shadow-sm backdrop-blur-lg">
    <div class="mb-3 flex items-end justify-between gap-3">
      <div>
        <h2 class="mb-1 text-2xl font-semibold text-slate-800">🔥 Action Center</h2>
        <p class="text-sm text-slate-500">You’re on track — {{ completion }}% of today’s key actions done.</p>
      </div>
      <button
        type="button"
        class="rounded-md bg-slate-800 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-700"
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
        class="flex items-center justify-between rounded-2xl border-l-4 bg-white/80 px-4 py-3 shadow-sm transition hover:shadow-md"
        :class="{
          'border-blue-500': item.type === 'proposal' && item.status === 'sent',
          'border-yellow-500': item.type === 'proposal' && item.status === 'accepted',
          'border-red-500': item.type === 'payment' && (item.status === 'pending' || item.status === 'processing'),
          'border-green-500': item.status === 'paid'
        }"
      >
        <div class="min-w-0">
          <p class="truncate font-medium text-slate-800">{{ item.title }}</p>
          <div class="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <span class="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
              {{ item.type === 'payment' ? 'Payment' : 'Proposal' }}
            </span>
            <span class="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
              {{ item.status }}
            </span>
            <span class="opacity-80">Score: {{ Math.round(item.urgency_score * 100) }}</span>
          </div>
        </div>
        <button
          class="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white shadow hover:bg-blue-700"
          @click="handleDemoAction(item)"
        >
          {{ item.type === 'payment' ? 'Send Reminder' : 'Follow Up' }}
        </button>
      </div>
    </div>
    </transition-group>

    <div class="mt-4">
      <div class="h-3 w-full rounded-full bg-slate-200">
        <div class="h-3 rounded-full bg-blue-600 transition-all" :style="{ width: `${completion}%` }" />
      </div>
    </div>
    
    <button
      class="absolute right-6 top-6 rounded-md bg-slate-200 text-slate-700 px-3 py-1 text-xs font-semibold hover:bg-slate-300"
      @click="resetDemo"
    >
      Reset Demo
    </button>
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
</style>
