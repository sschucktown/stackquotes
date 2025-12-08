<script setup lang="ts">
import { computed, ref, watch } from "vue";

type Project = {
  id: string;
  clientName: string;
  projectName: string;
  price?: number;
  depositDue?: number;
};

type Approval = {
  id?: string;
  optionLabel?: string;
  price?: number;
  depositDue?: number;
};

const props = defineProps<{
  open: boolean;
  project: Project;
  approval?: Approval;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "submit", payload: any): void;
}>();

const startDate = ref<string>("");
const collectDeposit = ref(true);
const message = ref("");

const optionLabel = computed(() => props.approval?.optionLabel || "Better");
const price = computed(() => props.approval?.price ?? props.project.price ?? 0);
const deposit = computed(() => props.approval?.depositDue ?? props.project.depositDue ?? Math.round((price.value || 0) * 0.15));

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      const today = new Date();
      today.setDate(today.getDate() + 5);
      startDate.value = today.toISOString().slice(0, 10);
      collectDeposit.value = true;
      message.value = "";
    }
  }
);

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const handleClose = () => emit("close");

const handleSubmit = () => {
  const payload = {
    projectId: props.project.id,
    clientName: props.project.clientName,
    projectName: props.project.projectName,
    optionLabel: optionLabel.value,
    startDate: startDate.value,
    depositDue: collectDeposit.value ? deposit.value : 0,
    message: message.value?.trim() || null,
  };
  emit("submit", payload);
  emit("close");
};
</script>

<template>
  <Transition name="modal">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
    >
      <Transition name="card">
        <div
          class="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
          key="scheduling-modal"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">Schedule &amp; Confirm Work</h2>
              <p class="text-sm text-slate-600">Choose a target start date and confirm the deposit collection.</p>
            </div>
            <button
              class="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              @click="handleClose"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div class="mt-5 space-y-4">
            <div class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div class="flex flex-wrap items-center gap-3">
                <div>
                  <p class="text-xs uppercase tracking-[0.08em] text-slate-500">Client</p>
                  <p class="text-sm font-semibold text-slate-900">{{ project.clientName }}</p>
                </div>
                <div>
                  <p class="text-xs uppercase tracking-[0.08em] text-slate-500">Project</p>
                  <p class="text-sm font-semibold text-slate-900">{{ project.projectName }}</p>
                </div>
                <div>
                  <p class="text-xs uppercase tracking-[0.08em] text-slate-500">Selected Option</p>
                  <div class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {{ optionLabel }}
                  </div>
                </div>
              </div>
              <div class="mt-3 flex flex-wrap items-center gap-4">
                <div>
                  <p class="text-xs uppercase tracking-[0.08em] text-slate-500">Price</p>
                  <p class="text-sm font-semibold text-slate-900">{{ formatCurrency(price) }}</p>
                </div>
                <div>
                  <p class="text-xs uppercase tracking-[0.08em] text-slate-500">Deposit due</p>
                  <p class="text-sm font-semibold text-emerald-700">{{ formatCurrency(deposit) }}</p>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-semibold text-slate-900" for="startDate">Preferred Start Date</label>
              <input
                id="startDate"
                v-model="startDate"
                type="date"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
              <p class="text-xs text-slate-500">Client will get this date for confirmation.</p>
            </div>

            <div class="flex items-center justify-between rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5">
              <div>
                <p class="text-sm font-semibold text-slate-900">Deposit to collect now</p>
                <p class="text-xs text-slate-500">Collect {{ formatCurrency(deposit) }} at scheduling.</p>
              </div>
              <label class="relative inline-flex h-6 w-12 cursor-pointer items-center">
                <input v-model="collectDeposit" type="checkbox" class="peer sr-only" />
                <span class="absolute inset-0 rounded-full bg-slate-200 transition peer-checked:bg-emerald-500" aria-hidden="true"></span>
                <span class="absolute left-1 h-4 w-4 rounded-full bg-white shadow transition peer-checked:translate-x-6" aria-hidden="true"></span>
              </label>
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-sm font-semibold text-slate-900" for="message">Message to client (optional)</label>
                <span class="text-xs text-slate-500">This will appear in the client portal.</span>
              </div>
              <textarea
                id="message"
                v-model="message"
                rows="3"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                placeholder="Any notes or clarity to share?"
              />
            </div>
          </div>

          <div class="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
            <button
              class="w-full rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 sm:w-auto"
              @click="handleClose"
            >
              Cancel
            </button>
            <button
              class="w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-700 sm:w-auto"
              @click="handleSubmit"
            >
              Send Schedule + Deposit Confirmation
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.modal-enter-active {
  transition: opacity 180ms ease-out, transform 180ms ease-out;
}
.modal-leave-active {
  transition: opacity 150ms ease-in, transform 150ms ease-in;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
.modal-leave-from,
.modal-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.card-enter-active {
  transition: opacity 180ms ease-out, transform 180ms ease-out;
}
.card-leave-active {
  transition: opacity 150ms ease-in, transform 150ms ease-in;
}
.card-enter-from,
.card-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
.card-leave-from,
.card-enter-to {
  opacity: 1;
  transform: translateY(0);
}
</style>
