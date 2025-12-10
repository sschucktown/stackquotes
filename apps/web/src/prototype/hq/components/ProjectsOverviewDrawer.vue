<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  open: boolean;
  job: {
    id: string;
    title: string;
    client_name: string;
    status: string;
    approved_option?: string;
    deposit_amount?: number;
    signature_image?: string;
    approved_at?: string;
  } | null;
  onClose: () => void;
}>();

const emit = defineEmits<{
  (e: "schedule", jobId: string): void;
  (e: "openProposal", jobId: string): void;
  (e: "payments", jobId: string): void;
}>();

const formattedDate = computed(() => {
  if (!props.job?.approved_at) return null;
  return new Date(props.job.approved_at).toLocaleDateString();
});
</script>

<template>
  <!-- Backdrop -->
  <div
    v-if="open"
    class="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
    @click="onClose"
  ></div>

  <!-- Drawer -->
  <aside
    class="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300"
    :class="open ? 'translate-x-0' : 'translate-x-full'"
  >
    <!-- Header -->
    <header
      class="flex items-center justify-between border-b border-slate-200 px-6 py-4"
    >
      <h2 class="text-xl font-semibold text-slate-900">
        Project Overview
      </h2>

      <button
        class="text-slate-500 hover:text-slate-700 transition"
        @click="onClose"
      >
        ✕
      </button>
    </header>

    <!-- Content -->
    <div class="px-6 py-4 overflow-y-auto h-[calc(100%-64px)]">
      <div v-if="job" class="space-y-6">

        <!-- Job Title -->
        <div>
          <p class="text-[11px] uppercase font-semibold tracking-wider text-slate-500">
            Project
          </p>
          <h3 class="text-lg font-bold text-slate-900">
            {{ job.title }}
          </h3>
        </div>

        <!-- Client -->
        <div>
          <p class="text-[11px] uppercase font-semibold tracking-wider text-slate-500">
            Client
          </p>
          <p class="text-slate-800 text-sm font-medium">
            {{ job.client_name }}
          </p>
        </div>

        <!-- Status -->
        <div>
          <p class="text-[11px] uppercase font-semibold tracking-wider text-slate-500">
            Status
          </p>
          <p class="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
             :class="{
               'bg-emerald-100 text-emerald-700': job.status === 'approved',
               'bg-blue-100 text-blue-700': job.status === 'sent',
               'bg-yellow-100 text-yellow-700': job.status === 'pending',
               'bg-slate-200 text-slate-600': job.status !== 'approved'
             }">
            {{ job.status }}
          </p>
        </div>

        <!-- Approved Option -->
        <div v-if="job.approved_option">
          <p class="text-[11px] uppercase font-semibold tracking-wider text-slate-500">
            Selected Option
          </p>
          <p class="text-slate-800 text-sm font-medium">
            {{ job.approved_option }}
          </p>
        </div>

        <!-- Deposit -->
        <div v-if="job.deposit_amount !== undefined">
          <p class="text-[11px] uppercase font-semibold tracking-wider text-slate-500">
            Deposit
          </p>
          <p class="text-emerald-700 font-semibold">
            ${{ job.deposit_amount.toLocaleString() }}
          </p>
        </div>

        <!-- Signature -->
        <div v-if="job.signature_image" class="space-y-2">
          <p class="text-[11px] uppercase font-semibold tracking-wider text-slate-500">
            Signed Approval
          </p>
          <img
            :src="job.signature_image"
            alt="Signature"
            class="border border-slate-300 rounded-lg bg-white p-2 max-h-32 object-contain"
          />
          <p class="text-xs text-slate-500">
            Signed on {{ formattedDate || '—' }}
          </p>
        </div>

        <!-- Actions -->
        <div class="pt-4 border-t border-slate-200 space-y-3">
          <button
            class="w-full rounded-xl bg-emerald-600 px-4 py-3 text-white font-semibold shadow hover:bg-emerald-700 transition"
            @click="emit('schedule', job.id)"
          >
            Schedule Project
          </button>
          <button
            class="w-full rounded-xl bg-slate-800 px-4 py-3 text-white font-semibold shadow hover:bg-slate-900 transition"
            @click="emit('openProposal', job.id)"
          >
            View Full Proposal
          </button>
          <button
            class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 font-semibold shadow-sm hover:bg-slate-50 transition"
            @click="emit('payments', job.id)"
          >
            Manage Payments
          </button>
        </div>

      </div>

      <!-- Safe empty state -->
      <div v-else class="text-center text-slate-500 mt-10">
        No project selected.
      </div>
    </div>
  </aside>
</template>
