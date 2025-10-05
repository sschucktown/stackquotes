<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-100 px-4">
    <div class="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
      <h1 class="text-2xl font-bold text-slate-900">Sign in to QuickQuote</h1>
      <p class="mt-2 text-sm text-slate-500">Access your estimates and clients.</p>

      <form class="mt-6 space-y-4" @submit.prevent="submit">
        <SQInput v-model="email" type="email" label="Email" required />
        <SQInput v-model="password" type="password" label="Password" required />
        <SQButton type="submit" class="w-full" :loading="loading">Sign In</SQButton>
      </form>

      <p v-if="error" class="mt-3 text-sm text-red-500">{{ error }}</p>

      <p class="mt-6 text-center text-sm text-slate-500">
        Don't have an account?
        <RouterLink class="text-sq-primary" to="/register">Create one</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "@/lib/auth";

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);
const router = useRouter();
const route = useRoute();
const { signIn } = useAuth();

const submit = async () => {
  loading.value = true;
  error.value = "";
  const { error: signInError } = await signIn(email.value, password.value);
  loading.value = false;
  if (signInError) {
    error.value = signInError.message;
    return;
  }
  const redirect = (route.query.redirect as string) ?? "/quickquote";
  router.push(redirect);
};
</script>
