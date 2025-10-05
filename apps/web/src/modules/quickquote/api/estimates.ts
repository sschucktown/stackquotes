import type { Estimate, EstimateFilters, LineItem } from "@stackquotes/types";
import { apiFetch } from "@/lib/http";

export interface EstimatePayload {
  clientId: string;
  projectTitle: string;
  lineItems: LineItem[];
  notes?: string;
  taxRate?: number;
  status?: Estimate["status"];
  jobId?: string | null;
}

const buildQuery = (filters: EstimateFilters) => {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  const query = params.toString();
  return query ? `?${query}` : "";
};

export const fetchEstimates = (filters: EstimateFilters = {}) =>
  apiFetch<Estimate[]>(`/estimates/list${buildQuery(filters)}`);

export const createEstimate = (payload: EstimatePayload) =>
  apiFetch<Estimate>("/estimates/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateEstimate = (id: string, payload: Partial<EstimatePayload>) =>
  apiFetch<Estimate>("/estimates/update", {
    method: "PATCH",
    body: JSON.stringify({ id, ...payload }),
  });

export const duplicateEstimate = (id: string) =>
  apiFetch<Estimate>("/estimates/duplicate", {
    method: "POST",
    body: JSON.stringify({ id }),
  });

