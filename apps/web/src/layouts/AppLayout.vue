<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 lg:flex">
    <SidebarNav class="hidden lg:flex" />

    <div class="flex min-h-screen flex-1 flex-col">
      <main class="flex-1 overflow-y-auto px-4 pb-20 pt-6 sm:px-6 lg:px-8 lg:pb-10">
        <RouterView />
      </main>
    </div>

    <BottomNav class="lg:hidden" />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import SidebarNav from "@/components/navigation/SidebarNav.vue";
import BottomNav from "@/components/navigation/BottomNav.vue";
</script>
