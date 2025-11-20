import type {
  QuickQuote,
  QuickQuoteLineItem,
  QuickQuoteStatus,
} from "@modules/quickquote/stores/useQuickQuoteStore";
import { supabase } from "@/lib/supabase";
import type { EstimateStatus } from "@stackquotes/types";
import { mapStatusFromEstimate } from "@modules/quickquote/api/status";

const cryptoRandomId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `li_${Math.random().toString(36).slice(2, 10)}`;

export const getQuickQuoteById = async (id: string): Promise<QuickQuote | null> => {
  const { data: estimate, error } = await supabase
    .from("estimates")
    .select(
      "id, user_id, client_id, project_title, line_items, subtotal, tax, total, notes, status, created_at, updated_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[quickquote/api/get] failed to load estimate", error);
    throw error;
  }
  if (!estimate) return null;

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("name, email, phone")
    .eq("id", (estimate as any).client_id)
    .maybeSingle();

  if (clientError) {
    console.error("[quickquote/api/get] failed to load client", clientError);
  }

  const rawItems = (estimate as any).line_items as unknown;
  const items: QuickQuoteLineItem[] = Array.isArray(rawItems)
    ? (rawItems as any[]).map((entry) => {
        const quantity = Number(entry.quantity ?? entry.qty ?? 0);
        const unitPrice = Number(entry.unitPrice ?? entry.unit_price ?? 0);
        const total =
          entry.total != null
            ? Number(entry.total)
            : Number.isFinite(quantity) && Number.isFinite(unitPrice)
            ? quantity * unitPrice
            : 0;
        const description =
          typeof entry.description === "string"
            ? entry.description
            : String(entry.description ?? "");
        return {
          id: typeof entry.id === "string" ? entry.id : cryptoRandomId(),
          title: description,
          description: "",
          quantity: Number.isFinite(quantity) ? quantity : 0,
          unit_price: Number.isFinite(unitPrice) ? unitPrice : 0,
          total: Number.isFinite(total) ? total : 0,
        };
      })
    : [];

  const estimateStatus = ((estimate as any).status ?? "draft") as EstimateStatus;
  const status: QuickQuoteStatus = mapStatusFromEstimate(estimateStatus);

  const notes = (estimate as any).notes as string | null;

  const quote: QuickQuote = {
    id: (estimate as any).id,
    contractor_id: (estimate as any).user_id,
    client: {
      name: (client as any)?.name ?? "",
      email: (client as any)?.email ?? "",
      phone: (client as any)?.phone ?? undefined,
    },
    job: {
      address: "",
      type: (estimate as any).project_title ?? "",
      notes: notes ?? "",
    },
    line_items: items,
    totals: {
      subtotal: Number((estimate as any).subtotal ?? 0),
      tax: Number((estimate as any).tax ?? 0),
      total: Number((estimate as any).total ?? 0),
    },
    status,
    created_at: (estimate as any).created_at,
    updated_at: (estimate as any).updated_at,
    client_id: (estimate as any).client_id,
  };

  return quote;
};

