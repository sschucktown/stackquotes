import type { QuickQuote } from "@modules/quickquote/stores/useQuickQuoteStore";
import type { EstimateStatus, LineItem } from "@stackquotes/types";
import {
  updateEstimate,
  type EstimatePayload,
} from "@modules/quickquote/api/estimates";
import { getQuickQuoteById } from "@modules/quickquote/api/get";

export interface QuickQuoteUpdateInput {
  clientId: string;
  projectTitle: string;
  lineItems: LineItem[];
  notes: string;
  status: EstimateStatus;
}

export const updateQuickQuote = async (
  id: string,
  input: QuickQuoteUpdateInput
): Promise<QuickQuote> => {
  const payload: Partial<EstimatePayload> = {
    clientId: input.clientId,
    projectTitle: input.projectTitle,
    lineItems: input.lineItems,
    notes: input.notes,
    taxRate: 0,
    status: input.status,
  };
  const { data, error } = await updateEstimate(id, payload);
  if (error || !data) {
    throw new Error(error || "Unable to update QuickQuote.");
  }
  const quote = await getQuickQuoteById(data.id);
  if (!quote) {
    throw new Error("QuickQuote updated but could not be reloaded.");
  }
  return quote;
};

