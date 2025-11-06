<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SQBadge from '@stackquotes/ui/components/SQBadge.vue'
import SQProgress from '@stackquotes/ui/components/SQProgress.vue'
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

const loadUrgencyFeed = async () => {
  loading.value = true
  error.value = null
  try {
    const { data: userData } = await supabase.auth.getUser()
    const uid = userData?.user?.id
    if (!uid) {
      loading.value = false
      return
    }
    const { data, error: rpcError } = await supabase.rpc('get_urgency_feed', { uid })
    if (rpcError) throw rpcError
    const items = (data as ActionItem[]) || []
    actionItems.value = items
    const total = items.length
    const done = items.filter(i => ['paid', 'accepted'].includes(i.status)).length
    completion.value = total ? Math.round((done / total) * 100) : 0
  } catch (e: any) {
    console.error('Urgency feed error:', e)
    error.value = e?.message ?? 'Failed to load action items'
  } finally {
    loading.value = false
  }
}

onMounted(loadUrgencyFeed)
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
            <SQBadge tone="default">{{ item.type === 'payment' ? 'Payment' : 'Proposal' }}</SQBadge>
            <SQBadge tone="default">{{ item.status }}</SQBadge>
            <span class="opacity-80">Score: {{ Math.round(item.urgency_score * 100) }}</span>
          </div>
        </div>
        <button
          class="rounded-full bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white shadow hover:bg-blue-700"
          @click="$emit('card-click', item)"
        >
          {{ item.type === 'payment' ? 'Send Reminder' : 'Follow Up' }}
        </button>
      </div>
    </div>

    <div class="mt-4">
      <SQProgress :value="completion" class="h-3 rounded-full bg-slate-200" />
    </div>
  </section>
</template>

