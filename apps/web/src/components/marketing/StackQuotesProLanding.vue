<template>
  <div class="relative min-h-screen overflow-hidden bg-slate-950 text-white">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900" />
      <div class="absolute -left-16 top-12 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl md:-left-10 md:h-96 md:w-96" />
      <div class="absolute -right-10 bottom-[-6rem] h-80 w-80 rounded-full bg-teal-400/15 blur-3xl md:h-[26rem] md:w-[26rem]" />
    </div>

    <div class="relative">
      <!-- HERO -->
      <section class="mx-auto max-w-6xl px-6 pt-16 pb-12 md:pt-20 lg:pt-24 lg:pb-16">
        <div class="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div class="space-y-6">
            <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-100/80">
              January Launch
            </span>
            <h1 class="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Close more jobs with Good/Better/Best proposals.
            </h1>
            <p class="text-lg text-slate-200">
              Send fast, polished quotes your clients can accept instantly - all from your phone.
            </p>
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                class="w-full rounded-full bg-[#00D1FF] px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-cyan-300 sm:w-auto"
                @click="handlePrimary"
              >
                Start Free (30 Days)
              </button>
              <button
                type="button"
                class="w-full rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/20 sm:w-auto"
                @click="handleDemo"
              >
                Watch 20-Second Demo
              </button>
            </div>
            <div class="flex flex-wrap gap-3 text-sm text-slate-300">
              <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">Mobile-first builder</span>
              <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">Instant accept & pay</span>
              <span class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">Good/Better/Best ready</span>
            </div>
          </div>
          <div class="relative">
            <div class="rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur">
              <img :src="heroImage" :alt="heroAlt" loading="lazy" class="w-full rounded-[1.5rem] border border-white/10 object-cover" />
              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                <div class="flex items-center gap-2 rounded-xl border border-white/10 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                  <span class="h-2 w-2 rounded-full bg-emerald-300"></span>
                  <span>Accept & pay on the spot</span>
                </div>
                <div class="flex items-center gap-2 rounded-xl border border-white/10 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
                  <span class="h-2 w-2 rounded-full bg-cyan-300"></span>
                  <span>3-option proposals ready to send</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- SPEED-RUN -->
      <section class="mx-auto max-w-5xl px-6 pb-14">
        <div class="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg">
          <div class="space-y-2 text-center">
            <h2 class="text-3xl font-semibold">See how fast it really is.</h2>
            <p class="text-slate-300">QuickQuote -> ScopeForge -> SmartProposal -> Accept & Pay.</p>
          </div>
          <div class="mt-6 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
            <div id="sq-speedrun-gif" class="flex h-60 items-center justify-center rounded-xl border border-dashed border-white/20 bg-slate-800/80 text-sm text-slate-300">
              Looping GIF placeholder
            </div>
            <div class="mt-4 flex flex-wrap justify-center gap-2">
              <span
                v-for="step in speedrunSteps"
                :key="step"
                class="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-200"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-cyan-300"></span>
                {{ step }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- ACCORDION FEATURES -->
      <section class="mx-auto max-w-5xl px-6 pb-14">
        <div class="space-y-3">
          <h2 class="text-3xl font-semibold">Build and send in minutes.</h2>
          <p class="text-slate-300">Tap through the workflow contractors use in the field.</p>
        </div>
        <div class="mt-6 space-y-3">
          <div v-for="item in accordionItems" :key="item.key" class="rounded-2xl border border-white/10 bg-white/5">
            <button class="flex w-full items-center justify-between gap-3 px-4 py-4 text-left" @click="toggleAccordion(item.key)">
              <div class="flex items-center gap-3">
                <span class="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/10 text-sm font-semibold text-cyan-200">{{ item.order }}</span>
                <div>
                  <p class="text-lg font-semibold">{{ item.title }}</p>
                  <p v-if="item.subtitle" class="text-sm text-slate-300">{{ item.subtitle }}</p>
                </div>
              </div>
              <svg :class="['h-5 w-5 text-slate-200 transition-transform', isOpen(item.key) ? 'rotate-180' : '']" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m6 9 6 6 6-6" />
              </svg>
            </button>
            <transition name="accordion">
              <div v-if="isOpen(item.key)" class="space-y-4 border-t border-white/10 px-4 pb-5 pt-2">
                <div v-if="item.hasMobileShot" class="rounded-xl border border-white/10 bg-slate-900/70 p-3 text-sm text-slate-300">
                  Mobile screenshot placeholder
                </div>
                <ul class="space-y-2 text-slate-200">
                  <li v-for="point in item.bullets" :key="point" class="flex items-start gap-2">
                    <CheckIcon class="mt-0.5 h-4 w-4 text-cyan-300" />
                    <span>{{ point }}</span>
                  </li>
                </ul>
              </div>
            </transition>
          </div>
        </div>
      </section>

      <!-- TRADES -->
      <section class="mx-auto max-w-5xl px-6 pb-14">
        <div class="space-y-3 text-center">
          <h2 class="text-3xl font-semibold">Trades we serve</h2>
          <p class="text-slate-300">Built with crews in mind.</p>
        </div>
        <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-7">
          <div
            v-for="trade in trades"
            :key="trade"
            class="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-3 py-4 text-sm font-semibold text-slate-100"
          >
            {{ trade }}
          </div>
        </div>
      </section>

      <!-- DAY ONE -->
      <section class="mx-auto max-w-5xl px-6 pb-14">
        <div class="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg">
          <h2 class="text-2xl font-semibold">What you get on day 1</h2>
          <ul class="mt-4 grid gap-3 sm:grid-cols-2">
            <li
              v-for="item in dayOneList"
              :key="item"
              class="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3"
            >
              <CheckIcon class="mt-1 h-5 w-5 text-emerald-300" />
              <span class="text-slate-200">{{ item }}</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- PRICING -->
      <section id="pricing" class="mx-auto max-w-6xl px-6 pb-14">
        <div class="space-y-3 text-center">
          <h2 class="text-3xl font-semibold">Choose your plan</h2>
          <p class="text-slate-300">Simple launch pricing for January.</p>
        </div>
        <div class="mt-8 grid gap-6 md:grid-cols-2">
          <div
            v-for="plan in pricingPlans"
            :key="plan.name"
            class="relative rounded-3xl border border-white/10 bg-white/5 p-6 shadow-lg"
          >
            <div class="flex items-center justify-between gap-3">
              <div>
                <p class="text-sm uppercase tracking-[0.25em] text-slate-300">{{ plan.name }}</p>
                <p class="mt-2 text-2xl font-semibold text-white">{{ plan.price }}</p>
              </div>
              <span
                v-if="plan.badge"
                class="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-100"
              >
                {{ plan.badge }}
              </span>
            </div>
            <ul class="mt-5 space-y-2 text-slate-200">
              <li v-for="benefit in plan.benefits" :key="benefit" class="flex items-start gap-2">
                <CheckIcon class="mt-0.5 h-4 w-4 text-cyan-300" />
                <span>{{ benefit }}</span>
              </li>
            </ul>
            <button
              type="button"
              class="mt-6 w-full rounded-full px-4 py-3 text-sm font-semibold transition"
              :class="plan.name === 'Pro' ? 'bg-[#00D1FF] text-slate-900 hover:bg-cyan-300' : 'border border-white/20 bg-white/10 text-white hover:bg-white/20'"
              @click="plan.cta === 'upgrade' ? handleUpgrade() : handlePrimary()"
            >
              {{ plan.ctaLabel }}
            </button>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section class="mx-auto max-w-5xl px-6 pb-14">
        <div class="space-y-3 text-center">
          <h2 class="text-3xl font-semibold">FAQ</h2>
          <p class="text-slate-300">Quick answers for busy crews.</p>
        </div>
        <div class="mt-6 divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/5">
          <div v-for="faq in faqs" :key="faq.q" class="px-5 py-4">
            <p class="text-lg font-semibold text-white">{{ faq.q }}</p>
            <p class="mt-1 text-slate-300">{{ faq.a }}</p>
          </div>
        </div>
      </section>

      <!-- FINAL CTA -->
      <section class="mx-auto max-w-4xl px-6 pb-16 text-center">
        <div class="rounded-3xl border border-white/10 bg-gradient-to-r from-cyan-500/15 via-white/5 to-cyan-400/15 p-10 shadow-lg backdrop-blur">
          <h2 class="text-3xl font-semibold">Start Free for 30 Days</h2>
          <p class="mt-3 text-slate-200">Send your first Good/Better/Best proposal tonight.</p>
          <div class="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              class="w-full rounded-full bg-[#00D1FF] px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg transition hover:-translate-y-0.5 hover:bg-cyan-300 sm:w-auto"
              @click="handlePrimary"
            >
              Start Free (30 Days)
            </button>
            <button
              type="button"
              class="w-full rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/20 sm:w-auto"
              @click="handleDemo"
            >
              Watch 20-Second Demo
            </button>
          </div>
        </div>
      </section>
    </div>

    <!-- DEMO MODAL -->
    <div v-if="openDemo" class="fixed inset-0 z-50 grid place-items-center bg-black/70 backdrop-blur-sm px-4">
      <div class="w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
        <div class="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <p class="font-semibold text-white">20-Second Demo</p>
          <button class="text-slate-300 hover:text-white" @click="openDemo = false">x</button>
        </div>
        <div class="p-4">
          <div class="relative aspect-video rounded-xl border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900">
            <div class="absolute inset-0 grid place-items-center text-slate-300">Demo video placeholder</div>
          </div>
        </div>
        <div class="px-4 pb-4">
          <button
            type="button"
            class="w-full rounded-full bg-[#00D1FF] px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300"
            @click="handlePrimary"
          >
            Start Free (30 Days)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, h, ref } from 'vue'

interface CTAConfig {
  label?: string
  onClick?: () => void
}

interface AccordionItem {
  key: string
  title: string
  subtitle?: string
  bullets: string[]
  hasMobileShot?: boolean
  order: string
}

interface FAQItem {
  q: string
  a: string
}

const props = defineProps<{
  primaryCta?: CTAConfig
  demoCta?: CTAConfig
  upgradeCta?: CTAConfig
  heroImage: string
  heroAlt: string
}>()

const openDemo = ref(false)
const activeAccordion = ref<string>('QuickQuote')

const speedrunSteps = ['QuickQuote', 'ScopeForge', 'SmartProposal', 'Accept & Pay']

const accordionItems: AccordionItem[] = [
  {
    key: 'QuickQuote',
    title: 'QuickQuote',
    subtitle: 'Capture scope in the driveway',
    bullets: ['Add materials and labor from your phone in under 2 minutes.', 'Auto-calc taxes, fees, and deposits on the fly.', 'Send the estimate before you leave the job site.'],
    hasMobileShot: true,
    order: '1',
  },
  {
    key: 'ScopeForge',
    title: 'ScopeForge (Good/Better/Best)',
    subtitle: 'Upgrade-friendly options',
    bullets: ['Present three clear options with upsells already baked in.', 'Swap finishes and add-ons without rebuilding the quote.', 'Clients see exactly what upgrades do for the price.'],
    order: '2',
  },
  {
    key: 'SmartProposal',
    title: 'SmartProposal',
    subtitle: 'Polished, professional packages',
    bullets: ['Drop in photos, scope notes, and allowances clients understand.', 'Brand the proposal with your logo and color in seconds.', 'Export-ready PDF plus mobile-friendly share links.'],
    order: '3',
  },
  {
    key: 'AcceptPay',
    title: 'Accept & Pay',
    subtitle: 'Instant approvals',
    bullets: ['Clients tap to accept, sign, and pay from any device.', 'Offer deposits, milestones, or pay-in-full at checkout.', 'Next-step prompts keep the job moving without emails.'],
    order: '4',
  },
  {
    key: 'ProfitPulse',
    title: 'ProfitPulse',
    subtitle: 'Know the numbers',
    bullets: ['Track win rate, upgrades, and deposit velocity at a glance.', 'See fees, payouts, and milestones in one feed.', 'Spot which options close fastest across your trades.'],
    order: '5',
  },
]

const trades = ['Decks', 'Fencing', 'Painting', 'Concrete', 'Siding', 'Pools', 'Remodeling']

const dayOneList = [
  '3-option proposals',
  'Instant deposits',
  'Full mobile builder',
  'Zero setup',
  'Professional templates',
  'Works with your current workflow',
]

const pricingPlans = [
  {
    name: 'Free',
    price: '$0/mo + 3% platform fee',
    benefits: ['Single-option proposals', 'Mobile quote builder', 'Accept payments', 'ProfitPulse Basic'],
    cta: 'start',
    ctaLabel: 'Start Free',
  },
  {
    name: 'Pro',
    price: '$49.99/mo',
    badge: 'Most popular',
    benefits: [
      'No platform fee',
      'Good/Better/Best (ScopeForge)',
      'Branded proposals',
      'Comments + revisions',
      'Milestone payments',
      'ProfitPulse Pro',
      'Save templates',
    ],
    cta: 'upgrade',
    ctaLabel: 'Upgrade to Pro',
  },
]

const faqs: FAQItem[] = [
  { q: 'Do clients need an account?', a: 'No. Clients open the proposal link, choose an option, sign, and pay without creating an account.' },
  { q: 'How fast do I get paid?', a: 'Instant payouts or ACH, depending on what you enable. Deposits and milestones are available.' },
  { q: 'Does this work on my phone?', a: 'Yes - 100% mobile-first. Build, send, and collect payments directly from your phone.' },
  { q: 'Can I customize the quote?', a: 'Yes, fully editable. Swap materials, add allowances, and brand the proposal in seconds.' },
  { q: 'Is Stripe included?', a: 'Yes. Built-in Stripe Connect for fast, secure payments.' },
]

const handlePrimary = () => {
  if (props.primaryCta?.onClick) {
    props.primaryCta.onClick()
  }
}

const handleDemo = () => {
  if (props.demoCta?.onClick) {
    props.demoCta.onClick()
    return
  }
  openDemo.value = true
}

const handleUpgrade = () => {
  if (props.upgradeCta?.onClick) {
    props.upgradeCta.onClick()
    return
  }
  handlePrimary()
}

const toggleAccordion = (key: string) => {
  activeAccordion.value = activeAccordion.value === key ? '' : key
}

const isOpen = (key: string) => activeAccordion.value === key

const CheckIcon = defineComponent({
  name: 'CheckIcon',
  props: {
    class: String,
  },
  setup(props) {
    return () =>
      h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          viewBox: '0 0 20 20',
          fill: 'currentColor',
          class: props.class ?? '',
        },
        [
          h('path', {
            fillRule: 'evenodd',
            d: 'M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.707-9.707a1 1 0 0 0-1.414-1.414L9 10.172 7.707 8.879a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4Z',
            clipRule: 'evenodd',
          }),
        ]
      )
  },
})
</script>

<style scoped>
.accordion-enter-active,
.accordion-leave-active {
  transition: opacity 0.2s ease;
}
.accordion-enter-from,
.accordion-leave-to {
  opacity: 0;
}
</style>
