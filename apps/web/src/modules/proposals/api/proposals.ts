import type {
  ApiResponse,
  Proposal,
  ProposalDepositConfig,
  ProposalOption,
} from "@stackquotes/types";
import { apiFetch } from "@/lib/http";

const buildQuery = (params?: { limit?: number }) => {
  if (!params?.limit) return "";
  const search = new URLSearchParams();
  search.set("limit", String(params.limit));
  const query = search.toString();
  return query ? `?${query}` : "";
};

export interface ProposalSavePayload {
  id?: string;
  clientId: string;
  quickquoteId?: string | null;
  title: string;
  description?: string | null;
  options: ProposalOption[];
  deposit?: ProposalDepositConfig | null;
}

export interface ProposalSendPayload {
  id: string;
  subject?: string;
  message?: string;
  deposit?: ProposalDepositConfig | null;
}

export const fetchProposals = (params?: { limit?: number }) =>
  apiFetch<Proposal[]>(`/proposals/list${buildQuery(params)}`);

export const fetchProposal = (id: string) => apiFetch<Proposal>(`/proposals/${id}`);

export const fetchPreviousLineItems = (clientId: string) =>
  apiFetch<{ options: ProposalOption[]; deposit?: ProposalDepositConfig | null } | null>(
    `/proposals/previous-line-items?clientId=${encodeURIComponent(clientId)}`
  );

export const generateSmartProposal = (estimateId: string) =>
  apiFetch<Proposal>("/proposals/generate", {
    method: "POST",
    body: JSON.stringify({ estimateId }),
  }) as Promise<ApiResponse<Proposal> & { meta?: { created?: boolean; source?: string } }>;

export const saveProposal = (payload: ProposalSavePayload) =>
  apiFetch<Proposal>("/proposals/save", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const sendProposal = (payload: ProposalSendPayload) =>
  apiFetch<Proposal>("/proposals/send", {
    method: "POST",
    body: JSON.stringify(payload),
  }) as Promise<ApiResponse<Proposal> & { meta?: { paymentLinkUrl?: string | null; depositAmount?: number } }>;

export const acceptProposalOption = (proposalId: string, optionName: string) =>
  apiFetch<Proposal>("/proposals/accept", {
    method: "POST",
    body: JSON.stringify({ proposalId, optionName }),
  });
