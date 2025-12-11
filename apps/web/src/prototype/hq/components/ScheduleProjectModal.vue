<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

// Props
const props = defineProps<{
  open: boolean;
  jobId: string | null;
  clientName: string | null;
  onClose: () => void;
}>();

const emit = defineEmits<{
  (e: "scheduled", payload: { start: string; end: string | null }): void;
}>();

const router = useRouter();

// Form state
const startDate = ref("");
const endDate = ref("");

// UI state
const loading = ref(false);
const errorMessage = ref<string | null>(null);

// Validate minimal
const canSubmit = computed(() => startDate.value && !loading.value);

// API Call
const submitSchedule = async () => {
  if (!props.jobId) return;
  if (!startDate.value) return;

  loading.value = true;
  errorMessage.value = null;

  try {
    const res = await fetch(`/api/jobs/${props.jobId}/schedule`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        start_date: startDate.value,
        end_date: endDate.value || null,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      errorMessage.value = json?.error ?? "Failed to schedule project.";
      loading.value = false;
      return;
    }

    // Emit for local parent components
    emit("scheduled", {
      start: startDate.value,
      end: endDate.value || null,
    });

    // Close modal
    props.onClose();

    // Navigate to contractor confirmation screen
    router.push({
      path: "/prototype/hq/schedule/confirm",
      query: {
        job: props.jobId,
        start: startDate.value,
        end: endDate.value || undefined,
      },
    });
  } catch (err: any) {
    errorMessage.value = "Network error — please try again.";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <!-- BACKDROP -->
  <div
    v-if="open"
    class="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
    @click="onClose"
  ></div>

  <!-- DRAWER -->
  <div
    class="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-xl rounded-t-2xl transition-transform duration-300"
    :class="open ? 'translate-y-0' : 'translate-y-full'"
  >
    <div class="mx-auto max-w-2xl px-6 py-6 space-y-6">
      <div class="text-center">
        <div class="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-4" />
        <p class="text-xs uppercase tracking-wider text-slate-500 font-semibold">
          Schedule Project
        </p>
        <h2 class="text-xl font-semibold text-slate-900">
          {{ clientName || "Client" }}
        </h2>
      </div>

      <!-- ERROR -->
      <div v-if="errorMessage" class="rounded-lg bg-red-50 text-red-700 p-3 text-sm">
        {{ errorMessage }}
      </div>

      <!-- FORM -->
      <div class="space-y-4">
        <div>
          <label class="text-sm font-semibold text-slate-700">Start Date</label>
          <input
            type="date"
            v-model="startDate"
            class="mt-1 w-full rounded-xl border border-slate-300 p-3 shadow-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="text-sm font-semibold text-slate-700">End Date (optional)</label>
          <input
            type="date"
            v-model="endDate"
            class="mt-1 w-full rounded-xl border border-slate-300 p-3 shadow-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- CTA BUTTON -->
      <button
        class="w-full rounded-xl bg-emerald-600 text-white font-semibold py-3 shadow transition hover:bg-emerald-700 disabled:opacity-50"
        :disabled="!canSubmit"
        @click="submitSchedule"
      >
        <span v-if="!loading">Schedule Project</span>
        <span v-else>Scheduling…</span>
      </button>

      <button
        class="w-full rounded-xl bg-slate-100 text-slate-700 font-semibold py-3 shadow-sm"
        @click="onClose"
      >
        Cancel
      </button>
    </div>
  </div>
</template>
