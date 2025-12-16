import type { ProposalOption, ProposalDepositConfig } from "@stackquotes/types";

export interface PublicProposalViewModel {
  id: string;
  publicToken: string;
  status: "sent" | "accepted";
  title: string;
  description?: string | null;

  options: ProposalOption[];
  depositConfig: ProposalDepositConfig | null;

  contractor: {
    businessName: string | null;
    logoUrl: string | null;
    accentColor: string | null;
    email?: string | null;
  } | null;

  paymentLinkUrl: string | null;
}
