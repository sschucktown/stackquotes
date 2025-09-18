<template>
<div>
<header class="bg-header text-white">
<nav class="mx-auto max-w-6xl flex items-center justify-between p-4">
<NuxtLink to="/dashboard" class="font-semibold">StackQuotes</NuxtLink>
<div class="flex items-center gap-4">
<NuxtLink to="/dashboard" class="hover:underline">Dashboard</NuxtLink>
<button class="btn" @click="signOut">Sign out</button>
</div>
</nav>
</header>
<main class="mx-auto max-w-6xl p-4">
<NuxtPage />
</main>
</div>
</template>
<script setup lang="ts">
const auth = useAuthStore()
const signOut = () => auth.signOut().then(() => navigateTo('/login'))
</script>
