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

      <p v-if="error" class="mt-3 text-sm text-red-500">{{ error }}</p>

      <p class="mt-6 text-center text-sm text-slate-500">
        Already have an account?
        <RouterLink class="text-sq-primary" to="/login">Sign in</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/lib/auth";

const email = ref("");
const password = ref("");
const confirm = ref("");
const error = ref("");
const loading = ref(false);
const router = useRouter();
const { signUp } = useAuth();

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
  router.push("/quickquote");
};
</script>
