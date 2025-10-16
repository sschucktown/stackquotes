<template>
  <button
    type="button"
    :class="wrapperClass"
    @click="openQuickQuote"
  >
    <PlusIcon :class="iconClass" />
    <span v-if="variant === 'inline'" class="text-sm font-semibold">New QuickQuote</span>
    <span v-else class="sr-only">Create QuickQuote</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { PlusIcon } from "@heroicons/vue/24/outline";

const props = withDefaults(
  defineProps<{
    variant?: "floating" | "inline";
  }>(),
  {
    variant: "floating",
  }
);

const router = useRouter();

const openQuickQuote = () => {
  router.push({ name: "quickquote-new" });
};

const wrapperClass = computed(() => {
  if (props.variant === "inline") {
    return "inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white";
  }
  return "flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl shadow-blue-500/40 transition hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white";
});

const iconClass = computed(() => (props.variant === "inline" ? "h-5 w-5" : "h-7 w-7"));
</script>
