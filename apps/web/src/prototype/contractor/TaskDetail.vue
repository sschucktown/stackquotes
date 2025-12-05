<template>
  <div class="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 px-3 pb-3 md:items-center md:px-4 md:pb-0">
    <div
      class="w-full max-w-lg transform rounded-t-3xl bg-white shadow-2xl transition md:rounded-2xl"
    >
      <div class="flex items-start justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <p class="text-sm font-semibold text-slate-500 uppercase tracking-wide">Task Detail</p>
          <h3 class="text-lg font-semibold text-slate-900">{{ task.name }}</h3>
        </div>
        <button
          class="rounded-full p-2 text-slate-500 transition hover:bg-slate-100"
          @click="handleClose"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="m18 6-12 12" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      <div class="space-y-5 px-5 py-4">
        <div class="flex items-center gap-2">
          <span class="text-xs uppercase tracking-wide text-slate-500">Status</span>
          <button
            class="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition"
            :class="status === 'completed'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              : 'bg-amber-50 text-amber-700 border border-amber-100'"
            @click="toggleStatus"
          >
            {{ status === 'completed' ? 'Completed' : 'Pending' }}
          </button>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-semibold text-slate-900">Notes</h4>
            <button class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-inner transition hover:bg-blue-100">
              Add Note
            </button>
          </div>
          <p class="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            {{ notesText }}
          </p>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-semibold text-slate-900">Photos</h4>
            <button class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-inner transition hover:bg-blue-100">
              Add Photo
            </button>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <div
              v-for="index in 3"
              :key="index"
              class="flex h-20 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="m5 17 4-4 3 3 5-5 2 2" />
                <path d="M15 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
              </svg>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          <div class="space-y-1">
            <p class="font-semibold text-slate-700">Created On</p>
            <p>Nov 28, 2025 at 9:12 AM</p>
          </div>
          <div class="space-y-1">
            <p class="font-semibold text-slate-700">Last Updated</p>
            <p>Dec 3, 2025 at 1:45 PM</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

type Task = {
  id: number;
  name: string;
  status: "pending" | "completed";
  hasNotes?: boolean;
  hasPhotos?: boolean;
};

const props = defineProps<{
  task: Task;
  onClose?: () => void;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const status = ref<Task["status"]>(props.task?.status ?? "pending");

watch(
  () => props.task,
  (next) => {
    status.value = next?.status ?? "pending";
  },
  { immediate: true }
);

const notesText = computed(() =>
  props.task?.hasNotes ? "Site note: check ledger flashing and stair stringers." : "No notes yet"
);

const toggleStatus = () => {
  status.value = status.value === "completed" ? "pending" : "completed";
};

const handleClose = () => {
  emit("close");
  props.onClose?.();
};
</script>
