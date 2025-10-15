<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <SQButton
          v-for="status in statuses"
          :key="status.value ?? 'all'"
          :variant="activeStatus === status.value ? 'primary' : 'ghost'"
          size="sm"
          class="transition-colors"
          @click="setStatus(status.value)"
        >
          {{ status.label }}
        </SQButton>
      </div>
      <div class="w-full max-w-xs">
        <SQInput
          :model-value="search"
          placeholder="Search estimates"
          @update:model-value="onSearchInput"
        />
      </div>
    </div>

    <div
      v-if="estimates.length"
      class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr class="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <th class="px-4 py-3">Project</th>
            <th class="px-4 py-3">Client</th>
            <th class="px-4 py-3 text-right">Total</th>
            <th class="px-4 py-3 text-center">Status</th>
            <th class="px-4 py-3 text-right">Updated</th>
            <th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 text-sm text-slate-700">
          <tr
            v-for="estimate in estimates"
            :key="estimate.id"
            class="cursor-pointer transition hover:bg-slate-50"
            @click="$emit('select', estimate.id)"
          >
            <td class="px-4 py-3 font-medium text-slate-900">
              {{ estimate.projectTitle }}
            </td>
            <td class="px-4 py-3">
              {{ clientName(estimate.clientId) }}
            </td>
            <td class="px-4 py-3 text-right font-medium text-slate-900">
              {{ currency(estimate.total) }}
            </td>
            <td class="px-4 py-3 text-center">
              <span
                :class="[
                  statusClassFor(estimateStatus(estimate)),
                  'rounded-full px-2 py-1 text-xs font-medium transition-colors',
                ]"
              >
                {{ statusLabelFor(estimateStatus(estimate)) }}
              </span>
            </td>
            <td class="px-4 py-3 text-right text-slate-500">
              {{ lastUpdated(estimate.updatedAt) }}
            </td>
            <td class="px-4 py-3 text-right">
              <SQButton size="xs" variant="ghost" @click.stop="$emit('duplicate', estimate.id)">
                Duplicate
              </SQButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="text-center text-sm text-slate-500">
      No estimates yet. Create your first estimate to get started.
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Client, Estimate } from "@stackquotes/types";
import { computed } from "vue";
import type { EstimatePipelineStatus } from "@modules/quickquote/stores/estimateStore";
import { derivePipelineStatus, statusClass, statusLabel } from "../utils/status";

const props = withDefaults(
  defineProps<{
    estimates: Estimate[];
    status?: EstimatePipelineStatus | undefined;
    search?: string;
    clients?: Client[];
  }>(),
  {
    estimates: () => [],
    status: undefined,
    search: "",
    clients: () => [],
  }
);

const emit = defineEmits<{
  (e: "select", id: string): void;
  (e: "duplicate", id: string): void;
  (e: "update:status", status?: EstimatePipelineStatus): void;
  (e: "update:search", value: string): void;
}>();

const statuses: Array<{ value: EstimatePipelineStatus | undefined; label: string }> = [
  { value: undefined, label: "All" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "seen", label: "Seen" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
];

const activeStatus = computed(() => props.status);
const search = computed(() => props.search);
const clientDirectory = computed(() => {
  const map = new Map<string, Client>();
  for (const client of props.clients) {
    map.set(client.id, client);
  }
  return map;
});

const currency = (value: number) => `$${value.toFixed(2)}`;
const lastUpdated = (value: string) => new Date(value).toLocaleDateString();
const clientName = (clientId: string) => clientDirectory.value.get(clientId)?.name ?? "-";
const estimateStatus = (estimate: Estimate) => derivePipelineStatus(estimate);
const statusClassFor = (status: EstimatePipelineStatus) => statusClass(status);
const statusLabelFor = (status: EstimatePipelineStatus) => statusLabel(status);

const setStatus = (value: EstimatePipelineStatus | undefined) => {
  emit("update:status", value);
};

const onSearchInput = (value: string | number | null | undefined) => {
  emit("update:search", typeof value === "string" ? value : value?.toString() ?? "");
};
</script>
