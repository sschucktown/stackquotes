<template>
  <div class="min-h-screen bg-[#F8F9FA] text-[#1A1A1A]">
    <div v-if="loading" class="flex min-h-screen items-center justify-center">
      <div class="text-sm text-slate-500">Loading your workspace…</div>
    </div>
    <RouterView v-else />
  </div>
</template>

<script setup lang="ts">
import { useAuth } from "@/lib/auth";

const { loading } = useAuth();
</script>
