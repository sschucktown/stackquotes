import { computed, reactive } from "vue";
import type { LineItem } from "@stackquotes/types";

export interface EstimateFormPayload {
  projectTitle: string;
  clientId: string;
  notes: string;
  lineItems: LineItemDraft[];
}

interface LineItemDraft extends LineItem {}

const createId = () => (typeof crypto !== "undefined" ? crypto.randomUUID() : Math.random().toString(36).slice(2));

const createLineItem = (): LineItemDraft => ({
  id: createId(),
  description: "",
  quantity: 1,
  unitPrice: 0,
  total: 0,
});

export const useEstimateForm = (initial?: Partial<EstimateFormPayload>) => {
  const state = reactive<EstimateFormPayload>({
    projectTitle: initial?.projectTitle ?? "",
    clientId: initial?.clientId ?? "",
    notes: initial?.notes ?? "",
    lineItems:
      initial?.lineItems?.map((item) => ({
        ...item,
        id: item.id ?? createId(),
      })) ?? [createLineItem()],
  });

  const subtotal = computed(() =>
    state.lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  );

  const total = computed(() => subtotal.value);

  const addLineItem = () => {
    state.lineItems.push(createLineItem());
  };

  const removeLineItem = (id: string) => {
    if (state.lineItems.length === 1) return;
    state.lineItems = state.lineItems.filter((item) => item.id !== id);
  };

  const updateLineItem = (id: string, updates: Partial<LineItemDraft>) => {
    state.lineItems = state.lineItems.map((item) =>
      item.id === id
        ? {
            ...item,
            ...updates,
          }
        : item
    );
  };

  const reset = (payload?: Partial<EstimateFormPayload>) => {
    state.projectTitle = payload?.projectTitle ?? "";
    state.clientId = payload?.clientId ?? "";
    state.notes = payload?.notes ?? "";
    state.lineItems =
      payload?.lineItems?.map((item) => ({
        ...item,
        id: item.id ?? createId(),
      })) ?? [createLineItem()];
  };

  const roundTo = (num: number, places = 2): number => {
    const factor = Math.pow(10, places);
    return Math.round((num + Number.EPSILON) * factor) / factor;
  };

  const toPayload = (): EstimateFormPayload => ({
    projectTitle: state.projectTitle,
    clientId: state.clientId,
    notes: state.notes,
    lineItems: state.lineItems.map((item) => ({
      ...item,
      total: roundTo(item.quantity * item.unitPrice, 2),
    })),
  });

  return {
    state,
    subtotal,
    total,
    addLineItem,
    removeLineItem,
    updateLineItem,
    reset,
    toPayload,
  };
};

