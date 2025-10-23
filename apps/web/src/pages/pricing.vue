<template>
  <div class="min-h-screen bg-slate-950 text-white">
    <div class="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16 lg:py-24">
      <header class="text-center">
        <p class="text-sm uppercase tracking-[0.3em] text-emerald-300/80">StackQuotes Billing</p>
        <h1 class="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Stripe-powered plans for growing contractor teams
        </h1>
        <p class="mt-5 text-base text-white/70 sm:text-lg">
          Every plan includes SmartProposal, PayLink deposits, ProfitPulse reporting previews, and ScopeForge beta milestones.
          Upgrade or downgrade anytime—billing is handled through secure Stripe Checkout.
        </p>
      </header>

      <div class="grid gap-8 md:grid-cols-3">
        <article
          v-for="plan in plans"
          :key="plan.id"
          :class="[
            'flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-emerald-500/0 transition',
            plan.id === featuredPlan ? 'border-emerald-400/70 bg-emerald-500/5 shadow-emerald-500/30' : 'hover:border-emerald-400/40',
          ]"
        >
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <h2 class="text-2xl font-semibold">{{ plan.name }}</h2>
              <span v-if="plan.id === featuredPlan" class="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase text-emerald-200">
                Most popular
              </span>
            </div>
            <p class="text-sm text-white/70">{{ plan.tagline }}</p>
            <div class="mt-6 flex items-baseline gap-1">
              <span class="text-4xl font-bold tracking-tight">${{ plan.price }}</span>
              <span class="text-sm text-white/60">/month</span>
            </div>
          </div>

          <ul class="mt-6 flex-1 space-y-3 text-sm text-white/80">
            <li v-for="feature in plan.features" :key="feature" class="flex items-start gap-3">
              <span class="mt-1 h-2 w-2 rounded-full bg-emerald-400"></span>
              <span>{{ feature }}</span>
            </li>
          </ul>

          <div class="mt-8">
            <button
              type="button"
              class="w-full rounded-xl bg-emerald-500 px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="loadingPlan === plan.id"
              @click="startTrial(plan)"
            >
              <span v-if="loadingPlan === plan.id">Redirecting to Stripe…</span>
              <span v-else>Start Free Trial</span>
            </button>
            <p v-if="activeErrorPlan === plan.id && errorMessage" class="mt-3 text-sm text-red-400">
              {{ errorMessage }}
            </p>
            <p v-else class="mt-3 text-xs text-white/60">
              14-day trial • Cancel anytime via Stripe Customer Portal.
            </p>
          </div>
        </article>
      </div>

      <footer class="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
        <p>
          Stripe test mode is active in local development. Use card
          <code class="rounded bg-white/10 px-2 py-0.5 text-xs text-white/85">4242 4242 4242 4242</code>
          with any future expiration and CVC to simulate payments. Supabase records are updated after the webhook acknowledgement.
        </p>
        <p class="mt-4">
          Contractor payouts run through Stripe Connect Express accounts. Platform fees are applied automatically (3%) for PayLink deposits.
        </p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/http";

type PlanTier = "starter" | "pro" | "team";

interface Plan {
  id: PlanTier;
  name: string;
  price: number;
  tagline: string;
  features: string[];
}

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 49,
    tagline: "Solo contractors activating SmartProposal workflows.",
    features: [
      "SmartProposal editor + client approvals",
      "PayLink deposits with 3% platform fee",
      "ProfitPulse snapshots (beta)",
      "ScopeForge template library preview",
      "Email analytics & proposal tracking",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 99,
    tagline: "Growing teams automating payments and reporting.",
    features: [
      "Everything in Starter",
      "Unlimited SmartProposal variants & add-ons",
      "PayLink Smart change orders & upsells",
      "ProfitPulse performance dashboards",
      "ScopeForge milestone scheduling (beta)",
      "Stripe Connect payouts with ledger sync",
    ],
  },
  {
    id: "team",
    name: "Team",
    price: 149,
    tagline: "Multi-crew operations scaling proposals & payouts.",
    features: [
      "Everything in Pro",
      "Team workspaces & role-based access",
      "Advanced ScopeForge workflows & templates",
      "Priority payouts & cash-flow insights",
      "Dedicated success manager & roadmap previews",
    ],
  },
];

const auth = useAuth();
const router = useRouter();
const route = useRoute();

const loadingPlan = ref<PlanTier | null>(null);
const activeErrorPlan = ref<PlanTier | null>(null);
const errorMessage = ref<string | null>(null);
const featuredPlan = ref<PlanTier>("pro");

watch(
  () => route.query.plan,
  (value) => {
    if (typeof value === "string" && (value === "starter" || value === "pro" || value === "team")) {
      featuredPlan.value = value as PlanTier;
    }
  },
  { immediate: true }
);

const startTrial = async (plan: Plan) => {
  errorMessage.value = null;
  activeErrorPlan.value = null;

  if (!auth.isAuthenticated.value) {
    auth.setStoredRedirect(`/pricing?plan=${plan.id}`);
    await router.push({ name: "register", query: { plan: plan.id } });
    return;
  }

  loadingPlan.value = plan.id;
  const response = await apiFetch<{ url: string; id: string }>("/stripe/create-checkout-session", {
    method: "POST",
    body: JSON.stringify({ plan_tier: plan.id }),
  });
  loadingPlan.value = null;

  if (response.error || !response.data?.url) {
    activeErrorPlan.value = plan.id;
    errorMessage.value = response.error ?? "Unable to start Stripe checkout. Please try again.";
    return;
  }

  window.location.href = response.data.url;
};
</script>

<style scoped>
code {
  font-family: "Fira Code", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}
</style>
