<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 px-4"
      @click.self="emitClose"
    >
      <transition name="slide-up">
        <div
          v-if="visible"
          class="w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
        >
          <div class="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Scope details</p>
              <p class="text-lg font-bold text-slate-900">{{ optionLabel }} option</p>
            </div>
            <button
              class="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
              @click="emitClose"
            >
              Close
            </button>
          </div>
          <div class="grid gap-6 p-6 md:grid-cols-[1.1fr,0.9fr]">
            <div class="space-y-4">
              <div class="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Scope</p>
                <ul class="mt-2 space-y-2 text-sm text-slate-700">
                  <li v-for="item in optionData.scope" :key="item" class="flex items-start gap-2">
                    <span class="mt-1 h-2 w-2 rounded-full bg-emerald-500"></span>
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>
              <div class="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Add-ons</p>
                <ul class="mt-2 space-y-2 text-sm text-slate-700">
                  <li v-for="item in optionData.addons" :key="item" class="flex items-start gap-2">
                    <span class="mt-1 h-2 w-2 rounded-full bg-sky-500"></span>
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>
              <div class="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <p class="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">Exclusions</p>
                <ul class="mt-2 space-y-2 text-sm text-amber-800">
                  <li v-for="item in optionData.exclusions" :key="item" class="flex items-start gap-2">
                    <span class="mt-1 h-2 w-2 rounded-full bg-amber-500"></span>
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>
            </div>
            <div class="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Photo inspiration</p>
              <div class="grid grid-cols-2 gap-3">
                <div
                  v-for="(photo, idx) in optionData.photos"
                  :key="idx"
                  class="aspect-video rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-inner"
                >
                  <div class="flex h-full items-center justify-center text-xs font-semibold text-slate-500">{{ photo }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup lang="ts">
const props = defineProps<{
  visible: boolean;
  optionLabel: string;
  optionData: {
    scope: string[];
    addons: string[];
    exclusions: string[];
    photos: string[];
  };
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const emitClose = () => emit("close");
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(12px);
  opacity: 0;
}
</style>
