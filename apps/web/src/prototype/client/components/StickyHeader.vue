<script setup lang="ts">
const props = defineProps<{
  show: boolean;
  optionLabel: string;
  price: string;
}>();

const emit = defineEmits<{
  (e: "approve"): void;
}>();
</script>

<template>
  <Transition name="fade">
    <div
      v-if="props.show"
      class="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-900 backdrop-blur-md shadow-sm"
    >
      <div>
        <p class="text-[11px] uppercase tracking-[0.12em] text-slate-500">Selected</p>
        <p class="text-sm font-semibold text-slate-900">{{ props.optionLabel }}</p>
      </div>
      <div class="flex items-center gap-3">
        <p class="text-base font-bold text-emerald-600">{{ props.price }}</p>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition hover:bg-emerald-700"
          @click="emit('approve')"
        >
          Approve this option
        </button>
      </div>
    </div>
  </Transition>
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
