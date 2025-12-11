<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  selected?: {
    key: string;
    label: string;
    price: number;
  };
  depositPercent: number;
  depositAmount: number;
  currency: (v: number) => string;

  // NEW:
  loading?: boolean;
  error?: string | null;
}>();

const emit = defineEmits<{
  (e: "approve"): void;
  (e: "question"): void;
}>();

const showDeposit = computed(() => props.depositAmount > 0);
</script>

<template>
  <aside class="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <!-- Title -->
    <h2 class="text-xl font-semibold text-slate-900">Summary</h2>

    <!-- Selected Option -->
    <div class="mt-4">
      <p class="text-sm text-slate-500">Selected Option</p>
      <p class="text-lg font-semibold text-slate-900">
        {{ selected?.label || "None selected" }}
      </p>
    </div>

    <!-- Price -->
    <div class="mt-4 border-t border-slate-200 pt-4">
      <div class="flex items-center justify-between text-sm">
        <span class="text-slate-600">Project Price</span>
        <span class="font-semibold text-slate-900">
          {{ selected ? currency(selected.price) : "—" }}
        </span>
      </div>

      <!-- Deposit -->
      <div v-if="showDeposit" class="mt-3 flex items-center justify-between text-sm">
        <span class="text-slate-600">
          Deposit ({{ depositPercent }}%)
        </span>
        <span class="font-semibold text-emerald-700">
          {{ currency(depositAmount) }}
        </span>
      </div>
    </div>

    <!-- Divider -->
    <div class="my-5 border-t border-slate-200"></div>

    <!-- Error Message -->
    <div 
      v-if="error"
      class="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200"
    >
      {{ error }}
    </div>

    <!-- Approve Button -->
    <button
      class="flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-white font-semibold shadow hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="!selected || loading"
      @click="emit('approve')"
    >
      <span v-if="loading" class="inline-flex items-center gap-2">
        <svg
          class="h-4 w-4 animate-spin text-white"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
        Processing…
      </span>
      <span v-else>Approve & Sign</span>
    </button>

    <!-- Ask a Question -->
    <button
      class="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 font-semibold shadow-sm hover:bg-slate-50 transition"
      @click="emit('question')"
    >
      Ask a Question
    </button>
  </aside>
</template>
