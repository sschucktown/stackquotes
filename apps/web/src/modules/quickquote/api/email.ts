import type { EmailPayload } from "@stackquotes/types";
import { apiFetch } from "@/lib/http";

export const sendEstimateEmail = (payload: EmailPayload) =>
  apiFetch<{ sent: boolean }>("/email/send", {
    method: "POST",
    body: JSON.stringify(payload),
  });

