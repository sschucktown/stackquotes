<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})
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
    <button @click="sendLink" class="btn w-full">Send Login Link</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'

const email = ref('')
const auth = useAuthStore()

const sendLink = async () => {
  await auth.signIn(email.value)
  alert('Magic link sent!')
}
</script>
