<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import MessageLightbox from "@/components/Messaging/MessageLightbox.vue";
import { useContractorHQPrototype } from "@/stores/contractorHQPrototype";

const route = useRoute();
const router = useRouter();
const hqStore = useContractorHQPrototype();

const jobId = computed(() => (typeof route.query.job === "string" ? route.query.job : undefined));
const job = computed(() => hqStore.getJob(jobId.value));
const kickoff = computed(() => job.value?.kickoff || {});

const missingItems = computed(() => {
  const items: string[] = [];
  if (!kickoff.value.clientSubmittedAccess) items.push("Access instructions");
  if (!kickoff.value.materialDrop) items.push("Material drop location");
  if (!kickoff.value.clientConfirmed) items.push("Client confirmation");
  return items;
});

const viewPacket = () => {
  router.push({ path: "/prototype/kickoff/packet", query: { job: job.value?.id || jobId.value } });
};

const openAccessForm = () => {
  router.push({ path: "/prototype/client/kickoff/access", query: { job: job.value?.id || jobId.value } });
};

const openMessage = () => {
  router.push({ query: { ...route.query, msg: "open" } });
};

const statusItems = computed(() => [
  { label: "Kickoff Packet Sent", active: Boolean(kickoff.value.packetSentAt) },
  { label: "Viewed", active: Boolean(kickoff.value.packetViewedAt) },
  { label: "Client Confirmed", active: Boolean(kickoff.value.clientConfirmed) },
  { label: "Access Submitted", active: Boolean(kickoff.value.clientSubmittedAccess) },
]);

const messageOpen = computed(() => route.query.msg === "open");
const closeMessage = () => {
  const query = { ...route.query };
  delete query.msg;
  router.replace({ query });
};
</script>

<template>
  <main class="min-h-screen bg-slate-50 text-slate-900">
    <div class="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Client Dashboard</p>
            <h1 class="text-2xl font-semibold text-slate-900">Kickoff overview</h1>
            <p class="text-sm text-slate-600">Crew arrival window, access, and day-one prep.</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <span
              v-for="status in statusItems"
              :key="status.label"
              class="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold"
              :class="status.active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-600'"
            >
              <span class="h-2 w-2 rounded-full" :class="status.active ? 'bg-emerald-500' : 'bg-slate-300'"></span>
              {{ status.label }}
            </span>
          </div>
        </div>

        <div class="mt-6 rounded-2xl border border-slate-200 bg-gradient-to-r from-emerald-50 to-white px-4 py-3 shadow-inner">
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-sm font-semibold text-slate-800">
              Crew arrival window: <span class="text-slate-900">{{ kickoff.arrivalWindow || "Pending window" }}</span>
            </p>
            <span
              v-if="kickoff.clientConfirmed"
              class="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm"
            >
              You’re all set for kickoff
            </span>
          </div>
          <p class="text-xs text-slate-600">Material drop: {{ kickoff.materialDrop || "Tell us where to place pallets." }}</p>
          <p class="text-xs text-slate-600">Access needed: gate code / pets / garage</p>
        </div>

        <div class="mt-5 grid gap-4 sm:grid-cols-2">
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Kickoff packet summary</p>
            <ul class="mt-2 space-y-1 text-sm text-slate-700">
              <li><strong>Crew lead:</strong> {{ kickoff.crewLead || "TBD" }} ({{ kickoff.crewLeadPhone || "Phone TBD" }})</li>
              <li><strong>Arrival:</strong> {{ kickoff.arrivalWindow || "Pending" }}</li>
              <li><strong>Safety:</strong> {{ kickoff.safety || "Standard PPE, keep pets/kids clear." }}</li>
            </ul>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Access checklist</p>
            <p class="mt-2 text-sm text-slate-700">{{ kickoff.accessInstructions || "Share gate codes, pets, parking, or anything we should know." }}</p>
            <div class="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm transition hover:bg-blue-100"
                @click="viewPacket"
              >
                View full kickoff packet
              </button>
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                @click="openAccessForm"
              >
                Submit access instructions
              </button>
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
                @click="openMessage"
              >
                Message contractor
              </button>
            </div>
          </div>
        </div>

        <div class="mt-5 rounded-2xl border border-dashed border-slate-200 bg-white p-4 shadow-inner">
          <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Missing items</p>
          <div class="mt-2 flex flex-wrap items-center gap-2">
            <span
              v-if="!missingItems.length"
              class="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
            >
              All kickoff items covered
            </span>
            <span
              v-for="item in missingItems"
              :key="item"
              class="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700"
            >
              {{ item }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <MessageLightbox :open="messageOpen" :job-id="job?.id || jobId" actor="client" @close="closeMessage" />
  </main>
</template>
