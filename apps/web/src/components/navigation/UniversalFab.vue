<script setup lang="ts">
import { useRouter } from 'vue-router'
import { FilePlus2 } from 'lucide-vue-next'

const router = useRouter()
const goNewQuote = () => router.push({ name: 'quickquote-new' })
</script>

<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
    <button
      type="button"
      class="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl shadow-emerald-600/40 transition hover:scale-105 hover:bg-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white md:h-16 md:w-16"
      aria-label="New QuickQuote"
      @click="goNewQuote"
    >
      <FilePlus2 class="h-8 w-8" />
    </button>
  </div>
  
</template>

<style scoped>
</style>
