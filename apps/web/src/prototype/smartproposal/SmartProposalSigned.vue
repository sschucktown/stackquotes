<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 lg:px-8">
    <div class="w-full max-w-xl rounded-2xl border border-emerald-100 bg-white px-6 py-8 text-center shadow-md">
      <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
        ✓
      </div>
      <h1 class="mt-4 text-2xl font-semibold text-slate-900">Thanks! Your contractor will confirm next steps.</h1>
      <p class="mt-2 text-sm text-slate-600">We saved your approval. Expect a follow-up to lock in scheduling.</p>
      <button
        class="mt-6 inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition-all duration-200 ease-out hover:-translate-y-[1px] hover:bg-slate-50"
        @click="router.push('/prototype/smartproposal/client')"
      >
        Return to proposal
      </button>
    </div>
  </main>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
