<template>
  <StackQuotesProLanding
    :primary-cta="primaryCta"
    :demo-cta="demoCta"
    :hero-image="heroImage"
    :upgrade-cta="upgradeCta"
    hero-alt="Preview of a three-option StackQuotes proposal"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import StackQuotesProLanding from '@/components/marketing/StackQuotesProLanding.vue'
import { useAuth } from '@/lib/auth'
import heroImage from '@/assets/marketing-demo-proposal.png'

const router = useRouter()
const { isAuthenticated, setStoredRedirect } = useAuth()

const startWithPlan = async (plan: 'free' | 'pro') => {
  if (!isAuthenticated.value) {
    setStoredRedirect('/onboarding')
    await router.push({ name: 'register', query: { redirect: '/onboarding', plan } })
    return
  }
  await router.push({ name: 'onboarding', query: { plan } })
}

const primaryCta = computed(() => ({
  label: 'Start Free (30 Days)',
  onClick: () => startWithPlan('free'),
}))

const upgradeCta = computed(() => ({
  label: 'Upgrade to Pro',
  onClick: () => startWithPlan('pro'),
}))

const demoCta = computed(() => ({
  label: 'Watch 20-Second Demo',
  onClick: async () => {
    await router.push({ name: 'demo', query: { template: 'deck', autoplay: '1' } })
  },
}))
</script>
