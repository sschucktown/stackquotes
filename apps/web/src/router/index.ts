import { createRouter, createWebHistory } from "vue-router";
import { watch } from "vue";
import { useAuth } from "@/lib/auth";

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
      component: () => import("@/layouts/AppShell.vue"),
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
          path: "proposals",
          name: "proposals",
          component: () => import("@/pages/proposals/ProposalsPage.vue"),
        },
        {
          path: "clients",
          name: "clients",
          component: () => import("@/pages/clients/ClientsPage.vue"),
        },
        {
          path: "materials",
          name: "materials",
          component: () => import("@/pages/materials/MaterialsPage.vue"),
        },
        {
          path: "settings",
          name: "settings",
          component: () => import("@/pages/settings/SettingsPage.vue"),
        },
        {
          path: "quickquote",
          name: "quickquote-dashboard",
          component: () => import("@/pages/quickquote/DashboardPage.vue"),
        },
        {
          path: "quickquotes",
          redirect: { name: "quickquote-dashboard" },
        },
        {
          path: "quickquote/new",
          name: "quickquote-new",
          component: () => import("@/pages/quickquote/EstimateEditorPage.vue"),
          props: () => ({ id: "new" }),
        },
        {
          path: "quickquote/estimates/:id",
          name: "quickquote-estimate",
          component: () => import("@/pages/quickquote/EstimateEditorPage.vue"),
          props: true,
        },
      ],
    },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuth();
  await waitForAuth();
  if (!to.meta.public && !auth.isAuthenticated.value) {
    const redirectTarget = auth.sanitizeRedirect(to.fullPath);
    if (redirectTarget) {
      auth.setStoredRedirect(redirectTarget);
    } else {
      auth.clearStoredRedirect();
    }
    return { name: "login" };
  }
  if (to.meta.public && auth.isAuthenticated.value) {
    const redirectTarget = auth.getStoredRedirect() ?? "/dashboard";
    auth.clearStoredRedirect();
    return { path: redirectTarget };
  }
  return true;
});

export default router;
