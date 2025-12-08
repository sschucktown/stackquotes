<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import MessageLightbox from "@/components/Messaging/MessageLightbox.vue";
import { useContractorHQPrototype } from "@/stores/contractorHQPrototype";

const route = useRoute();
const router = useRouter();
const hqStore = useContractorHQPrototype();

const jobId = computed(() => (typeof route.query.job === "string" ? route.query.job : undefined));
const job = computed(() => hqStore.getJob(jobId.value));
const kickoff = computed(() => job.value?.kickoff || {});

const viewedAlready = ref(false);

const steps = [
  { id: "ready", title: "Kickoff Ready", subtitle: "Packet sent" },
  { id: "expect", title: "What to Expect", subtitle: "Arrival, safety, day one" },
  { id: "access", title: "Access Instructions", subtitle: "Codes, parking, pets" },
];

const arrivalWindow = computed(() => kickoff.value.arrivalWindow || "Arrival window pending");
const crewLead = computed(() => kickoff.value.crewLead || "Crew lead TBD");
const crewLeadPhone = computed(() => kickoff.value.crewLeadPhone || "(000) 000-0000");

const handleConfirmReady = () => {
  const id = job.value?.id || "job-maple";
  hqStore.markKickoffClientConfirmed(id);
  hqStore.addTimelineEvent(id, "KICKOFF_CLIENT_CONFIRMED");
  hqStore.addHQAlert("Client confirmed kickoff.");
  router.push({ path: "/prototype/client/kickoff/confirm", query: { job: id } });
};

const openAccessForm = () => {
  router.push({ path: "/prototype/client/kickoff/access", query: { job: job.value?.id || jobId.value } });
};

const handleDownload = () => {
  alert("Prototype: PDF download coming soon.");
};

const markViewed = () => {
  const id = job.value?.id || "job-maple";
  if (viewedAlready.value) return;
  viewedAlready.value = true;
  hqStore.markKickoffPacketViewed(id);
  hqStore.addTimelineEvent(id, "KICKOFF_PACKET_VIEWED");
  hqStore.addHQAlert("Client viewed the kickoff packet.");
};

const messageOpen = computed(() => route.query.msg === "open");
const closeMessage = () => {
  const query = { ...route.query };
  delete query.msg;
  router.replace({ query });
};

onMounted(() => {
  if (!kickoff.value.packetViewedAt) {
    markViewed();
  }
});
</script>

<template>
  <main class="min-h-screen bg-slate-100 text-slate-900">
    <div class="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[220px_1fr] lg:px-8">
      <aside class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Kickoff Packet</p>
        <div class="mt-4 space-y-3 border-l-2 border-slate-200 pl-4">
          <div
            v-for="step in steps"
            :key="step.id"
            class="rounded-xl bg-white px-3 py-2 shadow-inner"
          >
            <p class="text-sm font-semibold text-slate-900">{{ step.title }}</p>
            <p class="text-xs text-slate-500">{{ step.subtitle }}</p>
          </div>
        </div>
        <div class="mt-6 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-inner">
          Tesla-style minimalism, with calm neutrals and clean edges.
        </div>
      </aside>

      <section class="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
        <div class="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100"></div>
        <div class="relative flex flex-col gap-6 p-6 sm:p-8">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Client Kickoff Packet</p>
              <h1 class="text-2xl font-semibold text-slate-900">{{ job?.name || "Project" }}</h1>
              <p class="text-sm text-slate-600">Everything you need before day one.</p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-right shadow-sm backdrop-blur">
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Contractor</p>
              <p class="text-sm font-semibold text-slate-900">Kaufmann Construction</p>
              <p class="text-xs text-slate-500">hello@kaufmann.build</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <span class="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md">
              Crew arrival: {{ arrivalWindow }}
            </span>
            <span
              class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold"
              :class="kickoff.packetSentAt ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-700'"
            >
              {{ kickoff.packetSentAt ? "Packet sent" : "Packet not sent" }}
            </span>
            <span
              v-if="kickoff.packetViewedAt"
              class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
            >
              Viewed by client
            </span>
          </div>

          <div class="grid gap-4 lg:grid-cols-2">
            <div class="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-inner">
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Crew lead</p>
              <p class="mt-1 text-lg font-semibold text-slate-900">{{ crewLead }}</p>
              <p class="text-sm text-slate-600">{{ crewLeadPhone }}</p>
              <p class="mt-3 text-xs text-slate-500">Your lead will text before arriving.</p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-inner">
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Weather & Safety</p>
              <p class="mt-1 text-sm font-semibold text-slate-900">Safety reminders</p>
              <p class="text-sm text-slate-700">{{ kickoff.safety || "We follow standard PPE and site safety practices." }}</p>
              <p class="mt-3 text-sm font-semibold text-slate-900">Weather policy</p>
              <p class="text-sm text-slate-700">{{ kickoff.weatherPolicy || "If weather disrupts work, we reschedule ASAP. No extra charge." }}</p>
            </div>
          </div>

          <div class="grid gap-4 lg:grid-cols-3">
            <div class="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-inner">
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Access instructions</p>
              <p class="mt-1 text-sm text-slate-800">{{ kickoff.accessInstructions || "Add gate codes, pets, or parking notes." }}</p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-inner">
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Material drop</p>
              <p class="mt-1 text-sm text-slate-800">{{ kickoff.materialDrop || "Tell us where to stage materials." }}</p>
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-inner">
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Day one expectations</p>
              <p class="mt-1 text-sm text-slate-800">{{ kickoff.dayOneExpectations || "Crew walkthrough, layout confirmation, dust control plan." }}</p>
            </div>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-inner">
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Pre-construction notes</p>
            <p class="mt-1 text-sm text-slate-800">{{ kickoff.preconstructionNotes || "Mark utilities, clear pathways, and share any concerns." }}</p>
          </div>

          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex flex-wrap items-center gap-3">
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
                @click="handleDownload"
              >
                Download PDF (prototype)
              </button>
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                @click="handleConfirmReady"
              >
                I’m ready for kickoff
              </button>
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-100"
                @click="openAccessForm"
              >
                Submit Access Info
              </button>
            </div>
            <button
              type="button"
              class="text-xs font-semibold text-blue-600 underline-offset-4 hover:underline"
              @click="router.push({ query: { ...route.query, msg: 'open' } })"
            >
              Message contractor
            </button>
          </div>
        </div>
      </section>
    </div>

    <MessageLightbox :open="messageOpen" :job-id="job?.id || jobId" actor="client" @close="closeMessage" />
  </main>
</template>
