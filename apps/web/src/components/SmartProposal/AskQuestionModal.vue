<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { useContractorHQPrototype } from "@/stores/contractorHQPrototype";

const props = defineProps<{
  open: boolean;
  optionLabel: string;
  onClose: () => void;
  onSubmit: (text: string) => void;
}>();

const emit = defineEmits<{
  (e: "submit", text: string): void;
}>();

const hq = useContractorHQPrototype();
const question = ref("");
const textareaRef = ref<HTMLTextAreaElement | null>(null);
const jobId = "job-maple";
const label = computed(() => props.optionLabel || "this option");

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      nextTick(() => {
        textareaRef.value?.focus();
      });
    } else {
      question.value = "";
    }
  }
);

const handleClose = () => {
  props.onClose?.();
};

const handleSubmit = () => {
  const text = question.value.trim();
  if (!text) {
    return;
  }
  props.onSubmit?.(text);
  emit("submit", text);
  hq.addTimelineEvent(jobId, `Client asked a question: ${text}`);
  question.value = "";
  handleClose();
};
</script>

<template>
  <Transition name="fade">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
    >
      <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">Ask a question</h2>
            <p class="text-sm text-slate-600">Your contractor will reply shortly.</p>
            <p class="text-[12px] text-slate-500">About: {{ label }}</p>
          </div>
          <button
            class="rounded-full p-1 text-slate-400 transition-all duration-200 ease-out hover:bg-slate-100 hover:text-slate-600"
            @click="handleClose"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <textarea
          ref="textareaRef"
          v-model="question"
          rows="4"
          class="mt-4 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          placeholder="Type your question..."
        />
        <div class="mt-4 flex items-center justify-end gap-2">
          <button
            class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition-all duration-200 ease-out hover:bg-slate-50"
            @click="handleClose"
          >
            Cancel
          </button>
          <button
            class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 ease-out hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            :disabled="!question.trim()"
            @click="handleSubmit"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
