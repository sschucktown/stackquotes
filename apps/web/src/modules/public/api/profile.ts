import type {
  ContractorProfile,
  ProposalOption,
  ProposalSummaryMetrics,
  ProposalTotal,
} from "@stackquotes/types";
import { apiFetch } from "@/lib/http";

export interface PublicContractorProfileProposal {
  id: string;
  quickquoteId: string | null;
  status: string;
  totals: ProposalTotal[];
  options: ProposalOption[];
  createdAt: string;
}

export interface PublicContractorProfileBranding {
  accentColor: string | null;
  companyName: string | null;
  logoUrl: string | null;
  footerText: string | null;
}

export interface PublicContractorProfilePayload {
  profile: ContractorProfile;
  metrics: ProposalSummaryMetrics | null;
  proposals: PublicContractorProfileProposal[];
  branding: PublicContractorProfileBranding | null;
}

export const fetchPublicContractorProfile = (slug: string) =>
  apiFetch<PublicContractorProfilePayload>(`/share/profile/${encodeURIComponent(slug)}`);
