<template>
  <section
    class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 space-y-4"
  >
    <div>
      <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Project Info
      </p>
      <h2 class="mt-1 text-sm font-semibold text-slate-900">
        Client & Details
      </h2>
    </div>

    <ClientSelect v-model="clientId" />

    <div class="space-y-3">
      <SQInput
        v-model="jobAddress"
        label="Job Address"
        placeholder="Street, city, state"
      />
      <SQInput
        v-model="jobType"
        label="Job Type"
        placeholder="e.g., Premium Deck Install"
      />
      <SQTextarea
        v-model="jobNotes"
        label="Notes"
        rows="4"
        placeholder="Scope, constraints, special requests"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ClientSelect from "@modules/quickquote/components/ClientSelect.vue";
import SQInput from "@stackquotes/ui/components/SQInput.vue";
import SQTextarea from "@stackquotes/ui/components/SQTextarea.vue";
import { useQuickQuoteStore } from "@modules/quickquote/stores/useQuickQuoteStore";
import { useClientStore } from "@modules/quickquote/stores/clientStore";

const store = useQuickQuoteStore();
const clientStore = useClientStore();

const clientId = computed({
  get: () => store.current?.client_id ?? "",
  set: (value: string) => {
    if (!value) return;
    store.setClientById(value, clientStore.items);
  },
});

const jobAddress = computed({
  get: () => store.current?.job.address ?? "",
  set: (value: string) => {
    store.updateJob({ address: value });
  },
});

const jobType = computed({
  get: () => store.current?.job.type ?? "",
  set: (value: string) => {
    store.updateJob({ type: value });
  },
});

const jobNotes = computed({
  get: () => store.current?.job.notes ?? "",
  set: (value: string) => {
    store.updateJob({ notes: value });
  },
});
</script>

