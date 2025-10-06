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
      path: "/",
      redirect: "/quickquote",
    },
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
      path: "/quickquote",
      name: "quickquote-dashboard",
      component: () => import("@/pages/quickquote/DashboardPage.vue"),
    },
    {
      path: "/quickquote/estimates/:id",
      name: "quickquote-estimate",
      component: () => import("@/pages/quickquote/EstimateEditorPage.vue"),
      props: true,
    },
  ],
});

router.beforeEach(async (to) => {
  const auth = useAuth();
  await waitForAuth();
  if (!to.meta.public && !auth.isAuthenticated.value) {
    return { name: "login", query: { redirect: to.fullPath } };
  }
  if (to.meta.public && auth.isAuthenticated.value) {
    return { path: "/quickquote" };
  }
  return true;
});

export default router;
