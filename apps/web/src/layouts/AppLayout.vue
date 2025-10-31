<template>
  <div class="min-h-screen bg-[#F8F9FA] text-[#1A1A1A]">
    <MinimalSidebar />
    <main class="min-h-screen pl-16 lg:pl-60">
      <div class="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:pb-10">
        <RouterView />
      </div>
    </main>
    <UniversalFab />
  </div>
  
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import MinimalSidebar from "@/components/navigation/MinimalSidebar.vue";
import UniversalFab from "@/components/navigation/UniversalFab.vue";
</script>
