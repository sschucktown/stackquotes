import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { useAuth } from "@/lib/auth";
import type { EstimateStatus, LineItem } from "@stackquotes/types";
import { createQuickQuote } from "@modules/quickquote/api/create";
import { updateQuickQuote } from "@modules/quickquote/api/update";
import { getQuickQuoteById } from "@modules/quickquote/api/get";
import { sendQuickQuote } from "@modules/quickquote/api/send";
import { mapStatusFromEstimate, mapStatusToEstimate } from "@modules/quickquote/api/status";

export type QuickQuoteStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "approved"
  | "changes_requested";

export interface QuickQuoteLineItem {
  id: string;
  title: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface QuickQuoteClient {
  name: string;
  email: string;
  phone?: string;
}

export interface QuickQuoteJob {
  address: string;
  type: string;
  notes: string;
}

export interface QuickQuoteTotals {
  subtotal: number;
  tax: number;
  total: number;
}

export interface QuickQuote {
  id: string;
  contractor_id: string;
  client: QuickQuoteClient;
  job: QuickQuoteJob;
  line_items: QuickQuoteLineItem[];
  totals: QuickQuoteTotals;
  status: QuickQuoteStatus;
  created_at: string;
  updated_at: string;
  client_id?: string | null;
}

const round2 = (value: number): number => Math.round(value * 100) / 100;

const numberOrZero = (value: unknown): number => {
  const n = typeof value === "string" ? parseFloat(value) : Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
};

const createLineItemId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `qq_li_${Math.random().toString(36).slice(2, 10)}`;

const toEstimateStatus = (status: QuickQuoteStatus): EstimateStatus =>
  mapStatusToEstimate(status);

const toLineItems = (items: QuickQuoteLineItem[]): LineItem[] =>
  items.map((item) => ({
    id: item.id,
    description: item.title || item.description || "",
    quantity: item.quantity,
    unitPrice: item.unit_price,
    total: item.total,
  }));

const buildNotes = (job: QuickQuoteJob): string => {
  const parts: string[] = [];
  if (job.notes?.trim()) {
    parts.push(job.notes.trim());
  }
  if (job.address?.trim()) {
    parts.push(`Job address: ${job.address.trim()}`);
  }
  return parts.join("\n\n");
};

export const useQuickQuoteStore = defineStore("quickquote-v2", () => {
  const current = ref<QuickQuote | null>(null);
  const loading = ref(false);
  const saving = ref(false);
  const sending = ref(false);
  const error = ref<string | null>(null);
  const lastSentTo = ref<string | null>(null);
  const lastApprovalUrl = ref<string | null>(null);

  const ensureQuote = (): QuickQuote => {
    if (!current.value) {
      throw new Error("No active QuickQuote");
    }
    return current.value;
  };

  const recalcTotals = () => {
    if (!current.value) return;
    const subtotal = current.value.line_items.reduce((sum, item) => {
      const qty = numberOrZero(item.quantity);
      const unit = numberOrZero(item.unit_price);
      return sum + qty * unit;
    }, 0);
    const roundedSubtotal = round2(subtotal);
    current.value.totals.subtotal = roundedSubtotal;
    current.value.totals.tax = 0;
    current.value.totals.total = roundedSubtotal;
    current.value.updated_at = new Date().toISOString();
  };

  const createNewQuote = () => {
    const { user } = useAuth();
    const now = new Date().toISOString();
    const contractorId = user.value?.id ?? "";
    current.value = {
      id: "",
      contractor_id: contractorId,
      client: {
        name: "",
        email: "",
        phone: undefined,
      },
      job: {
        address: "",
        type: "",
        notes: "",
      },
      line_items: [],
      totals: {
        subtotal: 0,
        tax: 0,
        total: 0,
      },
      status: "draft",
      created_at: now,
      updated_at: now,
      client_id: null,
    };
  };

  const loadQuote = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const quote = await getQuickQuoteById(id);
      if (!quote) {
        throw new Error("QuickQuote not found");
      }
      current.value = {
        ...quote,
        status: mapStatusFromEstimate(quote.status as EstimateStatus),
      };
      recalcTotals();
    } catch (e) {
      console.error("[quickquote] loadQuote failed", e);
      error.value = e instanceof Error ? e.message : "Unable to load QuickQuote.";
    } finally {
      loading.value = false;
    }
  };

  const setClient = (payload: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  }) => {
    if (!current.value) return;
    current.value.client_id = payload.id;
    current.value.client = {
      name: payload.name,
      email: payload.email,
      phone: payload.phone ?? undefined,
    };
    current.value.updated_at = new Date().toISOString();
  };

  const setClientById = (
    id: string,
    clients: Array<{ id: string; name: string; email: string; phone?: string | null }>
  ) => {
    if (!current.value) return;
    const client = clients.find((c) => c.id === id);
    if (!client) {
      current.value.client_id = id;
      return;
    }
    setClient(client);
  };

  const updateJob = (patch: Partial<QuickQuoteJob>) => {
    if (!current.value) return;
    current.value.job = {
      ...current.value.job,
      ...patch,
    };
    current.value.updated_at = new Date().toISOString();
  };

  const addLineItem = () => {
    if (!current.value) {
      createNewQuote();
    }
    const quote = ensureQuote();
    quote.line_items.push({
      id: createLineItemId(),
      title: "",
      description: "",
      quantity: 1,
      unit_price: 0,
      total: 0,
    });
    recalcTotals();
  };

  const updateLineItem = (id: string, patch: Partial<QuickQuoteLineItem>) => {
    if (!current.value) return;
    const idx = current.value.line_items.findIndex((item) => item.id === id);
    if (idx === -1) return;
    const existing = current.value.line_items[idx];
    const next: QuickQuoteLineItem = {
      ...existing,
      ...patch,
    };
    const qty = numberOrZero(next.quantity);
    const unit = numberOrZero(next.unit_price);
    next.total = round2(qty * unit);
    current.value.line_items.splice(idx, 1, next);
    recalcTotals();
  };

  const removeLineItem = (id: string) => {
    if (!current.value) return;
    current.value.line_items = current.value.line_items.filter((item) => item.id !== id);
    recalcTotals();
  };

  const reorderLineItem = (fromIndex: number, toIndex: number) => {
    if (!current.value) return;
    const items = current.value.line_items;
    if (
      fromIndex < 0 ||
      fromIndex >= items.length ||
      toIndex < 0 ||
      toIndex >= items.length
    ) {
      return;
    }
    const [moved] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, moved);
    recalcTotals();
  };

  const updateTotals = () => {
    recalcTotals();
  };

  const saveDraft = async () => {
    if (!current.value) {
      createNewQuote();
    }
    const quote = ensureQuote();
    if (!quote.client_id) {
      throw new Error("Client is required before saving a QuickQuote.");
    }
    if (!quote.line_items.length) {
      throw new Error("Add at least one line item before saving.");
    }
    saving.value = true;
    error.value = null;
    try {
      const payloadLineItems = toLineItems(quote.line_items);
      const notes = buildNotes(quote.job);
      const estimateStatus: EstimateStatus = toEstimateStatus("draft");

      if (!quote.id) {
        const created = await createQuickQuote({
          clientId: quote.client_id,
          projectTitle: quote.job.type || "QuickQuote",
          lineItems: payloadLineItems,
          notes,
          status: estimateStatus,
        });
        current.value = created;
      } else {
        const updated = await updateQuickQuote(quote.id, {
          clientId: quote.client_id,
          projectTitle: quote.job.type || "QuickQuote",
          lineItems: payloadLineItems,
          notes,
          status: estimateStatus,
        });
        current.value = updated;
      }
      recalcTotals();
      return current.value;
    } catch (e) {
      console.error("[quickquote] saveDraft failed", e);
      error.value = e instanceof Error ? e.message : "Unable to save QuickQuote.";
      throw e;
    } finally {
      saving.value = false;
    }
  };

  const sendToClient = async () => {
    const quote = await saveDraft();
    if (!quote) {
      throw new Error("Unable to save QuickQuote before sending.");
    }
    if (!quote.client_id || !quote.client.email) {
      throw new Error("Client email is required to send QuickQuote.");
    }
    sending.value = true;
    error.value = null;
    lastSentTo.value = null;
    lastApprovalUrl.value = null;
    try {
      const subject = quote.job.type
        ? `QuickQuote – ${quote.job.type}`
        : "QuickQuote from your contractor";
      const currency = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      });
      const friendlyName = quote.client.name || "there";
      const message = `Hi ${friendlyName},\n\nPlease review your QuickQuote totaling ${currency.format(
        quote.totals.total || 0
      )}.\n\nWhen you're ready to move forward, simply reply to this email and we'll put together a detailed proposal with a few options to choose from.\n`;

      const result = await sendQuickQuote({
        estimateId: quote.id,
        to: quote.client.email,
        subject,
        message,
      });

      lastSentTo.value = quote.client.email;
      lastApprovalUrl.value = result.approvalUrl ?? null;
      current.value.status = "sent";
      current.value.updated_at = new Date().toISOString();
      return result;
    } catch (e) {
      console.error("[quickquote] sendToClient failed", e);
      error.value = e instanceof Error ? e.message : "Unable to send QuickQuote.";
      throw e;
    } finally {
      sending.value = false;
    }
  };

  const subtotal = computed(() => current.value?.totals.subtotal ?? 0);
  const tax = computed(() => current.value?.totals.tax ?? 0);
  const total = computed(() => current.value?.totals.total ?? 0);

  const hasClient = computed(
    () =>
      Boolean(current.value?.client_id) &&
      Boolean(current.value?.client.email) &&
      Boolean(current.value?.client.name)
  );
  const hasLineItems = computed(
    () => (current.value?.line_items.length ?? 0) > 0
  );

  const canSave = computed(() => hasLineItems.value && !saving.value);
  const canSend = computed(
    () => hasClient.value && hasLineItems.value && !sending.value
  );

  return {
    current,
    loading,
    saving,
    sending,
    error,
    lastSentTo,
    lastApprovalUrl,
    subtotal,
    tax,
    total,
    hasClient,
    hasLineItems,
    canSave,
    canSend,
    createNewQuote,
    loadQuote,
    setClient,
    setClientById,
    updateJob,
    addLineItem,
    updateLineItem,
    removeLineItem,
    reorderLineItem,
    updateTotals,
    saveDraft,
    sendToClient,
  };
});

