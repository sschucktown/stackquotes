import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { supabase } from "@/lib/supabase";
import { useContractorProfileStore } from "@modules/contractor/stores/profileStore";
import type { LineItem } from "@stackquotes/types";

export interface TradeTemplate {
  id: string;
  trade_type: string;
  item_label: string;
  description?: string | null;
  default_unit?: string | null;
  default_cost_low?: number | null;
  default_cost_high?: number | null;
  default_notes?: string | null;
}

export interface QuickQuoteItem {
  id: string;
  label: string;
  quantity: number;
  unitPrice: number;
  total: number;
  notes?: string;
  templateId?: string | null;
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const uuid = () => crypto.randomUUID();

const scoreMatch = (query: string, text: string): number => {
  // Lightweight fuzzy: prefer prefix, otherwise substring, else 0
  const q = query.trim().toLowerCase();
  const t = text.toLowerCase();
  if (!q) return 0;
  if (t.startsWith(q)) return 2 + q.length / Math.max(2, t.length);
  const idx = t.indexOf(q);
  if (idx >= 0) return 1 + (q.length / Math.max(2, t.length)) - idx * 0.01;
  return 0;
};

export const useQuoteStore = defineStore("quickquote", () => {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const templates = ref<TradeTemplate[]>([]);
  const query = ref("");
  const items = ref<QuickQuoteItem[]>([]);

  const subtotal = computed(() => round2(items.value.reduce((s, it) => s + it.total, 0)));

  const suggested = computed(() => templates.value.slice(0, 10));

  const suggestions = computed(() => {
    const q = query.value.trim();
    if (!q) return [] as Array<{ template: TradeTemplate; score: number; avg?: number | null }>;
    const scored = templates.value
      .map((t) => ({
        template: t,
        score:
          scoreMatch(q, t.item_label) * 2 +
          (t.description ? scoreMatch(q, t.description) : 0),
      }))
      .filter((e) => e.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((e) => ({
        ...e,
        avg:
          tAvg(e.template.default_cost_low ?? null, e.template.default_cost_high ?? null),
      }));
    return scored;
  });

  const tAvg = (low: number | null, high: number | null): number | null => {
    if (typeof low === "number" && typeof high === "number") return round2((low + high) / 2);
    if (typeof low === "number") return round2(low);
    if (typeof high === "number") return round2(high);
    return null;
  };

  const addFromTemplate = (tpl: TradeTemplate) => {
    const avg = tAvg(tpl.default_cost_low ?? null, tpl.default_cost_high ?? null) ?? 0;
    const q = 1;
    items.value.push({
      id: uuid(),
      label: tpl.item_label,
      quantity: q,
      unitPrice: avg,
      total: round2(avg * q),
      notes: tpl.default_notes ?? undefined,
      templateId: tpl.id,
    });
  };

  const addCustom = () => {
    items.value.push({ id: uuid(), label: "Custom Item", quantity: 1, unitPrice: 0, total: 0 });
  };

  const removeItem = (id: string) => {
    items.value = items.value.filter((it) => it.id !== id);
  };

  const updateItem = (id: string, patch: Partial<QuickQuoteItem>) => {
    const idx = items.value.findIndex((it) => it.id === id);
    if (idx < 0) return;
    const current = items.value[idx];
    const next: QuickQuoteItem = { ...current, ...patch } as QuickQuoteItem;
    const qty = typeof next.quantity === "number" && Number.isFinite(next.quantity) ? next.quantity : 0;
    const unit = typeof next.unitPrice === "number" && Number.isFinite(next.unitPrice) ? next.unitPrice : 0;
    next.total = round2(qty * unit);
    items.value.splice(idx, 1, next);
  };

  const reset = () => {
    items.value = [];
    query.value = "";
    error.value = null;
  };

  const toLineItems = (): LineItem[] =>
    items.value.map((it) => ({
      id: it.id,
      description: it.label,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      total: it.total,
    }));

  const loadTemplatesForTrade = async () => {
    loading.value = true;
    error.value = null;
    try {
      const profileStore = useContractorProfileStore();
      if (!profileStore.profile && !profileStore.loading) {
        await profileStore.load();
      }
      const trade = profileStore.profile?.trade ?? profileStore.profile?.tradeType ?? null;
      if (!trade) {
        templates.value = [];
        return;
      }
      const { data, error: supaError } = await supabase
        .from("trade_templates")
        .select("id, trade_type, item_label, description, default_unit, default_cost_low, default_cost_high, default_notes")
        .eq("trade_type", trade)
        .limit(50);
      if (supaError) throw new Error(supaError.message || "Unable to load templates");
      templates.value = data ?? [];
    } catch (e) {
      console.error("[quickquote] failed to load templates", e);
      error.value = e instanceof Error ? e.message : "Unable to load templates.";
      templates.value = [];
    } finally {
      loading.value = false;
    }
  };

  const saveLineItemsToQuoteTable = async (quoteId: string) => {
    if (!quoteId) return;
    if (items.value.length === 0) return;
    const payload = items.value.map((it) => ({
      quote_id: quoteId,
      item_label: it.label,
      quantity: it.quantity,
      unit_price: it.unitPrice,
      total_price: it.total,
      notes: it.notes ?? null,
    }));
    const { error: supaError } = await supabase.from("quote_line_items").insert(payload);
    if (supaError) throw new Error(supaError.message || "Unable to save line items");
  };

  return {
    // state
    loading,
    error,
    templates,
    items,
    query,
    // derived
    subtotal,
    suggested,
    suggestions,
    // actions
    loadTemplatesForTrade,
    addFromTemplate,
    addCustom,
    removeItem,
    updateItem,
    reset,
    toLineItems,
    saveLineItemsToQuoteTable,
  };
});

