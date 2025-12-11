<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const props = defineProps<{
  open: boolean;
  jobId: string | null;
  onClose: () => void;
}>();

const emit = defineEmits<{
  (e: "scheduled", jobId: string): void;
}>();

const router = useRouter();

// ---------------------------
// Local State
// ---------------------------
const startDate = ref<string | null>(null);
const loading = ref(false);
const errorMessage = ref("");
const success = ref(false);

// ---------------------------
// API Call
// ---------------------------
const scheduleProject = async () => {
  if (!props.jobId || !startDate.value) return;

  loading.value = true;
  errorMessage.value = "";

  try {
    const res = await fetch(`/api/jobs/${props.jobId}/schedule`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        start_date: startDate.value,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "Failed to schedule project.");
    }

    success.value = true;

    // Delay to show success state
    setTimeout(() => {
      emit("scheduled", props.jobId!);
      props.onClose();

      router.push({
        name: "ScheduleConfirmPrototype",
        query: { job: props.jobId },
      });
    }, 700);
  } catch (err: any) {
    errorMessage.value = err.message ?? "Something went wrong.";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <!-- Overlay -->
  <div
    v-if="open"
    class="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
    @click="onClose"
  />

  <!-- Modal -->
  <div
    v-if="open"
    class="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl transform transition-all duration-300"
  >
    <!-- Header -->
    <div class="flex items-center justify-between border-b px-6 py-4">
      <h2 class="text-lg font-semibold text-slate-900">
        Schedule Project
      </h2>
      <button
        class="text-slate-500 hover:text-slate-700"
        @click="onClose"
      >
        ✕
      </button>
    </div>

    <!-- Body -->
    <div class="p-6 space-y-6">
      <!-- Date Picker -->
      <div>
        <label for="date" class="block text-sm font-medium text-slate-700">
          Select start date
        </label>
        <input
          id="date"
          type="date"
          class="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
          v-model="startDate"
        />
      </div>

      <!-- Error message -->
      <p v-if="errorMessage" class="text-red-600 text-sm">
        {{ errorMessage }}
      </p>

      <!-- Success confirmation -->
      <div
        v-if="success"
        class="flex items-center justify-center gap-2 rounded-lg bg-emerald-50 py-3 text-emerald-700 text-sm font-semibold"
      >
        ✓ Scheduled!
      </div>
    </div>

    <!-- Footer -->
    <div class="p-6 border-t space-y-3">
      <button
        class="w-full rounded-xl bg-emerald-600 px-4 py-3 text-white font-semibold shadow hover:bg-emerald-700 transition disabled:opacity-50"
        :disabled="!startDate || loading"
        @click="scheduleProject"
      >
        <span v-if="!loading">Schedule Project</span>
        <span v-else class="animate-pulse">Scheduling…</span>
      </button>

      <button
        class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 font-semibold shadow-sm hover:bg-slate-50 transition"
        @click="onClose"
      >
        Cancel
      </button>
    </div>
  </div>
</template>
