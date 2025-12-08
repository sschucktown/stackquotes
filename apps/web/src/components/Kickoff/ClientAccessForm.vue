<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useContractorHQPrototype } from "@/stores/contractorHQPrototype";

const route = useRoute();
const router = useRouter();
const hqStore = useContractorHQPrototype();

const jobId = computed(() => (typeof route.query.job === "string" ? route.query.job : undefined));
const job = computed(() => hqStore.getJob(jobId.value));

const gateCode = ref("");
const pets = ref("");
const parking = ref("");
const lockedAreas = ref("");
const concerns = ref("");

const handleSubmit = () => {
  const id = job.value?.id || "job-maple";
  const combined = [
    gateCode.value ? `Gate code: ${gateCode.value}` : "",
    pets.value ? `Pets: ${pets.value}` : "",
    parking.value ? `Parking: ${parking.value}` : "",
    lockedAreas.value ? `Locked areas: ${lockedAreas.value}` : "",
    concerns.value ? `Concerns: ${concerns.value}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  if (combined) {
    hqStore.setKickoffField("accessInstructions", combined, id);
  }
  if (parking.value) {
    hqStore.setKickoffField("materialDrop", parking.value, id);
  }
  if (concerns.value) {
    hqStore.setKickoffField("preconstructionNotes", concerns.value, id);
  }

  hqStore.markKickoffAccessSubmitted(id);
  hqStore.addTimelineEvent(id, "KICKOFF_ACCESS_SUBMITTED");
  hqStore.addHQAlert("Access instructions submitted by client.");

  router.push({ path: "/prototype/client/kickoff/confirm", query: { job: id } });
};
</script>

<template>
  <main class="min-h-screen bg-slate-50 text-slate-900">
    <div class="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
        <div class="mb-4">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Client Kickoff</p>
          <h1 class="text-2xl font-semibold text-slate-900">Submit access instructions</h1>
          <p class="text-sm text-slate-600">Gate codes, pets, parking directions, or anything else we should know.</p>
        </div>

        <div class="space-y-4">
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="flex flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm shadow-inner">
              <span class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Gate code</span>
              <input
                v-model="gateCode"
                type="text"
                class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="e.g. 2481#"
              />
            </label>
            <label class="flex flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm shadow-inner">
              <span class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Pets</span>
              <input
                v-model="pets"
                type="text"
                class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="Dogs in backyard, cat indoors"
              />
            </label>
          </div>

          <label class="flex flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm shadow-inner">
            <span class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Parking directions</span>
            <textarea
              v-model="parking"
              rows="3"
              class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Driveway ok, avoid blocking garage."
            />
          </label>

          <label class="flex flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm shadow-inner">
            <span class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Locked areas</span>
            <textarea
              v-model="lockedAreas"
              rows="3"
              class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Garage, shed, side gate, etc."
            />
          </label>

          <label class="flex flex-col gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm shadow-inner">
            <span class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Any concerns?</span>
            <textarea
              v-model="concerns"
              rows="3"
              class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              placeholder="Sprinklers, newborn naps, neighbor sensitivities..."
            />
          </label>
        </div>

        <div class="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p class="text-xs text-slate-500">We’ll pass this to the crew lead before arrival.</p>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            @click="handleSubmit"
          >
            Submit access info
          </button>
        </div>
      </div>
    </div>
  </main>
</template>
