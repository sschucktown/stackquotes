import { createRouter, createWebHistory } from "vue-router";
import type { LocationQueryRaw, LocationQueryValue } from "vue-router";
import { watch } from "vue";
import { useAuth } from "@/lib/auth";
import { useDemoStore } from "@/stores/demoStore";
import { useContractorProfileStore } from "@modules/contractor/stores/profileStore";

const waitForAuth = async () => {
  const { loading } = useAuth();
  if (!loading.value) return;
  await new Promise<void>((resolve) => {
    const stop = watch(loading, (ready) => {
      if (!ready) {
        stop();
        resolve();
      }
    });
  });
};

// Session flags to soften onboarding redirect behavior
const ONBOARDING_SKIP_KEY = "stackquotes:onboarding:skip";
const ONBOARDING_DONE_KEY = "stackquotes:onboarding:done";
const readFlag = (key: string): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const storages: (Storage | null)[] = [window.localStorage, window.sessionStorage];
    return storages.some((storage) => storage?.getItem(key) === "1");
  } catch {
    return false;
  }
};

const isOnboardingBypassed = (): boolean =>
  readFlag(ONBOARDING_SKIP_KEY) || readFlag(ONBOARDING_DONE_KEY);

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "landing",
      component: () => import("@/pages/marketing/StackQuotesProLandingPage.vue"),
      meta: { public: true, allowAuthenticated: false }
    },
    {
      path: "/pricing",
      name: "pricing",
      component: () => import("@/pages/pricing.vue"),
      meta: { public: true, allowAuthenticated: true },
    },
    {
      path: "/share/estimate/:token",
      name: "public-estimate-approval",
      component: () => import("@/pages/public/EstimateApprovalPage.vue"),
      props: true,
      meta: { public: true, allowAuthenticated: true },
    },
    {
      path: "/share/profile/:slug",
      name: "public-contractor-profile",
      component: () => import("@/pages/public/ContractorProfilePage.vue"),
      props: true,
      meta: { public: true, allowAuthenticated: true },
    },
    {
      path: "/proposal/:id",
      name: "public-proposal",
      component: () => import("@/pages/public/ClientProposalView.vue"),
      props: true,
      meta: { public: true, allowAuthenticated: true },
    },
    {
      path: "/app/prototypes/client-portal",
      redirect: "/prototype/client-portal",
    },
    {
      path: "/app/prototypes/quickquote",
      redirect: "/prototype/quickquote",
    },
    {
      path: "/app/prototypes/quickquote/builder",
      redirect: "/prototype/quickquote/builder",
    },
    {
      path: "/app/prototypes/quickquote-client-preview",
      redirect: "/prototype/quickquote-client-preview",
    },
    {
      path: "/app/prototypes/quickquote/templates",
      redirect: "/prototype/quickquote/templates",
    },
    {
      path: "/app/prototypes/hq",
      redirect: "/prototype/hq",
    },
    {
      path: "/app/prototypes/job-view",
      redirect: "/prototype/job-view",
    },
    {
      path: "/prototype/client-portal",
      name: "ClientProposalPrototypePublic",
      component: () => import("@/prototype/client-portal/ClientProposalPage.vue"),
      meta: { public: true, allowAuthenticated: true },
    },
    {
      path: "/prototype/quickquote",
      name: "QuickQuotePortalPrototypePublic",
      component: () => import("@/prototype/quickquote/QuickQuotePortal.vue"),
      meta: { public: true, allowAuthenticated: true },
    },
    {
      path: "/prototype/quickquote/templates",
      name: "QuickQuoteTemplateSelectorPrototypePublic",
      component: () => import("@/prototype/quickquote/JobTemplateSelector.vue"),
      meta: { public: true, allowAuthenticated: true },
    },
    {
      path: "/prototype/quickquote-client-preview",
      name: "QuickQuoteClientPreviewPrototypePublic",
      component: () => import("@/prototype/quickquote/QuickQuotePortal.vue"),
      meta: { public: true, allowAuthenticated: true },
    },
    {
      path: "/prototype/quickquote/builder",
      name: "QuickQuoteBuilderPrototypePublic",
      component: () => import("@/prototype/quickquote/QuickQuoteBuilder.vue"),
      meta: { public: true, allowAuthenticated: true },
    },
    {
      path: "/prototype/hq",
      name: "ContractorHQPrototypePublic",
      component: () => import("@/prototype/ContractorHQ.vue"),
      meta: { public: true, allowAuthenticated: true },
    },
    {
      path: "/prototype/job-view",
      name: "ContractorJobViewPrototypePublic",
      component: () => import("@/prototype/contractor/JobView.vue"),
      meta: { public: true, allowAuthenticated: true },
    },
    {
      path: "/prototype/contractor/timeline",
      name: "ContractorProjectTimelinePrototype",
      component: () => import("@/prototype/contractor/ProjectTimeline.vue"),
      meta: { public: true, allowAuthenticated: true },
    },
    {
      path: "/prototype/task",
      name: "ContractorTaskPagePrototype",
      component: () => import("@/prototype/task/TaskPage.vue"),
      meta: { public: true, allowAuthenticated: true },
    },
    {
      path: "/prototype/job/files",
      name: "ContractorJobFilesPrototype",
      component: () => import("@/prototype/job/FilesManager.vue"),
      meta: { public: true, allowAuthenticated: true },
    },
    {
      path: "/prototype/contractor/files",
      name: "ContractorFilesManagerPrototype",
      component: () => import("@/prototype/contractor/files/FilesManagerPage.vue"),
      meta: { public: true, allowAuthenticated: true },
    },
    {
      path: "/prototype/contractor/individual-job",
      name: "ContractorIndividualJobViewPrototype",
      component: () => import("@/prototype/contractor/IndividualJobView.vue"),
      meta: { public: true, allowAuthenticated: true },
    },
    {
      path: "/prototype/contractor/messaging",
      name: "ContractorMessagingInboxPrototype",
      component: () => import("@/prototype/contractor/MessagingInbox.vue"),
      meta: { public: true, allowAuthenticated: true },
    },
    {
      path: "/onboarding/upload",
      name: "OnboardingPrototypeUpload",
      component: () => import("@/pages/onboarding/upload.vue"),
      meta: { public: true, allowAuthenticated: true, skipOnboardingGuard: true },
    },
    {
      path: "/onboarding/processing",
      name: "OnboardingPrototypeProcessing",
      component: () => import("@/pages/onboarding/processing.vue"),
      meta: { public: true, allowAuthenticated: true, skipOnboardingGuard: true },
    },
    {
      path: "/onboarding/trade-detection",
      name: "OnboardingPrototypeTrade",
      component: () => import("@/pages/onboarding/trade.vue"),
      meta: { public: true, allowAuthenticated: true, skipOnboardingGuard: true },
    },
    {
      path: "/onboarding/profile-preview",
      name: "OnboardingPrototypeProfile",
      component: () => import("@/pages/onboarding/profile.vue"),
      meta: { public: true, allowAuthenticated: true, skipOnboardingGuard: true },
    },
    {
      path: "/onboarding/line-items",
      name: "OnboardingPrototypeLineItems",
      component: () => import("@/pages/onboarding/lineitems.vue"),
      meta: { public: true, allowAuthenticated: true, skipOnboardingGuard: true },
    },
    {
      path: "/onboarding/proposal-preview",
      name: "OnboardingPrototypeProposal",
      component: () => import("@/pages/onboarding/proposal.vue"),
      meta: { public: true, allowAuthenticated: true, skipOnboardingGuard: true },
    },
    {
      path: "/onboarding/client-portal-preview",
      name: "OnboardingPrototypeClientPreview",
      component: () => import("@/pages/onboarding/clientpreview.vue"),
      alias: ["/onboarding/clientpreview"],
      meta: { public: true, allowAuthenticated: true, skipOnboardingGuard: true },
    },
    {
      path: "/onboarding/first-client",
      name: "OnboardingPrototypeFirstClient",
      component: () => import("@/pages/onboarding/firstclient.vue"),
      meta: { public: true, allowAuthenticated: true, skipOnboardingGuard: true },
    },
    {
      path: "/onboarding/sent",
      name: "OnboardingPrototypeSent",
      component: () => import("@/pages/onboarding/sent.vue"),
      meta: { public: true, allowAuthenticated: true, skipOnboardingGuard: true },
    },
    {
      path: "/onboarding/dashboard",
      name: "OnboardingPrototypeDashboard",
      component: () => import("@/pages/dashboard/index.vue"),
      meta: { public: true, allowAuthenticated: true, skipOnboardingGuard: true },
    },
    {
      path: "/login",
      name: "login",
      component: () => import("@/pages/auth/LoginPage.vue"),
      meta: { public: true },
    },
    {
      path: "/register",
      name: "register",
      component: () => import("@/pages/auth/RegisterPage.vue"),
      meta: { public: true },
    },
    {
      path: "/signup",
      name: "signup",
      component: () => import("@/pages/auth/RegisterPage.vue"),
      meta: { public: true },
    },
    {
      path: "/demo",
      name: "demo",
      component: () => import("@/pages/marketing/DemoRedirectPage.vue"),
      meta: { public: true, allowAuthenticated: true },
    },
    {
      path: "/onboarding",
      name: "onboarding",
      component: () => import("@/pages/onboarding/OnboardingPage.vue"),
      meta: { public: false, skipOnboardingGuard: true },
    },
    {
      path: "/app",
      component: () => import("@/layouts/Layout.vue"),
      children: [
        {
          path: "",
          redirect: "/dashboard",
        },
        {
          path: "dashboard",
          alias: "/dashboard",
          name: "dashboard-home",
          component: () => import("@/pages/dashboard/Dashboard.vue"),
        },
        {
          path: "command-center-demo",
          alias: "/command-center-demo",
          name: "command-center-demo",
          component: () => import("@/pages/dashboard/CommandCenterDemo.vue"),
          meta: { public: false },
        },
        {
          path: "quickquotes",
          alias: "/quickquotes",
          name: "quickquote-dashboard",
          component: () => import("@/pages/quickquote/DashboardPage.vue"),
        },
        {
          path: "quickquotes/new",
          alias: "/quickquotes/new",
          name: "quickquote-new",
          component: () => import("@/pages/quickquote/QuickQuoteNewPage.vue"),
        },
        {
          path: "quickquotes/builder",
          alias: "/quickquotes/builder",
          name: "quickquote-builder",
          component: () => import("@/pages/quickquote/QuickQuotePage.vue"),
        },
        {
          path: "quickquotes/:id",
          alias: "/quickquotes/:id",
          name: "quickquote-estimate",
          component: () => import("@/pages/quickquote/EstimateEditorPage.vue"),
          props: true,
        },
        {
          path: "smart-proposals",
          alias: "/smart-proposals",
          name: "smart-proposals",
          component: () => import("@/pages/smartproposals/SmartProposalsPage.vue"),
        },
        {
          path: "prototypes/client-portal",
          name: "ClientProposalPrototype",
          component: () => import("@/prototype/client-portal/ClientProposalPage.vue"),
          meta: { public: true, allowAuthenticated: true },
        },
        {
          path: "proposals-v2",
          name: "ProposalsV2Dev",
          component: () => import("@/pages/smartproposals/SmartProposalsV2Page.vue"),
          meta: {
            requiresAuth: true,
          },
        },
        {
          path: "analytics",
          alias: "/analytics",
          name: "analytics",
          component: () => import("@/pages/analytics/AnalyticsPage.vue"),
        },
        {
          path: "payments",
          alias: ["/payments", "/settings/payments"],
          name: "payments",
          component: () => import("@/pages/payments/PaymentsPage.vue"),
        },
        {
          path: "help",
          alias: "/help",
          name: "help",
          component: () => import("@/pages/help/HelpPage.vue"),
        },
        {
          path: "settings",
          alias: "/settings",
          name: "settings",
          component: () => import("@/pages/settings/SettingsPage.vue"),
        },
      ],
    },
  ],
});

const demoFlagValues = new Set(["1", "true"]);

const isDemoFlag = (value: LocationQueryValue | null | undefined): boolean =>
  typeof value === "string" ? demoFlagValues.has(value.toLowerCase()) : false;

router.beforeEach(async (to) => {
  const auth = useAuth();
  const demo = useDemoStore();
  await waitForAuth();
  const demoQuery = to.query.demo;
  const wantsDemo = Array.isArray(demoQuery)
    ? demoQuery.some((value) => isDemoFlag(value ?? null))
    : isDemoFlag(demoQuery ?? null);

  if (wantsDemo && !demo.active) {
    demo.activate();
  }

  const isDemoActive = demo.active;

  if (isDemoActive && "demo" in to.query) {
    const nextQuery: LocationQueryRaw = { ...to.query, demo: undefined };
    return { path: to.path, query: nextQuery, replace: true };
  }

  if (!to.meta.public && !auth.isAuthenticated.value && !isDemoActive) {
    const redirectTarget = auth.sanitizeRedirect(to.fullPath);
    if (redirectTarget) {
      auth.setStoredRedirect(redirectTarget);
    } else {
      auth.clearStoredRedirect();
    }
    return { name: "login" };
  }
  if (
    to.meta.public &&
    !to.meta.allowAuthenticated &&
    (auth.isAuthenticated.value || isDemoActive)
  ) {
    const redirectTarget = auth.getStoredRedirect() ?? "/dashboard";
    auth.clearStoredRedirect();
    return { path: redirectTarget };
  }
  if (!to.meta.public && !to.meta.skipOnboardingGuard && auth.isAuthenticated.value && !isDemoActive) {
    const profileStore = useContractorProfileStore();
    if (!profileStore.profile && !profileStore.loading && !profileStore.error) {
      try {
        await profileStore.load();
      } catch (error) {
        console.error("[router] failed to load contractor profile", error);
      }
    }
    const hasTrade = Boolean(profileStore.profile?.trade ?? profileStore.profile?.tradeType);
    const hasProfile = Boolean(profileStore.profile);
    const hasError = Boolean(profileStore.error);
    const needsOnboarding = !profileStore.isDemo && !hasError && (!hasProfile || !hasTrade);
    const bypass = isOnboardingBypassed();
    if (needsOnboarding && !bypass && to.name !== "onboarding") {
      return { name: "onboarding", replace: true };
    }
    if ((!needsOnboarding || bypass) && to.name === "onboarding") {
      return { name: "dashboard-home", replace: true };
    }
  }
  return true;
});

export default router;

