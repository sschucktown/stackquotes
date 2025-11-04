<template>
  <div class="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
    <div class="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <header class="space-y-1 text-white">
        <h1 class="text-2xl font-semibold">Command Center</h1>
        <p class="text-sm opacity-80">Here’s what needs your action next.</p>
      </header>

      <nav class="mt-4 grid grid-cols-4 gap-2 text-[11px] font-medium text-white/80">
        <div class="rounded-full bg-white/10 p-2 text-center">Quotes</div>
        <div class="rounded-full bg-white/10 p-2 text-center">Proposals</div>
        <div class="rounded-full bg-white/10 p-2 text-center">Payments</div>
        <div class="rounded-full bg-white/10 p-2 text-center">Closed</div>
      </nav>

      <section class="mt-6">
        <h2 class="mb-3 text-xs font-semibold uppercase tracking-wide text-white/70">Your Action Needed</h2>
        <TransitionGroup name="fade-up" tag="div" class="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
          <article
            v-for="card in actionCards"
            :key="card.key"
            class="min-w-[260px] snap-start rounded-2xl p-4 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            :class="card.bg"
          >
            <p class="text-sm opacity-90">{{ card.title }}</p>
            <p class="mt-1 text-xl font-semibold">{{ card.subtitle }}</p>
            <button type="button" class="mt-4 w-full rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-white" @click="go(card.route)">{{ card.cta }}</button>
          </article>
          <article v-if="!loading && actionCards.length === 0" class="min-w-full rounded-2xl bg-white/10 p-4 text-white/80">
            All clear. No action items right now.
          </article>
        </TransitionGroup>
      </section>

      <section class="mt-6 space-y-6">
        <div v-if="hasAny(payments)" class="rounded-3xl bg-white p-4 shadow-sm">
          <header class="mb-3 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-slate-900">Payments</h3>
          </header>
          <div class="flex gap-3 overflow-x-auto pb-2 snap-x">
            <template v-for="stage in paymentStages" :key="stage.key">
              <div v-if="payments[stage.key]?.length" class="min-w-[180px] snap-start rounded-xl border border-slate-200 bg-white p-3">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <SQBadge :tone="toneForPaymentStage(stage.key)">{{ stage.label }}</SQBadge>
                </p>
                <TransitionGroup name="fade-up" tag="ul" class="mt-2 space-y-2">
                  <li v-for="item in payments[stage.key]" :key="item.id" class="rounded-lg bg-slate-50 p-2 text-sm text-slate-700">
                    <p class="truncate font-medium">{{ item.title || 'Untitled' }}</p>
                    <p v-if="item.amount !== undefined" class="text-xs text-slate-500">{{ currency(item.amount) }}</p>
                    <button type="button" class="mt-2 w-full rounded-md bg-[#0EA5E9] px-2 py-1 text-xs font-semibold text-white" @click="go(item.route)">{{ stage.cta }}</button>
                  </li>
                </TransitionGroup>
              </div>
            </template>
          </div>
        </div>

        <div v-if="hasAny(smartProposals)" class="rounded-3xl bg-white p-4 shadow-sm">
          <header class="mb-3 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-slate-900">SmartProposals</h3>
          </header>
          <div class="flex gap-3 overflow-x-auto pb-2 snap-x">
            <template v-for="stage in visibleProposalStages" :key="stage.key">
              <div v-if="smartProposals[stage.key]?.length" class="min-w-[180px] snap-start rounded-xl border border-slate-200 bg-white p-3">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ stage.label }}</p>
                <TransitionGroup name="fade-up" tag="ul" class="mt-2 space-y-2">
                  <li v-for="item in smartProposals[stage.key]" :key="item.id" class="rounded-lg bg-slate-50 p-2 text-sm text-slate-700">
                    <p class="truncate font-medium">{{ item.title || 'Untitled' }}</p>
                    <div class="mt-1 flex flex-wrap items-center gap-1.5">
                      <SQBadge :tone="toneForProposalStage(stage.key)">{{ stageLabel(stage.key) }}</SQBadge>
                      <span v-if="stage.key === 'viewed' && (item as any).viewed_at" class="text-[11px] text-slate-500">• {{ timeAgo(String((item as any).viewed_at)) }}</span>
                    </div>
                    <button type="button" class="mt-2 w-full rounded-md bg-[#0EA5E9] px-2 py-1 text-xs font-semibold text-white" @click="go(item.route)">{{ stage.cta }}</button>
                  </li>
                </TransitionGroup>
              </div>
            </template>
          </div>
        </div>

        <div v-if="hasAny(quickQuotes)" class="rounded-3xl bg-white p-4 shadow-sm">
          <header class="mb-3 flex items-center justify-between">
            <h3 class="text-sm font-semibold text-slate-900">QuickQuotes</h3>
          </header>
          <div class="flex gap-3 overflow-x-auto pb-2 snap-x">
            <template v-for="stage in quoteStages" :key="stage.key">
              <div v-if="quickQuotes[stage.key]?.length" class="min-w-[180px] snap-start rounded-xl border border-slate-200 bg-white p-3">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">{{ stage.label }}</p>
                <TransitionGroup name="fade-up" tag="ul" class="mt-2 space-y-2">
                  <li v-for="item in quickQuotes[stage.key]" :key="item.id" class="rounded-lg bg-slate-50 p-2 text-sm text-slate-700">
                    <p class="truncate font-medium">{{ item.title || 'Untitled' }}</p>
                    <div class="mt-1 flex flex-wrap items-center gap-1.5">
                      <SQBadge :tone="toneForQuoteStage(stage.key)">{{ quoteStageLabel(stage.key) }}</SQBadge>
                    </div>
                    <button type="button" class="mt-2 w-full rounded-md bg-[#0EA5E9] px-2 py-1 text-xs font-semibold text-white" @click="go(item.route)">{{ stage.cta }}</button>
                  </li>
                </TransitionGroup>
              </div>
            </template>
          </div>
        </div>
      </section>

      <section class="mt-6">
        <article class="rounded-3xl bg-white p-4 shadow-sm">
          <h3 class="text-sm font-semibold text-slate-900">ProfitPulse</h3>
          <div class="mt-2 grid gap-4 md:grid-cols-2">
            <div class="rounded-xl bg-slate-50 p-4">
              <p class="text-xs uppercase tracking-wide text-slate-500">Gross Profit Margin</p>
              <p class="mt-1 text-3xl font-semibold text-slate-900">{{ snapshot.gross_margin }}%</p>
              <p v-if="generatedAt" class="mt-1 text-xs text-slate-500">Updated {{ timeAgo(generatedAt) }}</p>
              <p class="mt-2 text-xs text-slate-500">Revenue: <span class="font-medium text-slate-700">{{ currency(snapshot.total_revenue) }}</span> • Cost: <span class="font-medium text-slate-700">{{ currency(snapshot.total_cost) }}</span></p>
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
                      <span class="text-[11px] text-slate-500">• {{ timeAgo(p.created_at) }}</span>
                    </div>
                    <p v-if="p.proposal_title" class="mt-0.5 truncate text-xs text-slate-400">{{ p.proposal_title }}</p>
                  </div>
                </li>
                <li v-if="!snapshot.latest_payments.length" class="px-3 py-3 text-xs text-slate-500">No payments yet.</li>
              </ul>
            </div>
          </div>
        </article>
      </section>
    </div>

    <button type="button" class="fixed bottom-5 right-5 inline-flex items-center justify-center rounded-full bg-[#0EA5E9] p-4 text-white shadow-lg ring-1 ring-white/20 hover:bg-[#10b3f0]" aria-label="New QuickQuote" @click="go('quickquote-new')">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { apiFetch } from '@/lib/http'
import { useTier } from '@/composables/useTier'
import SQBadge from '@stackquotes/ui/components/SQBadge.vue'

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
    subtitle: a.amount !== undefined ? currency(a.amount) : ${a.count ?? ''},
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
  if (mins < 60) return ${mins} min ago
  const hours = Math.round(mins / 60)
  return ${hours} hr ago
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
</script>

<style scoped>
.fade-up-enter-active,
.fade-up-leave-active { transition: all 200ms ease; }
.fade-up-enter-from,
.fade-up-leave-to { opacity: 0; transform: translateY(6px); }
</style>