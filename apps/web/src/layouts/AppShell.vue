<template>
  <ResponsiveNav v-slot="{ isDesktop }">
    <div class="min-h-screen bg-slate-50 text-slate-900 lg:flex">
      <SidebarNav v-if="isDesktop" />

      <div class="relative flex min-h-screen flex-1 flex-col">
        <header
          v-if="isDesktop"
          class="flex items-center justify-end border-b border-slate-200 bg-white px-6 py-4 shadow-sm"
        >
          <QuickActionButton variant="inline" />
        </header>

        <main class="flex-1 overflow-y-auto pb-24 px-4 sm:px-6 lg:px-8">
          <RouterView />
        </main>

        <QuickActionButton
          v-if="!isDesktop"
          variant="floating"
          class="fixed bottom-20 left-1/2 z-30 -translate-x-1/2 sm:bottom-24"
        />
        <BottomNav
          v-if="!isDesktop"
          class="fixed bottom-0 left-0 right-0 z-20"
        />
      </div>
    </div>
  </ResponsiveNav>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import ResponsiveNav from "@/components/navigation/ResponsiveNav.vue";
import SidebarNav from "@/components/navigation/SidebarNav.vue";
import BottomNav from "@/components/navigation/BottomNav.vue";
import QuickActionButton from "@/components/navigation/QuickActionButton.vue";
</script>
