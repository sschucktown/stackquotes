<script setup lang="ts">
const props = defineProps<{
  show: boolean;
  active: string;
}>();

const emit = defineEmits<{
  (e: "select", key: string): void;
}>();

const trims = [
  { key: "good", label: "Good" },
  { key: "better", label: "Better" },
  { key: "best", label: "Best" },
];
</script>

<template>
  <transition name="fade">
    <div
      v-if="show"
      class="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur"
    >
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Choose your trim</p>
        <div class="flex items-center gap-2">
          <button
            v-for="trim in trims"
            :key="trim.key"
            type="button"
            class="rounded-full px-3 py-1 text-sm font-semibold transition"
            :class="active === trim.key ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-transparent hover:bg-slate-200'"
            @click="emit('select', trim.key)"
          >
            {{ trim.label }}
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
