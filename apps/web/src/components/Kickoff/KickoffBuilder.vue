<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import MessageLightbox from "@/components/Messaging/MessageLightbox.vue";
import { useContractorHQPrototype, type KickoffState } from "@/stores/contractorHQPrototype";

const router = useRouter();
const route = useRoute();
const hqStore = useContractorHQPrototype();

const jobId = computed(() => (typeof route.query.job === "string" ? route.query.job : undefined));
const job = computed(() => hqStore.getJob(jobId.value));
const kickoff = computed<KickoffState>(() => job.value?.kickoff || ({} as KickoffState));

const setField = (key: keyof KickoffState, value: string) => {
  hqStore.setKickoffField(key, value, jobId.value);
};

const sendPacket = () => {
  const id = job.value?.id || jobId.value || "job-maple";
  hqStore.markKickoffPacketSent(id);
  hqStore.addTimelineEvent(id, "KICKOFF_PACKET_SENT");
  hqStore.addHQAlert("Kickoff packet sent to client.");
  router.push("/prototype/hq");
};

const previewPacket = () => {
  router.push({ path: "/prototype/kickoff/packet", query: { job: jobId.value || job.value?.id || "job-maple" } });
};

onMounted(() => {
  if (!kickoff.value.arrivalWindow) {
    setField("arrivalWindow", "8:00–10:00 AM");
  }
  if (!kickoff.value.weatherPolicy) {
    setField("weatherPolicy", "If weather disrupts work, we reschedule ASAP. No extra charge.");
  }
  if (!kickoff.value.safety) {
    setField("safety", "Crew wears protective gear. Please keep pets/kids clear.");
  }
});

const fieldGroups = computed(() => [
  {
    key: "crewLead",
    label: "Crew lead name",
    placeholder: "Jordan Smith",
    type: "text",
  },
  {
    key: "crewLeadPhone",
    label: "Crew lead phone",
    placeholder: "(555) 123-4567",
    type: "tel",
  },
  {
    key: "arrivalWindow",
    label: "Arrival window",
    placeholder: "8:00–10:00 AM",
    type: "text",
  },
  {
    key: "accessInstructions",
    label: "Access instructions",
    placeholder: "Gate code, pets, parking notes",
    type: "textarea",
  },
  {
    key: "materialDrop",
    label: "Material drop instructions",
    placeholder: "Where to stage deliveries or pallets.",
    type: "textarea",
  },
  {
    key: "preconstructionNotes",
    label: "Pre-construction notes",
    placeholder: "Utility locates, neighbor notices, yard prep.",
    type: "textarea",
  },
  {
    key: "dayOneExpectations",
    label: "Day 1 expectations",
    placeholder: "Crew intro, walk-through, dust control.",
    type: "textarea",
  },
  {
    key: "safety",
    label: "Safety reminders",
    placeholder: "PPE, pets/kids clear, tools staged safely.",
    type: "textarea",
  },
  {
    key: "weatherPolicy",
    label: "Weather policy",
    placeholder: "Rain contingency, reschedule approach.",
    type: "textarea",
  },
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
    <div class="mx-auto flex max-w-5xl flex-col gap-4 px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <header class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 shadow-inner transition hover:bg-slate-200"
            @click="router.push('/prototype/hq')"
          >
            <span class="text-lg leading-none">&larr;</span>
            <span>Back</span>
          </button>
          <div class="flex flex-col">
            <p class="text-lg font-semibold text-slate-900">Kickoff Builder</p>
            <p class="text-sm text-slate-500">Looks like SmartProposal builder, but for day-one details.</p>
          </div>
        </div>
        <span class="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-inner">
          Prototype only
        </span>
      </header>

      <div class="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm sm:px-5">
        🎯 Kickoff Details — we’ll send this to your client.
      </div>

      <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-wide text-slate-700">Kickoff packet</p>
            <p class="text-xs text-slate-500">All in one card so you can fill and send quickly.</p>
          </div>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            @click="previewPacket"
          >
            Preview kickoff packet
          </button>
        </div>

        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <div
            v-for="field in fieldGroups"
            :key="field.key"
            class="flex h-full flex-col rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 shadow-inner"
          >
            <label :for="field.key" class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              {{ field.label }}
            </label>
            <div class="mt-2 flex-1">
              <textarea
                v-if="field.type === 'textarea'"
                :id="field.key"
                :value="(kickoff as any)?.[field.key]"
                rows="3"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                :placeholder="field.placeholder"
                @input="setField(field.key as keyof KickoffState, ($event.target as HTMLTextAreaElement)?.value || '')"
              />
              <input
                v-else
                :id="field.key"
                :type="field.type"
                :value="(kickoff as any)?.[field.key]"
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                :placeholder="field.placeholder"
                @input="setField(field.key as keyof KickoffState, ($event.target as HTMLInputElement)?.value || '')"
              />
            </div>
          </div>
        </div>

        <div class="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p class="text-xs text-slate-500">Two-column grid on desktop; stacked on mobile. Everything saves instantly.</p>
          <div class="flex flex-wrap items-center gap-3">
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
              @click="previewPacket"
            >
              Preview Packet
            </button>
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              @click="sendPacket"
            >
              Send Kickoff Packet
            </button>
          </div>
        </div>
      </section>
    </div>
    <MessageLightbox :open="messageOpen" :job-id="job?.id || jobId" actor="contractor" @close="closeMessage" />
  </main>
</template>
