<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { apiFetch } from '@/lib/http'
import { useContractorProfileStore } from '@/modules/contractor/stores/profileStore'

type CreateConnectResponse = {
  url: string
  accountId: string
  status: string
}

const profileStore = useContractorProfileStore()
const loading = ref(false)
const error = ref<string | null>(null)

const stripeConnected = computed(() => profileStore.profile?.stripeAccountStatus === 'active')
const stripeStatus = computed(() => profileStore.profile?.stripeAccountStatus ?? 'pending')

// Default zero states for new users
const paymentsReceived30 = computed(() => 0)
const paymentsPending = computed(() => 0)
const currency = (value?: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0)

async function startStripeOnboarding() {
  error.value = null
  loading.value = true
  try {
    // Ensure profile is loaded (needed for email/flags on backend)
    if (!profileStore.profile && !profileStore.loading) {
      try { await profileStore.load() } catch {}
    }

    const response = await apiFetch<CreateConnectResponse>('/stripe/create-connect-account', {
      method: 'POST',
      body: JSON.stringify({}),
    })
    if (response.error) throw new Error(response.error)
    const data = (response as any).data as CreateConnectResponse | undefined
    if (!data?.url) throw new Error('Failed to create Stripe onboarding link')
    // Redirect to Stripe onboarding
    window.location.assign(data.url)
  } catch (e: any) {
    error.value = e?.message ?? 'Unable to start Stripe onboarding.'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!profileStore.profile && !profileStore.loading) {
    try { await profileStore.load() } catch {}
  }
})
</script>

<template>
  <div class="min-h-screen">
    <div class="mx-auto w-full max-w-5xl">
      <header class="rounded-3xl bg-white/80 p-6 shadow-sm ring-1 ring-slate-100">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Billing</p>
        <h1 class="text-2xl font-semibold text-slate-900">Payments</h1>
        <p class="mt-1 text-sm text-slate-600">Track received payments and pending balances.</p>
      </header>

      <section class="mt-6 grid gap-4 sm:grid-cols-2">
        <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p class="text-xs uppercase tracking-wide text-slate-500">Received</p>
          <p class="mt-2 text-3xl font-semibold text-slate-900">{{ currency(paymentsReceived30) }}</p>
          <p class="mt-1 text-xs text-slate-500">Last 30 days</p>
        </article>
        <article class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p class="text-xs uppercase tracking-wide text-slate-500">Pending</p>
          <p class="mt-2 text-3xl font-semibold text-slate-900">{{ currency(paymentsPending) }}</p>
          <p class="mt-1 text-xs text-slate-500">Awaiting payment</p>
        </article>
      </section>

      <section class="mt-6 grid gap-4 sm:grid-cols-2">
        <article class="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs uppercase tracking-wide text-emerald-700">Stripe Connect</p>
              <h2 class="mt-1 text-lg font-semibold text-emerald-900">Payouts Setup</h2>
              <p class="mt-1 text-sm text-emerald-800">
                {{ stripeConnected ? 'Connected — payouts enabled' : 'Connect your Stripe Express account to receive payouts.' }}
              </p>
              <p class="mt-1 text-xs text-emerald-700">Status: {{ stripeStatus }}</p>
              <p v-if="error" class="mt-2 text-xs text-rose-700">{{ error }}</p>
            </div>
            <div class="shrink-0">
              <button
                v-if="!stripeConnected"
                :disabled="loading"
                class="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-60"
                @click="startStripeOnboarding"
              >
                {{ loading ? 'Connecting…' : 'Connect Stripe' }}
              </button>
              <span v-else class="inline-flex items-center rounded-md bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">Connected</span>
            </div>
          </div>
        </article>

        <article class="rounded-2xl border border-slate-200 bg-white/70 p-6 text-center text-sm text-slate-500">
          More billing tools coming soon.
        </article>
      </section>
    </div>
  </div>
</template>
