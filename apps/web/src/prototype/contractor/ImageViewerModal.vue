<template>
  <div v-if="show">
    <div class="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" @click="handleClose"></div>

    <button
      class="fixed right-4 top-4 z-50 rounded-full bg-white/20 p-2 text-white backdrop-blur transition hover:bg-white/30"
      @click="handleClose"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="m18 6-12 12" />
        <path d="m6 6 12 12" />
      </svg>
    </button>

    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <img
        :src="imageSrc"
        :style="{ transform: `scale(${zoom})` }"
        class="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl transition-transform duration-300"
        alt="Preview"
      />
    </div>

    <div class="fixed inset-x-0 bottom-6 z-50 flex justify-center gap-4">
      <button class="rounded-full bg-white/10 px-4 py-2 text-white transition hover:bg-white/20" @click="zoomOut">
        -
      </button>
      <button class="rounded-full bg-white/10 px-4 py-2 text-white transition hover:bg-white/20" @click="zoomIn">
        +
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";

const props = defineProps<{
  show: boolean;
  src?: string;
  onClose?: () => void;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const zoom = ref(1);

const imageSrc = computed(() => props.src || "https://via.placeholder.com/800x600?text=Preview");

const handleClose = () => {
  emit("close");
  props.onClose?.();
  zoom.value = 1;
};

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === "Escape") handleClose();
};

const zoomOut = () => {
  zoom.value = Math.max(0.5, +(zoom.value - 0.1).toFixed(2));
};

const zoomIn = () => {
  zoom.value = Math.min(2.5, +(zoom.value + 0.1).toFixed(2));
};

onMounted(() => window.addEventListener("keydown", handleEscape));
onUnmounted(() => window.removeEventListener("keydown", handleEscape));
</script>
