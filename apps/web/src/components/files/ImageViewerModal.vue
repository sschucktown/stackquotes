<template>
  <div v-if="show">
    <div
      class="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
      @click="handleClose"
    ></div>

    <button
      class="fixed top-4 right-4 z-50 rounded-full bg-white/20 p-2 text-white backdrop-blur transition hover:bg-white/30"
      @click="handleClose"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="m18 6-12 12" />
        <path d="m6 6 12 12" />
      </svg>
    </button>

    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="text-center">
        <div class="mb-3 flex items-center justify-center gap-3 text-sm text-slate-200">
          <span class="rounded-full bg-white/10 px-3 py-1 font-semibold backdrop-blur">{{ currentFile?.name }}</span>
          <span class="rounded-full bg-white/10 px-3 py-1 font-semibold backdrop-blur">{{ currentFile?.createdAt }}</span>
        </div>
        <div class="relative inline-flex">
          <img
            :src="currentFile?.thumbnail || placeholder"
            class="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl transition-transform duration-300"
            alt="Preview"
          />
          <button
            v-if="images.length > 1"
            class="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur transition hover:bg-white/30"
            @click.stop="prev"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            v-if="images.length > 1"
            class="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur transition hover:bg-white/30"
            @click.stop="next"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

type FileItem = {
  id: string;
  name: string;
  thumbnail: string;
  createdAt?: string;
};

const placeholder = "https://placehold.co/800x600?text=Preview";

const props = defineProps<{
  show: boolean;
  images: FileItem[];
  startIndex?: number;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const currentIndex = ref(props.startIndex ?? 0);

watch(
  () => props.startIndex,
  (val) => {
    if (typeof val === "number") currentIndex.value = val;
  }
);

const currentFile = computed(() => props.images?.[currentIndex.value]);

const handleClose = () => {
  emit("close");
};

const next = () => {
  if (!props.images?.length) return;
  currentIndex.value = (currentIndex.value + 1) % props.images.length;
};

const prev = () => {
  if (!props.images?.length) return;
  currentIndex.value = (currentIndex.value - 1 + props.images.length) % props.images.length;
};

const onKey = (e: KeyboardEvent) => {
  if (e.key === "Escape") handleClose();
  if (e.key === "ArrowRight") next();
  if (e.key === "ArrowLeft") prev();
};

onMounted(() => {
  window.addEventListener("keydown", onKey);
});

onUnmounted(() => {
  window.removeEventListener("keydown", onKey);
});
</script>
