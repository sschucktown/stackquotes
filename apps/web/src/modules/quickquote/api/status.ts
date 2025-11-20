import type { QuickQuoteStatus } from "@modules/quickquote/stores/useQuickQuoteStore";
import type { EstimateStatus } from "@stackquotes/types";
import {
  acceptEstimate,
  declineEstimate,
  updateEstimate,
} from "@modules/quickquote/api/estimates";

export const mapStatusToEstimate = (status: QuickQuoteStatus): EstimateStatus => {
  switch (status) {
    case "draft":
      return "draft";
    case "sent":
      return "sent";
    case "viewed":
      return "seen";
    case "approved":
      return "accepted";
    case "changes_requested":
      return "declined";
    default:
      return "draft";
  }
};

export const mapStatusFromEstimate = (status: EstimateStatus): QuickQuoteStatus => {
  switch (status) {
    case "draft":
      return "draft";
    case "sent":
      return "sent";
    case "seen":
      return "viewed";
    case "accepted":
      return "approved";
    case "declined":
      return "changes_requested";
    default:
      return "draft";
  }
};

export const updateQuickQuoteStatus = async (
  id: string,
  status: QuickQuoteStatus
): Promise<void> => {
  if (status === "approved") {
    const { error } = await acceptEstimate(id);
    if (error) throw new Error(error);
    return;
  }
  if (status === "changes_requested") {
    const { error } = await declineEstimate(id);
    if (error) throw new Error(error);
    return;
  }
  const estimateStatus = mapStatusToEstimate(status);
  const { error } = await updateEstimate(id, { status: estimateStatus });
  if (error) throw new Error(error);
};

