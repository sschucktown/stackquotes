import type { Client, Proposal, ProposalDepositConfig } from "@stackquotes/types";
import { apiFetch } from "@/lib/http";

export interface PublicProposalContractorBranding {
  businessName: string | null;
  accentColor: string | null;
  logoUrl: string | null;
  email?: string | null;
}

export interface PublicProposalDepositMeta {
  amount: number | null;
  config: ProposalDepositConfig | null;
}

export interface PublicProposalPlanMeta {
  tier: string;
  allowMultiOptions: boolean;
  wowPortalEnabled: boolean;
  inTrial?: boolean;
}

export interface PublicProposalPayload {
  proposal: Proposal;
  contractor: PublicProposalContractorBranding | null;
  client: Client | null;
  deposit: PublicProposalDepositMeta;
  paymentLinkUrl: string | null;
  plan?: PublicProposalPlanMeta | null;
}

export const fetchPublicProposal = (token: string) =>
  apiFetch<PublicProposalPayload>(`/share/proposal/${encodeURIComponent(token)}`);

export const acceptPublicProposal = (token: string, optionName: string) =>
  apiFetch<{
    data: Proposal;
    meta?: {
      depositAmount: number;
      paymentLinkUrl: string | null;
    };
  }>(`/share/proposal/${encodeURIComponent(token)}/accept`, {
    method: "POST",
    body: JSON.stringify({ optionName }),
  });
