<template>
  <StackQuotesLanding
    :primary-cta="primaryCta"
    :founder-cta="founderCta"
    :demo-cta="demoCta"
    :hero-image="heroImage"
    hero-alt="Preview of a three-option StackQuotes proposal"
    :founder-image="founderImage"
    founder-alt="Portrait of the StackQuotes founder"
    :hero-stats="heroStats"
    :features="features"
    :pricing-preview="pricingPreviewPlans"
  />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from "vue";
import { useRouter } from "vue-router";
import type { RouteLocationRaw } from "vue-router";
import { FileText, Users, Zap } from "lucide-vue-next";
import StackQuotesLanding from "@/components/marketing/StackQuotesLanding.jsx";
import { useAuth } from "@/lib/auth";
import { useDemoStore } from "@/stores/demoStore";
import { trackEvent } from "@/lib/analytics";
import heroImage from "@/assets/marketing-demo-proposal.png";
import founderImage from "@/assets/marketing-founder.png";
import { startCheckout } from "@/lib/stripeCheckout";
import { STRIPE_PRICES } from "@/config/stripe";

const router = useRouter();
const { isAuthenticated, user, setStoredRedirect } = useAuth();
const demoStore = useDemoStore();

const authState = computed(() => ({
  authenticated: isAuthenticated.value,
  userId: user.value?.id ?? null,
}));

const heroStats = [
  {
    label: "Avg. Time to Send",
    value: "12 minutes",
    caption: "Start from the templated proposal library.",
  },
  {
    label: "Proposal Conversion",
    value: "3x higher",
    caption: "Upgrade-driven quotes win more premium work.",
  },
  {
    label: "Faster Payments",
    value: "Next-day ACH",
    caption: "Collect deposits instantly once a client accepts.",
  },
  {
    label: "Automated Follow-up",
    value: "Smart nudges",
    caption: "StackQuotes pings prospects so you do not have to.",
  },
];

const features = [
  {
    title: "Good / Better / Best in one click",
    description:
      "Spin up tiered proposals with branded upgrades and pricing pulled from your library. Switch on demo mode to explore today.",
    points: [
      "Send polished proposals with embedded video and financing nudges.",
      "Surface upsells automatically based on project type and trade.",
    ],
    icon: FileText,
  },
  {
    title: "Instant client approvals and deposits",
    description:
      "Clients approve, sign, and pay from any device. Secure payments move straight to scheduling crews.",
    points: [
      "ACH and card payments with automatic receipts and sync.",
      "Real-time acceptance notifications and pipeline updates.",
    ],
    icon: Zap,
  },
  {
    title: "Demo-ready SmartWorkspace",
    description:
      "See StackQuotes with sample data. Activate demo mode to walk through proposals, analytics, and follow-up sequences.",
    points: [
      "Dashboard seeded with proposal analytics for the Founding 50.",
      "Switch between live and demo in a click; no setup required.",
    ],
    icon: Users,
  },
];

const lastMeta = {
  title: "",
  description: "",
};

const landingTitle = "StackQuotes - Close More Jobs with 3-Option Quotes";
const landingDescription = "Send professional Good/Better/Best proposals in minutes and get paid instantly.";

const updateMeta = () => {
  if (typeof document === "undefined") return;
  lastMeta.title = document.title;
  document.title = landingTitle;
  const meta = document.querySelector('meta[name="description"]');
  lastMeta.description = meta?.getAttribute("content") ?? "";
  if (meta) {
    meta.setAttribute("content", landingDescription);
  } else {
    const description = document.createElement("meta");
    description.name = "description";
    description.content = landingDescription;
    document.head.appendChild(description);
  }
};

const restoreMeta = () => {
  if (typeof document === "undefined") return;
  if (lastMeta.title) {
    document.title = lastMeta.title;
  }
  const meta = document.querySelector('meta[name="description"]');
  if (meta) {
    meta.setAttribute("content", lastMeta.description ?? "");
  }
};

onMounted(updateMeta);
onBeforeUnmount(restoreMeta);

const pushWithDemo = async () => {
  demoStore.activate();
  await router.push({ name: "demo", query: { template: "deck" } });
};

const navigateOrReplace = async (location: RouteLocationRaw) => {
  try {
    await router.push(location);
  } catch {
    await router.replace(location);
  }
};

const baseTrackProps = computed(() => ({
  authenticated: authState.value.authenticated,
  user_id: authState.value.userId,
  source: "landing-hero",
}));

const handleDemoClick = async () => {
  trackEvent("cta_demo_click", { ...baseTrackProps.value, intent: "see-demo" });
  await pushWithDemo();
};

const handleFounderClick = async () => {
  const { authenticated } = authState.value;
  trackEvent("cta_founder_click", {
    ...baseTrackProps.value,
    intent: authenticated ? "go-dashboard" : "join-founding-50",
  });
  if (authenticated) {
    await navigateOrReplace({ name: "dashboard-home" });
    return;
  }
  setStoredRedirect("/dashboard");
  await navigateOrReplace({ path: "/register", query: { intent: "founding50" } });
};

const handlePrimaryClick = async () => {
  const { authenticated } = authState.value;
  trackEvent("cta_signup_click", {
    ...baseTrackProps.value,
    intent: authenticated ? "create-proposal" : "start-free",
  });
  if (authenticated) {
    demoStore.deactivate();
    await navigateOrReplace({ name: "quickquote-new" });
    return;
  }
  setStoredRedirect("/dashboard");
  await navigateOrReplace({ path: "/signup", query: { plan: "founder" } });
};
const handleUpgradeBuildClick = async () => {
  const { authenticated } = authState.value;
  trackEvent("cta_upgrade_click", {
    ...baseTrackProps.value,
    intent: authenticated ? "upgrade-build" : "signup-upgrade-build",
  });
  if (!authenticated) {
    setStoredRedirect("/pricing?plan=pro");
    await navigateOrReplace({ path: "/register", query: { plan: "pro" } });
    return;
  }
  try {
    await startCheckout(STRIPE_PRICES.PRO);
  } catch (error) {
    console.error("[landing] stripe checkout failed", error);
  }
};

const handleUpgradeProClick = async () => {
  const { authenticated } = authState.value;
  trackEvent("cta_upgrade_click", {
    ...baseTrackProps.value,
    intent: authenticated ? "upgrade-pro" : "signup-upgrade-pro",
  });
  if (!authenticated) {
    setStoredRedirect("/pricing?plan=team");
    await navigateOrReplace({ path: "/register", query: { plan: "team" } });
    return;
  }
  try {
    await startCheckout(STRIPE_PRICES.TEAM);
  } catch (error) {
    console.error("[landing] stripe checkout failed", error);
  }
};

const handleUpgradeClick = async () => {
  const { authenticated } = authState.value;
  trackEvent("cta_upgrade_click", {
    ...baseTrackProps.value,
    intent: authenticated ? "upgrade-pro" : "signup-upgrade",
  });
  if (!authenticated) {
    setStoredRedirect("/pricing?plan=pro");
    await navigateOrReplace({ path: "/register", query: { plan: "pro" } });
    return;
  }
  try {
    await startCheckout(STRIPE_PRICES.PRO);
  } catch (error) {
    console.error("[landing] stripe checkout failed", error);
  }
};

const demoCta = computed(() => ({
  label: "See a Demo",
  onClick: handleDemoClick,
}));

const founderCta = computed(() => ({
  label: authState.value.authenticated ? "Go to Dashboard" : "Join the Founding 50",
  tagline: authState.value.authenticated ? "Back to work" : "Limited beta spots",
  onClick: handleFounderClick,
}));

const primaryCta = computed(() => ({
  label: authState.value.authenticated ? "Create Proposal" : "Try Free — No Credit Card Needed",
  onClick: handlePrimaryClick,
}));

const pricingPreviewPlans = computed(() => [
  {
    id: "launch",
    label: "Launch",
    title: "Launch ? Free forever",
    description:
      "Spin up SmartProposals with demo data, send approvals, and collect PayLink deposits with a 3% platform fee.",
    ctaLabel: "Start Launch",
    onClick: handlePrimaryClick,
  },
  {
    id: "build",
    label: "Build",
    title: "Build ? $47.99/mo ? Unlock Good/Better/Best & automation",
    description:
      "Upgrade for premium proposal templates, ProfitPulse snapshots, smart upsells, and Stripe Connect payouts.",
    ctaLabel: "Upgrade to Build",
    onClick: handleUpgradeBuildClick,
  },
  {
    id: "pro",
    label: "Pro",
    title: "Pro ? $97.99/mo ? Advanced analytics and faster payouts",
    description:
      "Full ProfitPulse analytics, accelerated payouts, role-based workspaces, and white-labeled exports.",
    ctaLabel: "Upgrade to Pro",
    onClick: handleUpgradeProClick,
  },
  {
    id: "crew",
    label: "Crew",
    title: "Crew ? $147.99/mo ? Coming soon",
    description:
      "Multi-crew operations, accounting integrations, and dedicated success coaching are on the roadmap.",
    ctaLabel: "Coming soon",
    disabled: true,
  },
]);
</script>


