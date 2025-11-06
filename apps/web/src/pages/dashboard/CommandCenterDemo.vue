<script setup lang="ts">
import { ref } from 'vue'
import CommandCenter from '@/components/dashboard/CommandCenter.vue'
import type { CarouselItem } from '@/components/dashboard/CarouselModule.vue'
import { useDemoStore } from '@/stores/demoStore'

const demo = useDemoStore()
if (!demo.active) demo.activate()

const openProposals = ref(3)
const pendingDeposits = ref(2)
const closeRate = ref(0.42)
const overdueMilestones = ref(1)
const grossPaymentsMonth = ref(18250)

const mkItem = (id: string, title: string, stage: string, amount?: number): CarouselItem => ({
  id,
  title,
  stage,
  amount: amount ?? 0,
})

const paymentItems = ref<CarouselItem[]>([
  mkItem('p1','Deposit — Deck Remodel','deposit_pending', 3200),
  mkItem('p2','Final — Lighting Upgrade','final_due', 2100),
  mkItem('p3','Deposit — Porch Cover','deposit_received', 2800),
  mkItem('p4','Payment — Change Order','paid', 450),
])

const proposalItems = ref<CarouselItem[]>([
  mkItem('sp1','Charleston Deck Remodel','sent'),
  mkItem('sp2','Deck Lighting Upgrade','accepted'),
  mkItem('sp3','Porch Cover Add-on','viewed'),
])

const quickQuoteItems = ref<CarouselItem[]>([
  mkItem('qq1','Boardwalk Refresh','draft'),
  mkItem('qq2','Pergola Kit','ready_to_convert'),
  mkItem('qq3','Outdoor Kitchen','converted'),
])

const snapshot = ref({
  latest_payments: [
    { id: 'lp1', amount: 3200, type: 'deposit', status: 'pending', created_at: new Date(Date.now()-2*60*60*1000).toISOString(), proposal_title: 'Charleston Deck Remodel' },
    { id: 'lp2', amount: 2100, type: 'final', status: 'processing', created_at: new Date(Date.now()-6*60*60*1000).toISOString(), proposal_title: 'Deck Lighting Upgrade' },
    { id: 'lp3', amount: 450, type: 'payment', status: 'paid', created_at: new Date(Date.now()-26*60*60*1000).toISOString(), proposal_title: 'Change Order' },
  ],
  gross_margin: 38,
  total_revenue: 48250,
  total_cost: 29915,
})

const generatedAt = ref(new Date().toISOString())

const onCardClick = (item: CarouselItem) => {
  // no-op in demo; real app would navigate
  console.log('[demo] card-click', item)
}
const onNudge = (item: CarouselItem) => console.log('[demo] nudge', item)
const onDelete = (item: CarouselItem) => console.log('[demo] delete', item)
const onInsightsCta = () => console.log('[demo] insights-cta')
</script>

<template>
  <div class="min-h-screen bg-white">
    <div class="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <header class="text-slate-900 mb-4">
        <h1 class="text-2xl font-semibold">Command Center (Demo)</h1>
        <p class="text-sm opacity-80">Interactive demo with seeded data.</p>
      </header>
      <CommandCenter
        :open-proposals="openProposals"
        :pending-deposits="pendingDeposits"
        :close-rate="closeRate"
        :overdue-milestones="overdueMilestones"
        :gross-payments-month="grossPaymentsMonth"
        :payment-items="paymentItems"
        :proposal-items="proposalItems"
        :quick-quote-items="quickQuoteItems"
        :snapshot="snapshot"
        :generated-at="generatedAt"
        :focus-only="false"
        :insights-seen-not-accepted="1"
        :loading="false"
        :error="null"
        @card-click="onCardClick"
        @nudge="onNudge"
        @delete="onDelete"
        @insights-cta="onInsightsCta"
      />
    </div>
  </div>
  
</template>

