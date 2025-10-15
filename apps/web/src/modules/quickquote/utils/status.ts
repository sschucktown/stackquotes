import type { Estimate, EstimateStatus } from "@stackquotes/types";

interface StatusMeta {
  label: string;
  classes: string;
}

const STATUS_META: Record<EstimateStatus, StatusMeta> = {
  draft: {
    label: "Draft",
    classes: "bg-slate-200 text-slate-700",
  },
  sent: {
    label: "Sent",
    classes: "bg-blue-100 text-blue-700",
  },
  seen: {
    label: "Seen",
    classes: "bg-amber-100 text-amber-700",
  },
  accepted: {
    label: "Accepted",
    classes: "bg-emerald-100 text-emerald-700",
  },
  declined: {
    label: "Declined",
    classes: "bg-rose-100 text-rose-700",
  },
};

export const STATUS_ORDER: EstimateStatus[] = ["draft", "sent", "seen", "accepted", "declined"];

export const statusLabel = (status: EstimateStatus): string => STATUS_META[status]?.label ?? status;

export const statusClass = (status: EstimateStatus): string =>
  STATUS_META[status]?.classes ?? "bg-slate-200 text-slate-700";

export const derivePipelineStatus = (estimate: Estimate): EstimateStatus => {
  if (estimate.status === "seen") {
    return "seen";
  }
  const viewedAt = (estimate as { viewedAt?: string | null }).viewedAt;
  if (estimate.status === "sent" && viewedAt) {
    return "seen";
  }
  return estimate.status;
};
