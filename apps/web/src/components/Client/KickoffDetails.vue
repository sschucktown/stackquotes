<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { CheckCircleIcon, PhoneIcon, UserIcon, TruckIcon, ClipboardDocumentCheckIcon } from "@heroicons/vue/24/outline";
import KickoffDetailCard from "@/components/Kickoff/KickoffDetailCard.vue";
import { apiFetch } from "@/lib/http";

const route = useRoute();
const router = useRouter();

const fallback = {
  proposalId: (route.params.id as string) || "proposal-123",
  startDate: "2025-12-18",
  arrivalWindow: "8:00–10:00 AM",
  leadName: "Jordan Smith",
  leadPhone: "(555) 123-4567",
  materialNotes: "Materials staged on driveway; please leave space open.",
  accessNotes: "Gate code 2481; watch for the dog in the backyard.",
};

const checklist = ref([
  { id: "access", label: "Confirm yard/gate access", done: false },
  { id: "utilities", label: "Mark utilities", done: false },
  { id: "parking", label: "Plan parking", done: false },
  { id: "neighbors", label: "Notify neighbors", done: false },
  { id: "pets", label: "Pets/kids plan", done: false },
]);

const payload = computed(() => {
  const decoded = (() => {
    const raw = route.query.payload;
    if (!raw) return null;
    try {
      const val = Array.isArray(raw) ? raw[0] : raw;
      return JSON.parse(decodeURIComponent(String(val)));
    } catch {
      return null;
    }
  })();
  return decoded?.kickoff || decoded || fallback;
});

const progress = computed(() => checklist.value.filter((item) => item.done).length);
const progressPercent = computed(() =>
  checklist.value.length ? Math.round((progress.value / checklist.value.length) * 100) : 0
);

const toggle = (id: string) => {
  checklist.value = checklist.value.map((item) =>
    item.id === id ? { ...item, done: !item.done } : item
  );
};

const startDateLabel = computed(() => {
  const d = payload.value.startDate ? new Date(payload.value.startDate) : null;
  if (!d || Number.isNaN(d.getTime())) return payload.value.startDate;
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
});

const hasNotes = computed(() => Boolean((payload.value.materialNotes && payload.value.materialNotes.trim()) || (payload.value.accessNotes && payload.value.accessNotes.trim())));

onMounted(async () => {
  const proposalId = payload.value.proposalId;
  if (!proposalId) return;
  await apiFetch("/kickoff/viewed", {
    method: "POST",
    body: JSON.stringify({ proposalId }),
  });
});
</script>

<template>
  <main class="min-h-screen bg-slate-50 text-slate-900">
    <div class="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Transition name="fade">
        <div class="rounded-2xl border border-slate-200 bg-white px-5 py-8 shadow-sm">
          <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircleIcon class="h-9 w-9" />
          </div>
          <h1 class="mt-6 text-center text-2xl font-semibold">Your Project Kickoff Details</h1>
          <p class="mt-2 text-center text-sm text-slate-600">Here’s everything you need before day one.</p>
          <p class="mt-1 text-center text-xs text-slate-500">Start date · {{ startDateLabel }}</p>
        </div>
      </Transition>

      <TransitionGroup name="stagger" tag="div" class="mt-6 space-y-4">
        <KickoffDetailCard title="Crew arrival">
          <div class="space-y-3 text-sm text-slate-800">
            <div class="flex items-center gap-2">
              <TruckIcon class="h-5 w-5 text-slate-500" />
              <span class="text-lg font-semibold text-slate-900">{{ payload.arrivalWindow }}</span>
            </div>
            <div class="flex flex-wrap items-center gap-2 text-slate-600">
              <UserIcon class="h-5 w-5 text-slate-500" />
              <span class="font-semibold text-slate-900">{{ payload.leadName }}</span>
              <a class="inline-flex items-center gap-1 text-blue-600 underline-offset-4 hover:underline" :href="`tel:${payload.leadPhone}`">
                <PhoneIcon class="h-4 w-4" />
                <span>{{ payload.leadPhone }}</span>
              </a>
            </div>
            <div class="h-px bg-slate-200"></div>
            <p class="text-xs text-slate-500">The crew may adjust for weather or traffic.</p>
          </div>
        </KickoffDetailCard>

        <KickoffDetailCard title="Pre-construction checklist">
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-semibold text-slate-900">{{ progress }} of {{ checklist.length }} done</p>
            <div class="h-2 w-36 rounded-full bg-slate-100">
              <div class="h-2 rounded-full bg-emerald-500 transition-all" :style="{ width: `${progressPercent}%` }"></div>
            </div>
          </div>
          <div class="space-y-2">
            <button
              v-for="item in checklist"
              :key="item.id"
              type="button"
              class="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm font-semibold text-slate-800 transition hover:bg-white"
              @click="toggle(item.id)"
            >
              <span>{{ item.label }}</span>
              <span
                class="grid h-6 w-6 place-items-center rounded-full border transition-transform duration-140"
                :class="item.done ? 'border-emerald-500 bg-emerald-50 text-emerald-600 scale-105' : 'border-slate-300 bg-white text-slate-400'"
              >
                <span v-if="item.done">✓</span>
              </span>
            </button>
          </div>
        </KickoffDetailCard>

        <KickoffDetailCard
          v-if="hasNotes"
          title="Materials & Access Notes"
        >
          <div class="space-y-2 text-sm text-slate-700">
            <div v-if="payload.materialNotes" class="rounded-xl bg-slate-50 px-3 py-2">
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Material delivery</p>
              <p class="text-sm text-slate-800">{{ payload.materialNotes }}</p>
            </div>
            <div v-if="payload.accessNotes" class="rounded-xl bg-slate-50 px-3 py-2">
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Access notes</p>
              <p class="text-sm text-slate-800">{{ payload.accessNotes }}</p>
            </div>
          </div>
        </KickoffDetailCard>

        <KickoffDetailCard title="What happens next">
          <ul class="list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>You’ll receive a reminder before the start date.</li>
            <li>Crew will arrive in the provided window.</li>
            <li>Any changes will be communicated by your contractor.</li>
          </ul>
        </KickoffDetailCard>
      </TransitionGroup>

      <div class="mt-8 flex justify-center">
        <button
          class="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          @click="router.back()"
        >
          Back to project
        </button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.25s ease-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
.stagger-enter-active {
  transition: all 0.25s ease-out;
}
.stagger-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.stagger-enter-active > * {
  transition-delay: 35ms;
}
</style>
