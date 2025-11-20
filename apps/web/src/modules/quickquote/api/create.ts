import type { QuickQuote } from "@modules/quickquote/stores/useQuickQuoteStore";
import type { EstimateStatus, LineItem } from "@stackquotes/types";
import {
  createEstimate,
  type EstimatePayload,
} from "@modules/quickquote/api/estimates";
import { getQuickQuoteById } from "@modules/quickquote/api/get";

export interface QuickQuoteCreateInput {
  clientId: string;
  projectTitle: string;
  lineItems: LineItem[];
  notes: string;
  status: EstimateStatus;
}

export const createQuickQuote = async (
  input: QuickQuoteCreateInput
): Promise<QuickQuote> => {
  const payload: EstimatePayload & { source: string } = {
    clientId: input.clientId,
    projectTitle: input.projectTitle,
    lineItems: input.lineItems,
    notes: input.notes,
    taxRate: 0,
    status: input.status,
    source: "quickquote",
  };
  const { data, error } = await createEstimate(payload);
  if (error || !data) {
    throw new Error(error || "Unable to create QuickQuote.");
  }
  const quote = await getQuickQuoteById(data.id);
  if (!quote) {
    throw new Error("QuickQuote created but could not be loaded.");
  }
  return quote;
};
