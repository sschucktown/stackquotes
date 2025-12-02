<template>
  <div class="rounded-2xl bg-white/80 p-4 ring-1 ring-slate-200">
    <button
      type="button"
      class="flex w-full items-center justify-between gap-3 text-left"
      @click="open = !open"
    >
      <div class="flex items-center gap-2">
        <span class="text-base font-semibold text-slate-900">{{ title }}</span>
        <span class="text-xs uppercase tracking-[0.12em] text-slate-500">
          Tap to {{ open ? "hide" : "view" }}
        </span>
      </div>
      <span
        class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold text-white transition"
        :class="badgeClass"
      >
        {{ open ? "-" : "+" }}
      </span>
    </button>
    <transition name="fade">
      <div v-if="open" class="mt-4">
        <slot />
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const props = defineProps<{
  title: string;
  accent?: "amber" | "blue" | "slate";
  defaultOpen?: boolean | string;
}>();

const open = ref(props.defaultOpen === true || props.defaultOpen === "true");

const badgeClass = computed(() => {
  if (props.accent === "amber") return "bg-amber-500";
  if (props.accent === "blue") return "bg-blue-600";
  return "bg-slate-900";
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
