<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

const email = ref('')
const loading = ref(false)
const message = ref<string | null>(null)
const error = ref<string | null>(null)

const auth = useAuthStore()

const signIn = async () => {
  loading.value = true
  message.value = null
  error.value = null
  try {
    await auth.signIn(email.value)
    message.value = 'Check your email for a login link.'
  } catch (err: any) {
    console.error('Login error:', err)
    error.value = err.message || 'Failed to send login link'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-md mx-auto mt-12 p-6 border rounded shadow">
    <h1 class="text-xl font-bold mb-4">Login</h1>

    <input
      v-model="email"
      type="email"
      placeholder="Enter your email"
      class="w-full border px-3 py-2 mb-4 rounded"
    />

    <button
      @click="signIn"
      :disabled="loading"
      class="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
    >
      {{ loading ? 'Sending...' : 'Send Login Link' }}
    </button>

    <p v-if="message" class="text-green-600 mt-4">{{ message }}</p>
    <p v-if="error" class="text-red-600 mt-4">{{ error }}</p>
  </div>
</template>
