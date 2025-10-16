<template>
  <div class="flex min-h-screen flex-col bg-slate-50 text-slate-900">
    <main class="flex-1 pb-20">
      <RouterView />
    </main>

    <QuickActionButton class="fixed bottom-20 left-1/2 z-30 -translate-x-1/2 sm:bottom-24" />
    <BottomNav class="fixed bottom-0 left-0 right-0 z-20" />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import BottomNav from "@/components/navigation/BottomNav.vue";
import QuickActionButton from "@/components/navigation/QuickActionButton.vue";
</script>
