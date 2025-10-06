import type { EmailPayload, EstimateStatus } from "@stackquotes/types";
import { apiFetch } from "@/lib/http";

export const sendEstimateEmail = (payload: EmailPayload) =>
  apiFetch<{ sent: boolean; status: EstimateStatus }>("/email/send", {
    method: "POST",
    body: JSON.stringify(payload),
  });

