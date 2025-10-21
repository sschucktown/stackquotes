<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-32 text-white">
    <div class="space-y-3 text-center">
      <p class="text-xs font-semibold uppercase tracking-[0.4em] text-cyan-200/70">Demo Mode</p>
      <h1 class="text-2xl font-semibold">Loading the StackQuotes workspace…</h1>
      <p class="text-sm text-slate-300/90">We&apos;re activating demo data so you can explore proposals instantly.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useDemoStore } from "@/stores/demoStore";

const route = useRoute();
const router = useRouter();
const demoStore = useDemoStore();

onMounted(async () => {
  demoStore.activate();
  const templateParam = typeof route.query.template === "string" ? route.query.template : Array.isArray(route.query.template) ? route.query.template[0] : undefined;
  const query = {
    ...(templateParam ? { template: templateParam } : { template: "deck" }),
  };
  await router.replace({ name: "quickquote-dashboard", query });
});
</script>
