<script setup lang="ts">
const connection = await useSupabaseConnection()
</script>

<template>
  <div class="p-6">
    <h2 class="font-bold text-xl">Supabase Connection Test</h2>
    <p>URL: {{ connection.url }}</p>
    <p v-if="connection.hasError" class="text-red-500">❌ Error: {{ connection.errorMessage }}</p>
    <p v-else class="text-green-600">✅ Connected! Test Data: {{ connection.testData }}</p>
  </div>
</template>
