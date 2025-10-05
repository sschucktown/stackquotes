ï»¿<template>
  <teleport to="body">
    <transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4"
        role="dialog"
        aria-modal="true"
      >
        <transition name="slide-up">
          <div class="w-full max-w-2xl rounded-xl bg-white p-6 shadow-lg" role="document">
            <header class="mb-4 flex items-center justify-between">
              <div>
                <h2 class="text-lg font-semibold text-slate-900">{{ title }}</h2>
                <p v-if="description" class="text-sm text-slate-500">{{ description }}</p>
              </div>
              <button
                type="button"
                class="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                @click="emit('close')"
                aria-label="Close modal"
              >
                Ã—
              </button>
            </header>
            <div class="max-h-[70vh] overflow-y-auto pr-1">
              <slot />
            </div>
            <footer v-if="$slots.footer" class="mt-6 flex items-center justify-end gap-3">
              <slot name="footer" />
            </footer>
          </div>
        </transition>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
const props = defineProps<{
  open: boolean;
  title: string;
  description?: string;
}>();

const emit = defineEmits<{ (e: 'close'): void }>();
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(16px);
}
</style>
