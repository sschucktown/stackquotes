<script setup lang="ts">
const props = defineProps<{
  tag?: string;
}>();
</script>

<template>
  <Transition name="motion-fade">
    <component :is="props.tag || 'div'">
      <slot />
    </component>
  </Transition>
</template>

<style scoped>
.motion-fade-enter-active {
  transition: opacity 180ms ease-out, transform 180ms ease-out;
}
.motion-fade-leave-active {
  transition: opacity 160ms ease-in, transform 160ms ease-in;
}
.motion-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.motion-fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.motion-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.motion-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
