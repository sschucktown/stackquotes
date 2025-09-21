<script setup lang="ts">
import { ref } from 'vue'
import { supabase, loginWithGoogle } from '~/composables/useSupabase'

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref<string | null>(null)

const handleEmailAuth = async () => {
  loading.value = true
  errorMessage.value = null
  try {
    if (isLogin.value) {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value,
      })
      if (error) throw error
    } else {
      const { error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
      })
      if (error) throw error
    }
  } catch (err: any) {
    errorMessage.value = err.message
  } finally {
    loading.value = false
  }
}

const handleGoogleLogin = async () => {
  try {
    await loginWithGoogle()
  } catch (err) {
    console.error('Google login failed:', err)
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <h1 class="text-2xl font-bold mb-6 text-center">
        {{ isLogin ? 'Sign In' : 'Sign Up' }}
      </h1>

      <form @submit.prevent="handleEmailAuth" class="space-y-4">
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          class="w-full border rounded px-3 py-2"
        />
        <input
          v-model="password"
          type="password"
          placeholder="Password"
          class="w-full border rounded px-3 py-2"
        />

        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
          :disabled="loading"
        >
          {{ isLogin ? 'Sign In' : 'Sign Up' }}
        </button>

        <div v-if="errorMessage" class="text-red-600 text-sm">
          {{ errorMessage }}
        </div>
      </form>

      <div class="my-4 text-center text-gray-500">or</div>

      <button
        @click="handleGoogleLogin"
        class="w-full bg-red-600 text-white py-2 rounded"
      >
        Continue with Google
      </button>

      <p class="mt-6 text-center text-sm">
        <span>{{ isLogin ? "Don't have an account?" : "Already have an account?" }}</span>
        <button
          type="button"
          @click="isLogin = !isLogin"
          class="text-blue-600 underline ml-1"
        >
          {{ isLogin ? 'Sign Up' : 'Sign In' }}
        </button>
      </p>
    </div>
  </div>
</template>
