<template>
<div class="min-h-[60vh] grid place-items-center">
<div class="bg-white shadow rounded-xl p-8 w-full max-w-md">
<h1 class="text-2xl font-bold mb-4 text-header">Login</h1>
<p class="text-sm mb-4">Enter your email to receive a magic link.</p>
<form @submit.prevent="submit">
<input v-model="email" type="email" required placeholder="you@company.com" class="w-full border rounded-lg p-3 mb-4" />
<button class="btn w-full">Send magic link</button>
</form>
</div>
</div>
</template>
<script setup lang="ts">
const auth = useAuthStore()
const email = ref('')
const submit = async () => { await auth.signIn(email.value) }
</script>
