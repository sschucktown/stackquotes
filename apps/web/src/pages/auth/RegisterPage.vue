<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-100 px-4">
    <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
      <h1 class="text-2xl font-bold text-slate-900">Create your StackQuotes account</h1>
      <p class="mt-2 text-sm text-slate-500">Start building estimates in minutes.</p>

      <form class="mt-6 space-y-4" @submit.prevent="submit">
        <SQInput v-model="email" type="email" label="Email" required />
        <SQInput v-model="password" type="password" label="Password" required />
        <SQInput v-model="confirm" type="password" label="Confirm Password" required />
        <SQButton type="submit" class="w-full" :loading="loading">Create Account</SQButton>
      </form>

      <div class="mt-6">
        <div class="flex items-center gap-3">
          <span class="h-px w-full bg-slate-200" />
          <span class="text-xs font-semibold uppercase tracking-wide text-slate-400">or</span>
          <span class="h-px w-full bg-slate-200" />
        </div>
        <SQButton
          type="button"
          variant="secondary"
          class="mt-4 w-full"
          :loading="googleLoading"
          @click="handleGoogleSignIn"
        >
          <span class="flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="h-5 w-5"><path fill="#EA4335" d="M24 9.5c3.54 0 6 1.54 7.38 2.83l5.42-5.42C33.64 3.91 29.3 2 24 2 14.64 2 6.73 7.44 3.24 15.26l6.79 5.27C11.5 13.91 17.21 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.72-.15-3.38-.44-5H24v9.5h12.7c-.55 2.83-2.23 5.23-4.76 6.84l7.35 5.69C43.83 37.75 46.5 31.63 46.5 24.5z"/><path fill="#FBBC05" d="M10.03 28.01a14.5 14.5 0 0 1 0-8.02L3.24 14.72a22.475 22.475 0 0 0 0 18.56l6.79-5.27z"/><path fill="#34A853" d="M24 45c5.85 0 10.77-1.94 14.36-5.26l-7.35-5.69c-2.04 1.37-4.66 2.2-7.01 2.2-6.79 0-12.5-4.41-14.51-10.49l-6.79 5.27C6.73 40.56 14.64 46 24 46z"/></svg>
            <span>Create with Google</span>
          </span>
        </SQButton>
      </div>

      <p v-if="error" class="mt-3 text-sm text-red-500">{{ error }}</p>

      <p class="mt-6 text-center text-sm text-slate-500">
        Already have an account?
        <RouterLink class="text-sq-primary" to="/login">Sign in</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "@/lib/auth";

const email = ref("");
const password = ref("");
const confirm = ref("");
const error = ref("");
const loading = ref(false);
const googleLoading = ref(false);
const router = useRouter();
const route = useRoute();
const {
  signUp,
  signInWithGoogle,
  sanitizeRedirect,
  getStoredRedirect,
  setStoredRedirect,
  clearStoredRedirect,
} = useAuth();

const getRedirectFromQuery = (): string | undefined => {
  const raw = route.query.redirect;
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) return raw[0];
  return undefined;
};

onMounted(() => {
  const requestedRedirect = getRedirectFromQuery();
  const safeRedirect = sanitizeRedirect(requestedRedirect);
  if (safeRedirect) {
    setStoredRedirect(safeRedirect);
  } else if (requestedRedirect) {
    const sanitizedQuery = { ...route.query } as Record<string, unknown>;
    delete sanitizedQuery.redirect;
    router.replace({ query: sanitizedQuery });
    clearStoredRedirect();
  }
});

const submit = async () => {
  if (password.value !== confirm.value) {
    error.value = "Passwords do not match";
    return;
  }
  loading.value = true;
  error.value = "";
  const { error: signUpError } = await signUp(email.value, password.value);
  loading.value = false;
  if (signUpError) {
    error.value = signUpError.message;
    return;
  }
  const redirect = getStoredRedirect() ?? "/quickquote";
  clearStoredRedirect();
  router.push(redirect);
};

const handleGoogleSignIn = async () => {
  googleLoading.value = true;
  error.value = "";
  try {
    const requestedRedirect = getRedirectFromQuery();
    const redirectPath = sanitizeRedirect(requestedRedirect) ?? getStoredRedirect() ?? "/quickquote";
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
</script>
