import { createRouter, createWebHistory } from "vue-router";
import { watch } from "vue";
import { useAuth } from "@/lib/auth";
import { useDemoStore } from "@/stores/demoStore";

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
      path: "/share/estimate/:token",
      name: "public-estimate-approval",
      component: () => import("@/pages/public/EstimateApprovalPage.vue"),
      props: true,
      meta: { public: true },
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
      path: "/",
      component: () => import("@/layouts/AppLayout.vue"),
      children: [
        {
          path: "",
          redirect: "/dashboard",
        },
        {
          path: "dashboard",
          name: "dashboard-home",
          component: () => import("@/pages/dashboard/DashboardHome.vue"),
        },
        {
          path: "quickquotes",
          name: "quickquote-dashboard",
          component: () => import("@/pages/quickquote/DashboardPage.vue"),
        },
        {
          path: "quickquotes/new",
          name: "quickquote-new",
          component: () => import("@/pages/quickquote/EstimateEditorPage.vue"),
          props: () => ({ id: "new" }),
        },
        {
          path: "quickquotes/:id",
          name: "quickquote-estimate",
          component: () => import("@/pages/quickquote/EstimateEditorPage.vue"),
          props: true,
        },
        {
          path: "smart-proposals",
          name: "smart-proposals",
          component: () => import("@/pages/smartproposals/SmartProposalsPage.vue"),
        },
        {
          path: "analytics",
          name: "analytics",
          component: () => import("@/pages/analytics/AnalyticsPage.vue"),
        },
        {
          path: "settings",
          name: "settings",
          component: () => import("@/pages/settings/SettingsPage.vue"),
        },
      ],
    },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuth();
  const demo = useDemoStore();
  await waitForAuth();
  const wantsDemo =
    (typeof to.query.demo === "string" && ["1", "true"].includes(to.query.demo.toLowerCase())) ||
    (Array.isArray(to.query.demo) && to.query.demo.some((value) => ["1", "true"].includes(value.toLowerCase())));

  if (wantsDemo && !demo.active) {
    demo.activate();
  }

  const isDemoActive = demo.active;

  if (isDemoActive && "demo" in to.query) {
    const { demo: _omit, ...rest } = to.query as Record<string, string | string[] | undefined>;
    return { path: to.path, query: rest, replace: true };
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
  if (to.meta.public && (auth.isAuthenticated.value || isDemoActive)) {
    const redirectTarget = auth.getStoredRedirect() ?? "/dashboard";
    auth.clearStoredRedirect();
    return { path: redirectTarget };
  }
  return true;
});

export default router;
