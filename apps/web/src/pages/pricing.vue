<template>
  <div class="min-h-screen bg-slate-950 text-white">
    <div class="mx-auto flex max-w-4xl flex-col gap-12 px-6 py-16 lg:py-24">
      <header class="text-center">
        <p class="text-sm uppercase tracking-[0.3em] text-cyan-300/80">StackQuotes Pricing</p>
        <h1 class="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">StackQuotes Pro – $79/mo</h1>
        <p class="mt-5 text-base text-white/70 sm:text-lg">Everything you need to quote, close, and get paid.</p>
        <p class="mt-2 text-sm text-white/60">30-day free trial. No card required. Cancel anytime.</p>
      </header>

      <div class="grid gap-8 md:grid-cols-1">
        <article
          class="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl border-cyan-400/70 bg-cyan-500/5 shadow-cyan-500/30"
        >
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-semibold">Pro</h2>
              <span class="rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-semibold uppercase text-cyan-200">
                Best value
              </span>
            </div>
            <p class="text-sm text-white/70">Good/Better/Best proposals, instant approvals and payments, analytics.</p>
            <div class="mt-6 flex items-baseline gap-1">
              <span class="text-4xl font-bold tracking-tight">$79</span>
              <span class="text-sm text-white/60">/month</span>
            </div>
          </div>

          <ul class="mt-6 flex-1 space-y-3 text-sm text-white/80">
            <li v-for="feature in proFeatures" :key="feature" class="flex items-start gap-3">
              <span class="mt-1 h-2 w-2 rounded-full bg-cyan-400"></span>
              <span>{{ feature }}</span>
            </li>
          </ul>

          <div class="mt-8">
            <button
              type="button"
              class="w-full rounded-xl px-4 py-3 text-center text-sm font-semibold transition bg-cyan-500 text-slate-950 hover:bg-cyan-400"
              :class="[loading ? 'cursor-wait opacity-70' : '']"
              :disabled="loading"
              @click="handleProClick()"
            >
              <span v-if="loading">Redirecting to Stripe...</span>
              <span v-else>Start Free for 30 Days</span>
            </button>
            <p v-if="errorMessage" class="mt-3 text-sm text-red-400">{{ errorMessage }}</p>
            <p v-else class="mt-3 text-xs text-white/60">Trial auto-converts to paid. Manage billing in Stripe.</p>
          </div>
        </article>
      </div>

      <footer class="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
        <p>
          Stripe test mode is active in local development. Use card
          <code class="rounded bg-white/10 px-2 py-0.5 text-xs text-white/85">4242 4242 4242 4242</code>
          with any future expiration and CVC to simulate payments. Supabase records update after webhook acknowledgement.
        </p>
        <p class="mt-4">
          Contractor payouts run through Stripe Connect Express accounts. Platform fee for deposits is 1% on paid plans.
        </p>
      </footer>
    </div>
  </div>
  </template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/lib/auth";
import { startCheckout } from "@/lib/stripeCheckout";

const auth = useAuth();
const router = useRouter();

const loading = ref(false);
const errorMessage = ref<string | null>(null);

const proFeatures = [
  "Unlimited Proposals",
  "Good/Better/Best templates + smart upsells",
  "Instant approvals + deposits (1% fee)",
  "ProfitPulse analytics dashboard",
  "QuickBooks Sync",
  "Full team access (up to 5 users)",
];

const handleProClick = async () => {
  errorMessage.value = null;

  if (!auth.isAuthenticated.value) {
    auth.setStoredRedirect(`/pricing`);
    await router.push({ name: "register", query: { plan: "pro" } });
    return;
  }

  loading.value = true;
  try {
    await startCheckout({ planTier: "pro", billingInterval: "monthly" });
  } catch (error) {
    console.error(error);
    errorMessage.value =
      error instanceof Error ? error.message : "Unable to start Stripe checkout. Please try again.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
code {
  font-family: "Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New",
    monospace;
}
</style>

