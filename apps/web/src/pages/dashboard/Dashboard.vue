<template>
  <div class="min-h-screen bg-white">
    <div class="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <header class="text-slate-900">
        <h1 class="text-2xl font-semibold">Command Center</h1>
        <p class="text-sm opacity-80">Show exactly what needs attention.</p>
      </header>

      <div class="mt-4">
        <SummaryBand
          :open-proposals="kpiOpenProposals"
          :pending-deposits="kpiPendingDeposits"
          :close-rate="kpiCloseRate"
          @filter="onKpiFilter"
        />
      </div>

      <div class="my-6 h-px bg-gradient-to-r from-slate-800/0 via-slate-800/40 to-slate-800/0" />

      <section class="space-y-6">
        <!-- Payments (first) -->
        <CarouselModule
          v-if="paymentItems.length"
          title="Payments"
          :items="paymentItems"
          :stages="['deposit_pending','deposit_received','final_due','paid']"
          :color-map="{ deposit_pending: 'amber-500', deposit_received: 'sky-400', final_due: 'rose-500', paid: 'emerald-500' }"
          :focus-only="focusMode"
          :focus-stages="['deposit_pending','final_due']"
          @card-click="openItem"
        />

        <div class="h-px bg-gradient-to-r from-slate-800/0 via-slate-800/40 to-slate-800/0" />

        <!-- Proposals (second) -->
        <CarouselModule
          v-if="proposalItems.length"
          title="Proposals"
          :items="proposalItems"
          :stages="['unsent','sent','viewed','accepted']"
          :color-map="{ unsent: 'slate-500', sent: 'indigo-500', viewed: 'indigo-400', accepted: 'emerald-500' }"
          :focus-only="focusMode"
          :focus-stages="['sent','viewed']"
          @card-click="openItem"
          @nudge="nudgeItem"
        />

        <div class="h-px bg-gradient-to-r from-slate-800/0 via-slate-800/40 to-slate-800/0" />

        <!-- QuickQuotes (third) -->
        <CarouselModule
          v-if="quickQuoteItems.length"
          title="QuickQuotes"
          :items="quickQuoteItems"
          :stages="['draft','ready_to_convert','converted']"
          :color-map="{ draft: 'slate-500', ready_to_convert: 'indigo-500', converted: 'emerald-500' }"
          :focus-only="focusMode"
          :focus-stages="['ready_to_convert']"
          @card-click="openItem"
        />

        <div class="h-px bg-gradient-to-r from-slate-800/0 via-slate-800/40 to-slate-800/0" />

        <!-- ProfitPulse snapshot (summary) -->
        <article class="rounded-3xl bg-white/95 p-4 shadow-sm ring-1 ring-black/5">
          <h3 class="text-sm font-semibold text-slate-900">ProfitPulse</h3>
          <div class="mt-2 grid gap-4 md:grid-cols-2">
            <div class="rounded-xl bg-slate-50 p-4">
              <p class="text-xs uppercase tracking-wide text-slate-500">Gross Profit Margin</p>
              <p class="mt-1 text-3xl font-semibold text-slate-900">{{ snapshot.gross_margin }}%</p>
              <p v-if="generatedAt" class="mt-1 text-xs text-slate-500">Updated {{ timeAgo(generatedAt) }}</p>
              <p class="mt-2 text-xs text-slate-500">Revenue: <span class="font-medium text-slate-700">{{ currency(snapshot.total_revenue) }}</span>  Cost: <span class="font-medium text-slate-700">{{ currency(snapshot.total_cost) }}</span></p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-wide text-slate-500">Last 5 Payments</p>
              <ul class="mt-2 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
                <li v-for="p in snapshot.latest_payments" :key="p.id" class="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                  <div class="min-w-0">
                    <p class="font-medium text-slate-800">{{ currency(p.amount) }}</p>
                    <div class="mt-1 flex flex-wrap items-center gap-1.5">
                      <SQBadge :tone="toneForPaymentType(p.type)">{{ displayType(p.type) }}</SQBadge>
                      <SQBadge :tone="toneForPaymentStatus(p.status)">{{ displayStatus(p.status) }}</SQBadge>
                      <span class="text-[11px] text-slate-500">{{ timeAgo(p.created_at) }}</span>
                    </div>
                    <p v-if="p.proposal_title" class="mt-0.5 truncate text-xs text-slate-400">{{ p.proposal_title }}</p>
                  </div>
                </li>
                <li v-if="!snapshot.latest_payments.length" class="px-3 py-3 text-xs text-slate-500">No payments yet.</li>
              </ul>
            </div>
          </div>
        </article>

        <div class="h-px bg-gradient-to-r from-slate-800/0 via-slate-800/40 to-slate-800/0" />
        <AiInsightsWidget :seen-not-accepted="insightsSeenNotAccepted" @cta="router.push({ name: 'smart-proposals' })" />
      </section>
    </div>\n    <!-- Global FAB provided by layout -->
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { apiFetch } from '@/lib/http'
import { useTier } from '@/composables/useTier'
import SQBadge from '@stackquotes/ui/components/SQBadge.vue'
import CarouselModule, { type CarouselItem } from '@/components/dashboard/CarouselModule.vue'
import SummaryBand from '@/components/dashboard/SummaryBand.vue'
import AiInsightsWidget from '@/components/dashboard/AiInsightsWidget.vue'

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
      smartProposals: Record<string, Array<{ id: string; title?: string; route: string }>>
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

const toneBg: Record<string, string> = {
  red: 'bg-rose-600',
  yellow: 'bg-amber-500',
  blue: 'bg-sky-600',
  green: 'bg-emerald-600',
}

const actionCards = computed(() =>
  actions.value.map((a) => ({
    key: a.key,
    bg: toneBg[a.tone] || 'bg-sky-600',
    title: a.label,
    subtitle: a.amount !== undefined ? currency(a.amount) : String(a.count ?? ''),
    cta: a.cta,
    route: a.route,
  }))
)

const paymentStages = [
  { key: 'deposit_pending', label: 'Deposit Pending', cta: 'Request Deposit' },
  { key: 'deposit_received', label: 'Deposit Received', cta: 'View Receipt' },
  { key: 'final_due', label: 'Final Payment Due', cta: 'Send PayLink' },
  { key: 'paid', label: 'Paid', cta: 'View' },
]
const proposalStages = [
  { key: 'unsent', label: 'Unsent', cta: 'Send' },
  { key: 'sent', label: 'Sent', cta: 'View' },
  { key: 'viewed', label: 'Viewed', cta: 'Follow Up' },
  { key: 'accepted', label: 'Accepted', cta: 'Collect Deposit' },
  { key: 'declined_expired', label: 'Declined / Expired', cta: 'Archive' },
]
const quoteStages = [
  { key: 'draft', label: 'Draft', cta: 'Finish Quote' },
  { key: 'ready_to_convert', label: 'Ready to Convert', cta: 'Generate Proposal' },
  { key: 'converted', label: 'Converted', cta: 'View Proposal' },
]

const { isPaid, inTrial } = useTier()
const canAccessPro = computed(() => isPaid.value || inTrial.value)
const visibleProposalStages = computed(() =>
  canAccessPro.value ? proposalStages : proposalStages.filter(s => ['unsent','sent'].includes(s.key))
)

const hasAny = (group: Record<string, Array<unknown>> | undefined): boolean => {
  if (!group) return false
  return Object.values(group).some((arr) => Array.isArray(arr) && arr.length > 0)
}

const currency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0)

const timeAgo = (iso: string) => {
  const ms = Date.now() - new Date(iso).getTime()
  const mins = Math.max(0, Math.round(ms / 60000))
  if (mins < 60) return `${mins} min ago`
  const hours = Math.round(mins / 60)
  return `${hours} hr ago`
}

const displayType = (t?: string | null) => {
  const v = (t || '').toString().toLowerCase()
  if (v === 'deposit') return 'Deposit'
  if (v === 'upsell') return 'Upsell'
  if (v === 'installment') return 'Installment'
  return 'Payment'
}
const displayStatus = (s?: string | null) => {
  const v = (s || '').toString().toLowerCase()
  if (v === 'succeeded' || v === 'paid') return 'Paid'
  if (v === 'pending' || v === 'processing') return 'Pending'
  if (v === 'failed' || v === 'canceled' || v === 'cancelled') return 'Failed'
  return v ? v.charAt(0).toUpperCase() + v.slice(1) : 'Status'
}

type BadgeTone = 'default' | 'success' | 'warning' | 'danger'
const toneForPaymentType = (t?: string | null): BadgeTone => {
  const v = (t || '').toString().toLowerCase()
  if (v === 'installment') return 'warning'
  return 'default'
}
const toneForPaymentStatus = (s?: string | null): BadgeTone => {
  const v = (s || '').toString().toLowerCase()
  if (v === 'succeeded' || v === 'paid') return 'success'
  if (v === 'pending' || v === 'processing') return 'warning'
  if (v === 'failed' || v === 'canceled' || v === 'cancelled') return 'danger'
  return 'default'
}

const stageLabel = (key: string) => {
  switch (key) {
    case 'unsent': return 'Unsent'
    case 'sent': return 'Sent'
    case 'viewed': return 'Viewed'
    case 'accepted': return 'Accepted'
    case 'declined_expired': return 'Declined/Expired'
    default: return 'Stage'
  }
}

const toneForPaymentStage = (key: string): BadgeTone => {
  switch (key) {
    case 'deposit_pending': return 'danger'
    case 'final_due': return 'warning'
    case 'deposit_received':
    case 'paid': return 'success'
    default: return 'default'
  }
}

const quoteStageLabel = (key: string) => {
  switch (key) {
    case 'draft': return 'Draft'
    case 'ready_to_convert': return 'Ready to Convert'
    case 'converted': return 'Converted'
    default: return 'Stage'
  }
}
const toneForQuoteStage = (key: string): BadgeTone => {
  switch (key) {
    case 'converted': return 'success'
    case 'ready_to_convert': return 'warning'
    case 'draft':
    default: return 'default'
  }
}
const toneForProposalStage = (key: string): BadgeTone => {
  switch (key) {
    case 'accepted': return 'success'
    case 'declined_expired': return 'danger'
    case 'sent':
    case 'viewed':
    case 'unsent':
    default: return 'default'
  }
}

onMounted(async () => {
  loading.value = true
  error.value = null
  const res = await apiFetch<DashboardResponse['data']>('/dashboard')
  if (res.error) {
    error.value = res.error
  } else if (res.data) {
    actions.value = (res.data.actions ?? []) as any
    payments.value = res.data.carousels?.payments ?? {}
    smartProposals.value = res.data.carousels?.smartProposals ?? {}
    quickQuotes.value = res.data.carousels?.quickQuotes ?? {}
    snapshot.value = res.data.snapshot ?? snapshot.value
    generatedAt.value = res.data.generated_at ?? null
  }
  loading.value = false
})

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
  const acc = smartProposals.value?.accepted?.length || 0
  const lost = smartProposals.value?.declined_expired?.length || 0
  const denom = acc + lost
  return denom === 0 ? 0 : acc / denom
})

// Items mapping for carousels
const mapItems = (records: Record<string, Array<{ id: string; title?: string; amount?: number; route: string }>>, stageKey: string): CarouselItem[] => {
  const arr = records?.[stageKey] || []
  return arr.map((i) => ({
    id: i.id,
    title: i.title || 'Untitled',
    amount: (i as any).amount,
    stage: stageKey,
    route: i.route,
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

// KPI filters (currently toggles focus mode)
const onKpiFilter = (key: 'proposals'|'deposits'|'close') => {
  focusMode.value = true
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
    if (res.error) throw new Error(res.error)
    // basic feedback; replace with toast if available
    console.info('Nudge sent for', item.id)
  } catch (e: any) {
    console.error('Nudge failed', e?.message || e)
  }
}
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
</style>
