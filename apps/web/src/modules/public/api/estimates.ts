import type { PublicEstimatePayload } from "@stackquotes/types";
import { apiFetch } from "@/lib/http";

export const fetchSharedEstimate = (token: string) =>
  apiFetch<PublicEstimatePayload>(`/share/estimate/${token}`);
