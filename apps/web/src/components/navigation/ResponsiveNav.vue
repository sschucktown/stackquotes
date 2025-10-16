<template>
  <slot :isDesktop="isDesktop.value" />
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from "vue";

const props = withDefaults(
  defineProps<{
    desktopBreakpoint?: number;
  }>(),
  {
    desktopBreakpoint: 1024,
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
</script>
