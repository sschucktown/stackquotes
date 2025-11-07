<template>
  <StackQuotesProLanding
    :primary-cta="primaryCta"
    :demo-cta="demoCta"
    :hero-image="heroImage"
    hero-alt="Preview of a three-option StackQuotes proposal"
    :founder-image="founderImage"
    founder-alt="Portrait of the StackQuotes founder"
    :hero-stats="heroStats"
    :features="features"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { FileText, Users, Zap } from 'lucide-vue-next'
import StackQuotesProLanding from '@/components/marketing/StackQuotesProLanding.vue'
import { useAuth } from '@/lib/auth'
import heroImage from '@/assets/marketing-demo-proposal.png'
import founderImage from '@/assets/marketing-founder.png'

const router = useRouter()
const { isAuthenticated, setStoredRedirect } = useAuth()

const heroStats = [
  { label: 'Avg. Time to Send', value: '12 minutes', caption: 'Start from the templated proposal library.' },
  { label: 'Proposal Conversion', value: '3x higher', caption: 'Upgrade-driven quotes win more premium work.' },
  { label: 'Faster Payments', value: 'Next-day ACH', caption: 'Collect deposits instantly once a client accepts.' },
  { label: 'Automated Follow-up', value: 'Smart nudges', caption: 'StackQuotes pings prospects so you do not have to.' },
]

const features = [
  {
    title: 'Good / Better / Best in one click',
    description: 'Spin up tiered proposals with branded upgrades and pricing pulled from your library.',
    points: [
      'Send polished proposals with embedded video and financing nudges.',
      'Surface upsells automatically based on project type and trade.',
    ],
    icon: FileText,
  },
  {
    title: 'Instant client approvals and deposits',
    description: 'Clients approve, sign, and pay from any device. Secure payments move straight to scheduling crews.',
    points: [
      'ACH and card payments with automatic receipts and sync.',
      'Real-time acceptance notifications and pipeline updates.',
    ],
    icon: Zap,
  },
  {
    title: 'Demo-ready SmartWorkspace',
    description: 'See StackQuotes with sample data. Activate demo mode to walk through proposals and analytics.',
    points: [
      'Dashboard seeded with proposal analytics for the Founding 50.',
      'Switch between live and demo in a click; no setup required.',
    ],
    icon: Users,
  },
]

const primaryCta = computed(() => ({
  label: isAuthenticated.value ? 'Go to Onboarding' : 'Start Free for 30 Days',
  onClick: async () => {
    if (!isAuthenticated.value) {
      setStoredRedirect('/onboarding')
      await router.push({ name: 'register', query: { redirect: '/onboarding', plan: 'pro' } })
      return
    }
    await router.push({ name: 'onboarding' })
  },
}))

const demoCta = computed(() => ({
  label: 'See a Demo',
  onClick: async () => {
    await router.push({ name: 'demo', query: { template: 'deck' } })
  },
}))
</script>
