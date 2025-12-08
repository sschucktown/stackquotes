<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { PhoneIcon, UserIcon, TruckIcon, KeyIcon } from "@heroicons/vue/24/outline";
import KickoffModalField from "./KickoffModalField.vue";
import { apiFetch } from "@/lib/http";

type Project = {
  proposalId: string;
  clientName: string;
  projectName: string;
  startDate?: string | null;
  price?: number | null;
  deposit?: number | null;
};

const props = defineProps<{
  open: boolean;
  project: Project | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "sent", payload: { arrivalWindow: string; leadName: string; leadPhone: string; materialNotes: string; accessNotes: string }): void;
}>();

const arrivalWindow = ref("");
const leadName = ref("");
const leadPhone = ref("");
const materialNotes = ref("");
const accessNotes = ref("");
const sending = ref(false);
const error = ref<string | null>(null);

const startDateLabel = computed(() => {
  const d = props.project?.startDate ? new Date(props.project.startDate) : null;
  if (!d || Number.isNaN(d.getTime())) return props.project?.startDate ?? "Not set";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
});

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      arrivalWindow.value = "";
      leadName.value = "";
      leadPhone.value = "";
      materialNotes.value = "";
      accessNotes.value = "";
      error.value = null;
    }
  }
);

const formatCurrency = (value: number | null | undefined) =>
  (value ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const handleClose = () => emit("close");

const validate = () => {
  if (!arrivalWindow.value.trim()) return "Arrival window is required";
  if (!leadName.value.trim()) return "Crew lead name is required";
  if (!leadPhone.value.trim()) return "Crew lead phone is required";
  return null;
};

const handleSend = async () => {
  const validationError = validate();
  if (validationError) {
    error.value = validationError;
    return;
  }
  if (!props.project?.proposalId) {
    error.value = "Missing project reference";
    return;
  }

  sending.value = true;
  error.value = null;
  const payload = {
    proposalId: props.project.proposalId,
    arrivalWindow: arrivalWindow.value.trim(),
    leadName: leadName.value.trim(),
    leadPhone: leadPhone.value.trim(),
    materialNotes: materialNotes.value.trim(),
    accessNotes: accessNotes.value.trim(),
  };

  const res = await apiFetch("/kickoff/send", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  sending.value = false;
  if (res.error) {
    error.value = res.error;
    return;
  }
  emit("sent", payload);
  emit("close");
  setTimeout(() => {
    alert("Kickoff details sent to client");
  }, 10);
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
        <div class="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" key="kickoff-modal">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">Send Kickoff Details</h2>
              <p class="text-sm text-slate-600">Lock in day-one details so your client knows what to expect.</p>
            </div>
            <button
              class="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              @click="handleClose"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div class="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div class="flex flex-wrap items-center gap-4">
              <div>
                <p class="text-xs uppercase tracking-[0.08em] text-slate-500">Client</p>
                <p class="text-sm font-semibold text-slate-900">{{ project?.clientName }}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-[0.08em] text-slate-500">Project</p>
                <p class="text-sm font-semibold text-slate-900">{{ project?.projectName }}</p>
              </div>
              <div>
                <p class="text-xs uppercase tracking-[0.08em] text-slate-500">Start date</p>
                <p class="text-sm font-semibold text-slate-900">{{ startDateLabel }}</p>
              </div>
            </div>
            <div class="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
              <span v-if="project?.price">Price {{ formatCurrency(project?.price) }}</span>
              <span v-if="project?.deposit">Deposit {{ formatCurrency(project?.deposit) }}</span>
            </div>
          </div>

          <div class="mt-5 space-y-4">
            <KickoffModalField label="Crew arrival window" required>
              <div class="relative">
                <input
                  v-model="arrivalWindow"
                  type="text"
                  class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  placeholder="8:00–10:00 AM"
                />
                <TruckIcon class="absolute right-3 top-2.5 h-5 w-5 text-slate-400" />
              </div>
            </KickoffModalField>

            <div class="grid gap-4 sm:grid-cols-2">
              <KickoffModalField label="Crew lead name" required>
                <div class="relative">
                  <input
                    v-model="leadName"
                    type="text"
                    class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    placeholder="Jordan Smith"
                  />
                  <UserIcon class="absolute right-3 top-2.5 h-5 w-5 text-slate-400" />
                </div>
              </KickoffModalField>
              <KickoffModalField label="Crew lead phone" required>
                <div class="relative">
                  <input
                    v-model="leadPhone"
                    type="tel"
                    class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    placeholder="(555) 123-4567"
                  />
                  <PhoneIcon class="absolute right-3 top-2.5 h-5 w-5 text-slate-400" />
                </div>
              </KickoffModalField>
            </div>

            <KickoffModalField label="Material delivery notes" hint="Optional">
              <textarea
                v-model="materialNotes"
                rows="3"
                class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                placeholder="Example: Pallets can go on the driveway, please avoid blocking the garage."
              />
            </KickoffModalField>

            <KickoffModalField label="Property access instructions" hint="Optional">
              <div class="relative">
                <textarea
                  v-model="accessNotes"
                  rows="3"
                  class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  placeholder="Gate code, preferred parking, pets, etc."
                />
                <KeyIcon class="absolute right-3 top-2.5 h-5 w-5 text-slate-400" />
              </div>
            </KickoffModalField>

            <div class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Optional attachments (coming soon). Include site photos or permits here.
            </div>

            <p v-if="error" class="text-sm font-semibold text-amber-700">{{ error }}</p>
          </div>

          <div class="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
            <button
              class="w-full rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 sm:w-auto"
              @click="handleClose"
            >
              Cancel
            </button>
            <button
              class="w-full rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400 sm:w-auto"
              :disabled="sending"
              @click="handleSend"
            >
              {{ sending ? "Sending..." : "Send Kickoff Packet" }}
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
.card-enter-active,
.card-leave-active {
  transition: opacity 180ms ease-out, transform 180ms ease-out;
}
.card-enter-from,
.card-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
