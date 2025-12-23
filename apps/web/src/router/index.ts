import { createRouter, createWebHistory } from "vue-router";
import type { LocationQueryRaw, LocationQueryValue } from "vue-router";
import { watch } from "vue";
import { useAuth } from "@/lib/auth";
import { useDemoStore } from "@/stores/demoStore";
import { useContractorProfileStore } from "@modules/contractor/stores/profileStore";

/* --------------------------------------------------
   Auth wait helper
-------------------------------------------------- */

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

/* --------------------------------------------------
   Onboarding flags
-------------------------------------------------- */

const ONBOARDING_SKIP_KEY = "stackquotes:onboarding:skip";
const ONBOARDING_DONE_KEY = "stackquotes:onboarding:done";

const readFlag = (key: string): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const storages: (Storage | null)[] = [
      window.localStorage,
      window.sessionStorage,
    ];
    return storages.some((storage) => storage?.getItem(key) === "1");
  } catch {
    return false;
  }
};

const isOnboardingBypassed = (): boolean =>
  readFlag(ONBOARDING_SKIP_KEY) || readFlag(ONBOARDING_DONE_KEY);

/* --------------------------------------------------
   Router
-------------------------------------------------- */

const router = createRouter({
  history: createWebHistory(),
  routes: [
    /* -----------------------------
       MARKETING / PUBLIC
    ------------------------------ */

    {
      path: "/",
      name: "landing",
      component: () =>
        import("@/pages/marketing/StackQuotesProLandingPage.vue"),
      meta: { public: true, allowAuthenticated: false },
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
      path: "/proposal/:token",
      name: "public-proposal",
      component: () => import("@/pages/public/ClientProposalView.vue"),
      props: true,
      meta: { public: true, allowAuthenticated: true },
    },

    /* ✅ FIXED LOCATION — SUCCESS PAGE */
    {
      path: "/proposal/:token/success",
      name: "proposal-success",
      component: () => import("@/pages/public/ProposalSuccessView.vue"),
      props: true,
      meta: { public: true, allowAuthenticated: true },
    },

    /* -----------------------------
       AUTH
    ------------------------------ */

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

    /* -----------------------------
       APP (AUTHENTICATED)
    ------------------------------ */

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
          path: "payments",
          alias: ["/payments", "/settings/payments"],
          name: "payments",
          component: () => import("@/pages/payments/PaymentsPage.vue"),
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

/* --------------------------------------------------
   Guards
-------------------------------------------------- */

const demoFlagValues = new Set(["1", "true"]);

const isDemoFlag = (value: LocationQueryValue | null | undefined): boolean =>
  typeof value === "string"
    ? demoFlagValues.has(value.toLowerCase())
    : false;

router.beforeEach(async (to) => {
  const auth = useAuth();
  const demo = useDemoStore();

  await waitForAuth();

  const demoQuery = to.query.demo;
  const wantsDemo = Array.isArray(demoQuery)
    ? demoQuery.some((value) => isDemoFlag(value))
    : isDemoFlag(demoQuery);

  if (wantsDemo && !demo.active) demo.activate();

  const isDemoActive = demo.active;

  if (!to.meta.public && !auth.isAuthenticated.value && !isDemoActive) {
    return { name: "login" };
  }

  if (
    to.meta.public &&
    !to.meta.allowAuthenticated &&
    (auth.isAuthenticated.value || isDemoActive)
  ) {
    return { path: "/dashboard" };
  }

  if (!to.meta.public && auth.isAuthenticated.value && !isDemoActive) {
    const profileStore = useContractorProfileStore();
    if (!profileStore.profile && !profileStore.loading) {
      await profileStore.load().catch(() => {});
    }

    const needsOnboarding =
      !profileStore.profile && !isOnboardingBypassed();

    if (needsOnboarding && to.name !== "onboarding") {
      return { name: "onboarding" };
    }
  }

  return true;
});

export default router;
