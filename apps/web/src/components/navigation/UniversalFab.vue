<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { PlusIcon, BoltIcon, DocumentTextIcon, BanknotesIcon, ChatBubbleLeftRightIcon } from "@heroicons/vue/24/outline";

const router = useRouter();
// Direct action FAB: click goes straight to QuickQuote new
const onMainClick = () => {
  router.push({ name: "quickquote-new" });
};
</script>

<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
    <button
      type="button"
      class="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl shadow-brand-600/40 transition hover:scale-105 hover:bg-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white md:h-16 md:w-16"
      aria-label="Actions"
      @click="onMainClick"
    >
      <PlusIcon class="h-8 w-8" />
    </button>
  </div>
  
</template>

<style scoped>
</style>
