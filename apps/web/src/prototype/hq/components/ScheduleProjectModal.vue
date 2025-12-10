<script setup lang="ts">
import { ref, computed, watch } from "vue";

// ---------------------------------------
// Props
// ---------------------------------------
const props = defineProps<{
  open: boolean;
  job: {
    id: string;
    title: string;
    client_name: string;
    approved_option?: string;
  } | null;
  onClose: () => void;
}>();

// ---------------------------------------
// Emits
// ---------------------------------------
const emit = defineEmits<{
  (e: "confirm", payload: { jobId: string; startDate: string }): void;
}>();

// ---------------------------------------
// Internal state
// ---------------------------------------
const startDate = ref<string>("");

// Reset date when modal opens
watch(
  () => props.open,
  (val) => {
    if (val) startDate.value = "";
  }
);

// ---------------------------------------
// Validation
// ---------------------------------------
const canSubmit = computed(() => {
  return props.job && startDate.value.length > 0;
});
</script>

<template>
  <!-- Backdrop -->
  <div
    v-if="open"
    class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
    @click="onClose"
  ></div>

  <!-- Bottom Sheet Modal -->
  <div
    class="fixed inset-x-0 bottom-0 z-50 w-full max-h-[85vh] rounded-t-2xl bg-white shadow-xl transition-transform duration-300"
    :class="open ? 'translate-y-0' : 'translate-y-full'"
  >
    <!-- Handle -->
    <div class="flex justify-center pt-3">
      <div class="h-1 w-10 rounded-full bg-slate-300"></div>
    </div>

    <div class="px-6 py-4 space-y-6 overflow-y-auto max-h-[75vh]">
      <!-- Header -->
      <header class="space-y-1">
        <p class="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Schedule Project
        </p>
        <h2 class="text-xl font-bold text-slate-900">
          {{ job?.title || "Project" }}
        </h2>
        <p class="text-sm text-slate-600">Client: {{ job?.client_name }}</p>
        <p v-if="job?.approved_option" class="text-sm text-slate-500">
          Option: <span class="font-medium">{{ job.approved_option }}</span>
        </p>
      </header>

      <!-- Date Picker -->
      <div class="space-y-2">
        <label
          for="startDate"
          class="block text-sm font-semibold text-slate-800"
        >
          Start Date
        </label>
        <input
          type="date"
          id="startDate"
          v-model="startDate"
          class="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
        />
      </div>

      <!-- CTA Buttons -->
      <div class="pt-2 space-y-3">
        <button
          class="w-full rounded-xl bg-emerald-600 px-4 py-3 text-white font-semibold shadow hover:bg-emerald-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
          :disabled="!canSubmit"
          @click="
            job &&
              emit('confirm', {
                jobId: job.id,
                startDate: startDate,
              })
          "
        >
          Schedule Project
        </button>

        <button
          class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 font-semibold shadow-sm hover:bg-slate-50 transition"
          @click="onClose"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>
