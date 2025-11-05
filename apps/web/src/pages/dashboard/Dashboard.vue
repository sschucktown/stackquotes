<template>
  <CommandCenter
    :open-proposals="kpiOpenProposals"
    :pending-deposits="kpiPendingDeposits"
    :close-rate="kpiCloseRate"
    :overdue-milestones="kpiOverdueMilestones"
    :gross-payments-month="kpiGrossPaymentsMonth"
    :payment-items="paymentItems"
    :proposal-items="proposalItems"
    :quick-quote-items="quickQuoteItems"
    :snapshot="snapshot"
    :generated-at="generatedAt"
    :loading="loading"
    :error="error"
    :focus-only="focusMode"
    :insights-seen-not-accepted="insightsSeenNotAccepted"
    @filter="onKpiFilter"
    @card-click="openItem"
  @nudge="nudgeItem"
  @delete="onDeleteQuickQuote"
  @insights-cta="router.push({ name: 'smart-proposals' })"
  @retry="retryDashboard"
  />

<!-- Toasts -->
<div v-if="toasts.length" class="pointer-events-none fixed right-4 top-4 z-[1000] flex max-w-sm flex-col gap-2">
  <transition-group name="toast" tag="div">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="pointer-events-auto rounded-md px-3 py-2 shadow-sm ring-1"
      :class="toast.tone === 'success' ? 'bg-emerald-50 text-emerald-900 ring-emerald-200' : 'bg-rose-50 text-rose-900 ring-rose-200'"
    >
      <span class="text-sm">{{ toast.message }}</span>
    </div>
  </transition-group>
</div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { apiFetch } from '@/lib/http'
import { useTier } from '@/composables/useTier'
import CommandCenter from '@/components/dashboard/CommandCenter.vue'
import { type CarouselItem } from '@/components/dashboard/CarouselModule.vue'

const router = useRouter()
const go = (name: string) => router.push({ name })

interface DashboardResponse {
  data: {
    actions: Array<{
      key: string
      label: string
      count?: number
      amount?: number
      cta: string
      route: string
      weight: number
      tone: 'red' | 'yellow' | 'blue' | 'green'
    }>
    carousels: {
      payments: Record<string, Array<{ id: string; title?: string; amount?: number; route: string }>>
      smartProposals: Record<string, Array<{ id: string; title?: string; route: string; viewed_at?: string }>>
      quickQuotes: Record<string, Array<{ id: string; title?: string; route: string }>>
    }
    snapshot: {
      latest_payments: Array<{ id: string; amount: number; type: string; status: string; created_at: string; proposal_title?: string | null }>
      gross_margin: number
      total_revenue: number
      total_cost: number
    }
    generated_at: string
  }
}

const loading = ref(true)
const error = ref<string | null>(null)

const actions = ref<DashboardResponse['data']['actions']>([])
const payments = ref<DashboardResponse['data']['carousels']['payments']>({})
const smartProposals = ref<DashboardResponse['data']['carousels']['smartProposals']>({})
const quickQuotes = ref<DashboardResponse['data']['carousels']['quickQuotes']>({})
const snapshot = ref<DashboardResponse['data']['snapshot']>({ latest_payments: [], gross_margin: 0, total_revenue: 0, total_cost: 0 })
const generatedAt = ref<string | null>(null)
const summaryCloseRate = ref<number | null>(null)
const summaryOverdue = ref<number | null>(null)
const summaryGrossMonth = ref<number | null>(null)

// Lightweight toasts
interface ToastMessage { id: number; message: string; tone: 'success' | 'error' }
const toasts = ref<ToastMessage[]>([])
const showToast = (message: string, tone: ToastMessage['tone'] = 'success') => {
  const id = Date.now() + Math.random()
  toasts.value.push({ id, message, tone })
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, 3000)
}

const { isPaid, inTrial } = useTier()
const canAccessPro = computed(() => isPaid.value || inTrial.value)

// Helpers
const timeAgo = (iso: string) => {
  const ms = Date.now() - new Date(iso).getTime()
  const mins = Math.max(0, Math.round(ms / 60000))
  if (mins < 60) return `${mins} min ago`
  const hours = Math.round(mins / 60)
  return `${hours} hr ago`
}

// Focus mode default ON (toggle lives in Settings)
const focusMode = ref(true)

// KPI computations
const kpiOpenProposals = computed(() => {
  const unsent = smartProposals.value?.unsent?.length || 0
  const sent = smartProposals.value?.sent?.length || 0
  const viewed = smartProposals.value?.viewed?.length || 0
  return unsent + sent + viewed
})
const kpiPendingDeposits = computed(() => (payments.value?.deposit_pending?.length || 0))
const kpiCloseRate = computed(() => {
  if (summaryCloseRate.value !== null) return summaryCloseRate.value
  const acc = smartProposals.value?.accepted?.length || 0
  const lost = smartProposals.value?.declined_expired?.length || 0
  const denom = acc + lost
  const pct = denom === 0 ? 0 : acc / denom
  return Math.max(0, Math.min(1, pct))
})
const kpiOverdueMilestones = computed(() => summaryOverdue.value ?? undefined)
const kpiGrossPaymentsMonth = computed(() => summaryGrossMonth.value ?? undefined)

// Items mapping for carousels
const mapItems = (
  records: Record<string, Array<{ id: string; title?: string; amount?: number; route: string; viewed_at?: string }>>,
  stageKey: string
): CarouselItem[] => {
  const arr = records?.[stageKey] || []
  return arr.map((i) => ({
    id: i.id,
    title: i.title || 'Untitled',
    amount: (i as any).amount,
    stage: stageKey,
    route: i.route,
    updatedAt: stageKey === 'viewed' && (i as any).viewed_at ? timeAgo(String((i as any).viewed_at)) : undefined,
  }))
}

const quickQuoteItems = computed<CarouselItem[]>(() => {
  const stages = ['draft','ready_to_convert','converted']
  return stages.flatMap(s => mapItems(quickQuotes.value || {}, s))
})

const proposalItems = computed<CarouselItem[]>(() => {
  const stages = canAccessPro.value ? ['unsent','sent','viewed','accepted'] : ['unsent','sent']
  const records = smartProposals.value || {}
  const items: CarouselItem[] = []
  for (const s of stages) {
    const arr = (records?.[s] || []) as any[]
    for (const i of arr) {
      items.push({
        id: i.id,
        title: i.title || 'Untitled',
        stage: s,
        route: i.route,
        updatedAt: s === 'viewed' && i.viewed_at ? timeAgo(String(i.viewed_at)) : undefined,
      })
    }
  }
  return items
})

const paymentItems = computed<CarouselItem[]>(() => {
  const stages = ['deposit_pending','deposit_received','final_due','paid']
  return stages.flatMap(s => mapItems(payments.value || {}, s))
})

const openItem = (item: CarouselItem) => {
  if (item.route) go(item.route)
}

// KPI filters: navigate to contextual routes
const onKpiFilter = (key: 'proposals'|'deposits'|'close') => {
  if (key === 'proposals') {
    router.push({ name: 'smart-proposals', query: { status: 'open' } })
    return
  }
  if (key === 'deposits') {
    router.push({ name: 'payments', query: { stage: 'deposit_pending' } })
    return
  }
  if (key === 'close') {
    router.push({ name: 'analytics' })
    return
  }
}

// AI insights: viewed but not accepted (approx)
const insightsSeenNotAccepted = computed(() => {
  const viewed = smartProposals.value?.viewed?.length || 0
  return Math.max(0, viewed)
})

// Nudge client via API
const nudgeItem = async (item: CarouselItem) => {
  try {
    const res = await apiFetch<{ ok: boolean }>(`/proposals/nudge`, {
      method: 'POST',
      body: JSON.stringify({ id: item.id }),
    })
    if ((res as any).error) throw new Error((res as any).error)
    showToast('Nudge sent to client.')
  } catch (e: any) {
    console.error('Nudge failed', e?.message || e)
    showToast('Unable to send nudge.', 'error')
  }
}

const reloadDashboard = async (): Promise<boolean> => {
  loading.value = true
  error.value = null
  const res = await apiFetch<DashboardResponse['data']>('/dashboard')
  if ((res as any).error) {
    error.value = (res as any).error
    loading.value = false
    return false
  } else if ((res as any).data) {
    const data = (res as any).data as DashboardResponse['data']
    actions.value = (data.actions ?? []) as any
    payments.value = data.carousels?.payments ?? {}
    smartProposals.value = data.carousels?.smartProposals ?? {}
    quickQuotes.value = data.carousels?.quickQuotes ?? {}
    snapshot.value = data.snapshot ?? snapshot.value
    generatedAt.value = data.generated_at ?? null
    // Summary
    const summary: any = (data as any).summary ?? {}
    summaryCloseRate.value = typeof summary.close_rate === 'number' ? summary.close_rate : null
    summaryOverdue.value = typeof summary.overdue_milestones === 'number' ? summary.overdue_milestones : null
    summaryGrossMonth.value = typeof summary.gross_payments_month === 'number' ? summary.gross_payments_month : null
  }
  loading.value = false
  return true
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const retryDashboard = async () => {
  const attempts = [0, 1000, 2000]
  for (let i = 0; i < attempts.length; i++) {
    if (i > 0) await sleep(attempts[i])
    const ok = await reloadDashboard()
    if (ok) return
  }
}

const onDeleteQuickQuote = async (item: CarouselItem) => {
  if (item.stage !== 'draft') return
  const ok = window.confirm('Delete this draft? This cannot be undone.')
  if (!ok) return
  const res = await apiFetch<{ ok: boolean }>("/estimates/delete", {
    method: 'POST',
    body: JSON.stringify({ id: item.id }),
  })
  if ((res as any).error) {
    console.error('Delete failed', (res as any).error)
    showToast('Delete failed.', 'error')
    return
  }
  await reloadDashboard()
  showToast('Draft deleted.')
}

onMounted(async () => {
  await reloadDashboard()
})
</script>

<style scoped>
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 200ms ease;
}
.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

/* Toasts */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
