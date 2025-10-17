<template>
  <ResponsiveNav v-slot="{ isDesktop, isWide }">
    <div class="flex min-h-screen flex-col bg-slate-50 text-slate-900 lg:flex-row">
      <SidebarNav v-if="isDesktop" :collapsed="!isWide" />

      <div class="flex min-h-screen flex-1 flex-col">
        <main class="flex-1 overflow-y-auto px-4 pb-20 pt-6 sm:px-6 lg:px-8 lg:pb-8">
          <RouterView />
        </main>

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
</script>
