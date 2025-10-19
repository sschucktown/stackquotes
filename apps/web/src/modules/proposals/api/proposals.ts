import type { ApiResponse, Proposal } from "@stackquotes/types";
import { apiFetch } from "@/lib/http";

const buildQuery = (params?: { limit?: number }) => {
  if (!params?.limit) return "";
  const search = new URLSearchParams();
  search.set("limit", String(params.limit));
  const query = search.toString();
  return query ? `?${query}` : "";
};

export const fetchProposals = (params?: { limit?: number }) =>
  apiFetch<Proposal[]>(`/proposals/list${buildQuery(params)}`);

export const generateSmartProposal = (estimateId: string) =>
  apiFetch<Proposal>("/proposals/generate", {
    method: "POST",
    body: JSON.stringify({ estimateId }),
  }) as Promise<ApiResponse<Proposal> & { meta?: { alreadyExists?: boolean } }>;

export const acceptProposalOption = (proposalId: string, optionName: string) =>
  apiFetch<Proposal>("/proposals/accept", {
    method: "POST",
    body: JSON.stringify({ proposalId, optionName }),
  });

