<template>
  <button
    type="button"
    class="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl shadow-blue-500/40 transition hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
    @click="openQuickQuote"
  >
    <PlusIcon class="h-7 w-7" />
    <span class="sr-only">Create QuickQuote</span>
  </button>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { PlusIcon } from "@heroicons/vue/24/outline";

const router = useRouter();

const openQuickQuote = () => {
  router.push({ name: "quickquote-estimate", params: { id: "new" } });
};
</script>
