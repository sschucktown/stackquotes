<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  src: string;
  alt?: string;
}>();

const loaded = ref(false);
</script>

<template>
  <Transition name="crossfade" mode="out-in">
    <div
      :key="props.src"
      class="relative h-48 w-full overflow-hidden rounded-2xl bg-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
    >
      <div v-if="!loaded" class="absolute inset-0 animate-pulse bg-slate-200"></div>
      <img
        :src="props.src"
        :alt="props.alt || 'Preview'"
        class="h-full w-full object-cover transition-opacity duration-300"
        loading="lazy"
        @load="loaded = true"
      />
      <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent"></div>
    </div>
  </Transition>
</template>

<style scoped>
.crossfade-enter-active,
.crossfade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.crossfade-enter-from,
.crossfade-leave-to {
  opacity: 0;
  transform: scale(0.985);
}
</style>
