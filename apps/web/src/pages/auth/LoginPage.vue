<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-white px-4 py-10">
    <div class="flex min-h-[calc(100vh-5rem)] items-center justify-center">
      <Transition name="fade">
        <div
          class="w-full max-w-md rounded-2xl border border-white/50 bg-white/70 p-8 shadow-xl backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl"
        >
          <div class="flex flex-col items-center text-center">
            <img
              src="@/assets/logo/stackquotes-logo.svg"
              alt="StackQuotes logo"
              class="h-12 w-12 rounded-md border border-white/60 bg-white/80 p-2 shadow-sm"
            />
            <h1 class="mt-4 text-2xl font-semibold text-slate-900">Welcome back</h1>
            <p class="mt-2 text-sm text-slate-600">Sign in to QuickQuote Contractor OS</p>
          </div>

          <form class="mt-8 space-y-4" @submit.prevent="submit">
            <SQInput v-model="email" type="email" label="Email" required />
            <SQInput v-model="password" type="password" label="Password" required />
            <SQButton
              type="submit"
              class="w-full transform !bg-[#3A7D99] !text-white transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:!bg-[#4f8faa] focus-visible:ring-[#3A7D99]/60"
              :loading="loading"
            >
              Sign In
            </SQButton>
          </form>

          <p class="mt-4 text-center text-sm text-slate-500">Close jobs faster with polished proposals.</p>

          <div class="mt-6">
            <div class="flex items-center gap-3 text-slate-400">
              <span class="h-px w-full bg-slate-200" />
              <span class="text-xs font-semibold uppercase tracking-wide">or</span>
              <span class="h-px w-full bg-slate-200" />
            </div>
            <SQButton
              type="button"
              variant="secondary"
              class="mt-4 w-full gap-3 transform transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-sm"
              :loading="googleLoading"
              @click="handleGoogleSignIn"
            >
              <span class="flex items-center justify-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="h-5 w-5">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6 1.54 7.38 2.83l5.42-5.42C33.64 3.91 29.3 2 24 2 14.64 2 6.73 7.44 3.24 15.26l6.79 5.27C11.5 13.91 17.21 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.5 24.5c0-1.72-.15-3.38-.44-5H24v9.5h12.7c-.55 2.83-2.23 5.23-4.76 6.84l7.35 5.69C43.83 37.75 46.5 31.63 46.5 24.5z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.03 28.01a14.5 14.5 0 0 1 0-8.02L3.24 14.72a22.475 22.475 0 0 0 0 18.56l6.79-5.27z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 45c5.85 0 10.77-1.94 14.36-5.26l-7.35-5.69c-2.04 1.37-4.66 2.2-7.01 2.2-6.79 0-12.5-4.41-14.51-10.49l-6.79 5.27C6.73 40.56 14.64 46 24 46z"
                  />
                </svg>
                <span>Continue with Google</span>
              </span>
            </SQButton>
            <SQButton
              type="button"
              variant="ghost"
              class="mt-3 w-full transform text-slate-600 transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:bg-slate-50"
              @click="startDemo"
            >
              Tour the product (demo mode)
            </SQButton>
          </div>

          <transition name="fade">
            <p v-if="error" class="mt-3 text-center text-sm text-rose-500">{{ error }}</p>
          </transition>

          <p class="mt-6 text-center text-xs text-slate-400">
            By signing in, you agree to our
            <a class="font-medium text-[#3A7D99] hover:underline" href="https://stackquotes.com/terms" target="_blank" rel="noreferrer"
              >Terms</a
            >
            and
            <a class="font-medium text-[#3A7D99] hover:underline" href="https://stackquotes.com/privacy" target="_blank" rel="noreferrer"
              >Privacy Policy</a
            >.
          </p>

          <p class="mt-4 text-center text-sm text-slate-600">
            Don&apos;t have an account?
            <RouterLink class="font-medium text-[#3A7D99] hover:underline" to="/register">Create one</RouterLink>
          </p>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import type { LocationQueryRaw, LocationQueryValue } from "vue-router";
import { useAuth } from "@/lib/auth";
import { useDemoStore } from "@/stores/demoStore";

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);
const googleLoading = ref(false);
const router = useRouter();
const route = useRoute();
const {
  signIn,
  signInWithGoogle,
  sanitizeRedirect,
  getStoredRedirect,
  setStoredRedirect,
  clearStoredRedirect,
  defaultRedirect,
} = useAuth();
const demoStore = useDemoStore();

const firstQueryString = (value: LocationQueryValue | LocationQueryValue[] | undefined): string | undefined => {
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    const match = value.find((entry): entry is string => typeof entry === "string");
    return match;
  }
  return undefined;
};

const getRedirectFromQuery = (): string | undefined => firstQueryString(route.query.redirect);

onMounted(() => {
  const requestedRedirect = getRedirectFromQuery();
  const safeRedirect = sanitizeRedirect(requestedRedirect);
  if (safeRedirect) {
    setStoredRedirect(safeRedirect);
  } else if (requestedRedirect) {
    const sanitizedQuery: LocationQueryRaw = { ...route.query, redirect: undefined };
    router.replace({ query: sanitizedQuery });
    clearStoredRedirect();
  }
});

const submit = async () => {
  loading.value = true;
  error.value = "";
  const { error: signInError } = await signIn(email.value, password.value);
  loading.value = false;
  if (signInError) {
    error.value = signInError.message;
    return;
  }
  demoStore.deactivate();
  const redirect =
    getStoredRedirect() ?? sanitizeRedirect(getRedirectFromQuery()) ?? defaultRedirect;
  clearStoredRedirect();
  router.push(redirect);
};

const handleGoogleSignIn = async () => {
  googleLoading.value = true;
  error.value = "";
  try {
    demoStore.deactivate();
    const requestedRedirect = getRedirectFromQuery();
    const redirectPath =
      sanitizeRedirect(requestedRedirect) ?? getStoredRedirect() ?? defaultRedirect;
    setStoredRedirect(redirectPath);
    const { error: oauthError } = await signInWithGoogle(redirectPath);
    if (oauthError) {
      error.value = oauthError.message;
      googleLoading.value = false;
    }
  } catch (err) {
    error.value = (err as Error).message;
    googleLoading.value = false;
  }
};

const startDemo = () => {
  demoStore.activate();
  router.push({ name: "quickquote-dashboard", query: { demo: "1" } });
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
