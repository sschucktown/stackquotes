<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, FilePlus2, CreditCard, UserPlus } from 'lucide-vue-next'

const router = useRouter()
const open = ref(false)

const toggle = () => { open.value = !open.value }
const goNewQuote = () => router.push({ name: 'quickquote-new' })
const goCollectPayment = () => router.push({ name: 'payments-new' })
const goAddClient = () => router.push({ name: 'clients-new' })
</script>

<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
    <transition name="fab-reveal">
      <div v-if="open" class="mb-2 flex flex-col items-end gap-2">
        <button type="button" class="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow ring-1 ring-black/5 hover:bg-slate-50" @click="goNewQuote">
          <FilePlus2 class="h-4 w-4" /> New Quote
        </button>
        <button type="button" class="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow ring-1 ring-black/5 hover:bg-slate-50" @click="goCollectPayment">
          <CreditCard class="h-4 w-4" /> Collect Payment
        </button>
        <button type="button" class="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-medium text-slate-900 shadow ring-1 ring-black/5 hover:bg-slate-50" @click="goAddClient">
          <UserPlus class="h-4 w-4" /> Add Client
        </button>
      </div>
    </transition>
    <button
      type="button"
      class="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xl shadow-emerald-600/40 transition hover:scale-105 hover:bg-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white md:h-16 md:w-16"
      aria-label="Actions"
      @click="toggle"
    >
      <Plus class="h-8 w-8" />
    </button>
  </div>
  
</template>

<style scoped>
.fab-reveal-enter-active,.fab-reveal-leave-active{ transition: all 120ms ease }
.fab-reveal-enter-from,.fab-reveal-leave-to{ opacity:0; transform: translateY(6px) }
</style>
