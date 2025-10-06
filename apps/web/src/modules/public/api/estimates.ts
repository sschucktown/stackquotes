import type { Estimate, PublicEstimatePayload } from "@stackquotes/types";
import { apiFetch } from "@/lib/http";

export const fetchSharedEstimate = (token: string) =>
  apiFetch<PublicEstimatePayload>(`/share/estimate/${token}`);

export const approveSharedEstimate = (token: string, payload: { name?: string } = {}) =>
  apiFetch<Estimate>(`/share/estimate/${token}/approve`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
