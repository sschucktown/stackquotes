<template>
  <form class="space-y-6" @submit.prevent="onSubmit">
    <SQInput
      v-model="state.projectTitle"
      label="Project Title"
      placeholder="Example Remodel"
      required
    />

    <ClientSelect v-model="state.clientId" />

    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-slate-700">Line Items</h3>
        <SQButton type="button" size="sm" variant="ghost" @click="addLineItem">Add Line Item</SQButton>
      </div>
      <div class="space-y-4">
        <LineItemRow
          v-for="item in state.lineItems"
          :key="item.id"
          :line-item="item"
          :removable="state.lineItems.length > 1"
          @update="updateLineItem(item.id, $event)"
          @remove="removeLineItem"
        />
      </div>
    </div>

    <SQTextarea v-model="state.notes" label="Notes" placeholder="Additional details" rows="3" />

    <TotalsBar
      :subtotal="subtotal"
      :total="total"
    />

    <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
      <SQButton type="submit" :loading="submitting" :disabled="!isValid">
        {{ submitLabel }}
      </SQButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import type { Estimate } from "@stackquotes/types";
import ClientSelect from "./ClientSelect.vue";
import LineItemRow from "./LineItemRow.vue";
import TotalsBar from "./TotalsBar.vue";
import { useEstimateForm, type EstimateFormPayload } from "@modules/quickquote/composables/useEstimateForm";

const props = withDefaults(
  defineProps<{
    modelValue?: Estimate | null;
    submitting?: boolean;
    submitLabel?: string;
  }>(),
  {
    modelValue: null,
    submitting: false,
    submitLabel: "Save Estimate",
  }
);

const emit = defineEmits<{
  (e: "submit", payload: EstimateFormPayload): void;
}>();

const {
  state,
  subtotal,
  total,
  addLineItem,
  removeLineItem,
  updateLineItem,
  reset,
  toPayload,
} = useEstimateForm(props.modelValue ?? undefined);

watch(
  () => props.modelValue,
  (value) => {
    if (value) {
      reset({
        projectTitle: value.projectTitle,
        clientId: value.clientId,
        notes: value.notes ?? "",
        lineItems: value.lineItems,
      });
    }
  },
  { immediate: true }
);

const submitLabel = computed(() => props.submitLabel);
const submitting = computed(() => props.submitting);

const isValid = computed(() =>
  Boolean(
    state.projectTitle &&
      state.clientId &&
      state.lineItems.every((item) => item.description && item.quantity > 0)
  )
);

const onSubmit = () => {
  if (!isValid.value) return;
  emit("submit", toPayload());
};
</script>
