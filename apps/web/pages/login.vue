<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

// attach meta inside the same block
definePageMeta({
  layout: 'auth'
})

const email = ref('')
const auth = useAuthStore()

const sendLink = async () => {
  if (!email.value) return alert('Please enter an email')
  try {
    await auth.signIn(email.value)
    alert('✅ Magic link sent!')
  } catch (err) {
    console.error(err)
    alert('❌ Failed to send magic link')
  }
}
</script>

<template>
  <div class="w-full max-w-sm bg-white p-6 rounded shadow">
    <h2 class="font-bold text-xl mb-4">Login</h2>
    <input
      v-model="email"
      type="email"
      placeholder="Enter your email"
      class="w-full border p-2 mb-4 rounded"
    />
    <button @click="sendLink" class="btn w-full">
      Send Login Link
    </button>
  </div>
</template>
