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

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "landing",
      component: () => import("@/pages/marketing/StackQuotesLandingPage.vue"),
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
      component: () => import("@/layouts/AppLayout.vue"),
      children: [
        {
          path: "",
          redirect: "/dashboard",
        },
        {
          path: "dashboard",
          alias: "/dashboard",
          name: "dashboard-home",
          component: () => import("@/pages/dashboard/DashboardHome.vue"),
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
          component: () => import("@/pages/quickquote/EstimateEditorPage.vue"),
          props: () => ({ id: "new" }),
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
          path: "analytics",
          alias: "/analytics",
          name: "analytics",
          component: () => import("@/pages/analytics/AnalyticsPage.vue"),
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
    const needsOnboarding =
      !profileStore.isDemo && (!profileStore.profile || !profileStore.profile.trade);
    if (needsOnboarding && to.name !== "onboarding") {
      return { name: "onboarding", replace: true };
    }
    if (!needsOnboarding && to.name === "onboarding") {
      return { name: "dashboard-home", replace: true };
    }
  }
  return true;
});

export default router;
