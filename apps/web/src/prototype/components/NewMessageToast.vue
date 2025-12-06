<template>
  <Transition name="slide-up">
    <div
      v-if="visible"
      class="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 sm:justify-end sm:px-6 lg:px-8"
    >
      <div
        class="flex max-w-sm items-start gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-slate-50 shadow-xl ring-1 ring-slate-900/60"
      >
        <div class="mt-0.5 h-2 w-2 rounded-full bg-emerald-400"></div>
        <div class="flex-1">
          <p class="mb-0.5 text-xs uppercase tracking-wide text-slate-400">
            New message
          </p>
          <p class="text-sm font-medium">
            {{ preview?.participant }} · {{ preview?.job }}
          </p>
          <p class="mt-0.5 line-clamp-2 text-xs text-slate-300">
            {{ preview?.text }}
          </p>
        </div>
        <button
          type="button"
          class="ml-2 text-slate-400 transition hover:text-slate-200"
          @click="visible = false"
        >
          ✕
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from "vue";

type ToastPayload = {
  participant: string;
  job: string;
  text: string;
};

const visible = ref(false);
const preview = ref<ToastPayload | null>(null);
let hideTimer: number | null = null;

function showToast(payload: ToastPayload) {
  preview.value = payload;
  visible.value = true;
  if (hideTimer !== null) window.clearTimeout(hideTimer);
  hideTimer = window.setTimeout(() => {
    visible.value = false;
  }, 5000);
}

// Expose globally for the mock push helper
// eslint-disable-next-line
// @ts-ignore
window.__sqShowMessageToast = showToast;
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.18s ease-out;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
