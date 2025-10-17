<template>
  <slot :isDesktop="isDesktop.value" :isWide="isWide.value" />
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from "vue";

const props = withDefaults(
  defineProps<{
    desktopBreakpoint?: number;
    wideBreakpoint?: number;
  }>(),
  {
    desktopBreakpoint: 1024,
    wideBreakpoint: 1280,
  }
);

const width = ref(typeof window !== "undefined" ? window.innerWidth : props.desktopBreakpoint);

const handleResize = () => {
  width.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener("resize", handleResize, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
});

const isDesktop = computed(() => width.value >= props.desktopBreakpoint);
const isWide = computed(() => width.value >= props.wideBreakpoint);
</script>
