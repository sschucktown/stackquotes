<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <SQButton
          v-for="status in statuses"
          :key="status.value"
          :variant="activeStatus === status.value ? 'primary' : 'ghost'"
          size="sm"
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

    <div class="grid gap-3">
      <SQCard
        v-for="estimate in estimates"
        :key="estimate.id"
        padded
        class="cursor-pointer hover:border-sq-primary/40"
        @click="$emit('select', estimate.id)"
      >
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 class="text-base font-semibold text-slate-900">{{ estimate.projectTitle }}</h4>
            <p class="text-sm text-slate-500">
              {{ new Date(estimate.createdAt).toLocaleDateString() }} • Total {{ currency(estimate.total) }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <SQBadge :tone="toneForStatus(estimate.status)">{{ estimate.status }}</SQBadge>
            <SQButton size="sm" variant="ghost" @click.stop="$emit('duplicate', estimate.id)">
              Duplicate
            </SQButton>
          </div>
        </div>
      </SQCard>
    </div>

    <p v-if="!estimates.length" class="text-center text-sm text-slate-500">
      No estimates yet. Create your first estimate to get started.
    </p>
  </div>
</template>

<script setup lang="ts">
import type { Estimate } from "@stackquotes/types";
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    estimates: Estimate[];
    status?: Estimate["status"] | undefined;
    search?: string;
  }>(),
  {
    estimates: () => [],
    status: undefined,
    search: "",
  }
);

const emit = defineEmits<{
  (e: "select", id: string): void;
  (e: "duplicate", id: string): void;
  (e: "update:status", status?: Estimate["status"]): void;
  (e: "update:search", value: string): void;
}>();

const statuses: Array<{ value: Estimate["status"] | undefined; label: string }> = [
  { value: undefined, label: "All" },
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent" },
  { value: "accepted", label: "Accepted" },
  { value: "declined", label: "Declined" },
];

const activeStatus = computed(() => props.status);
const search = computed(() => props.search);

const currency = (value: number) => `$${value.toFixed(2)}`;

const toneForStatus = (status: Estimate["status"]) => {
  switch (status) {
    case "accepted":
      return "success";
    case "declined":
      return "danger";
    case "sent":
      return "warning";
    default:
      return "default";
  }
};

const setStatus = (value: Estimate["status"] | undefined) => {
  emit("update:status", value);
};

const onSearchInput = (value: string | number | null | undefined) => {
  emit("update:search", typeof value === "string" ? value : value?.toString() ?? "");
};
</script>
