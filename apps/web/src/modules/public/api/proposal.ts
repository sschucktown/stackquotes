import type { Client, Proposal, ProposalDepositConfig } from "@stackquotes/types";
import { apiFetch } from "@/lib/http";

export interface PublicProposalContractorBranding {
  businessName: string | null;
  accentColor: string | null;
  logoUrl: string | null;
  email?: string | null;
}

export interface PublicProposalDepositMeta {
  amount: number;
  config: ProposalDepositConfig | null;
}

export interface PublicProposalPayload {
  proposal: Proposal;
  contractor: PublicProposalContractorBranding | null;
  client: Client | null;
  deposit: PublicProposalDepositMeta;
  paymentLinkUrl: string | null;
}

export const fetchPublicProposal = (token: string) =>
  apiFetch<PublicProposalPayload>(`/share/proposal/${encodeURIComponent(token)}`);
