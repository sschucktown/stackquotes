import type { ProposalOption, ProposalDepositConfig } from "@stackquotes/types";

export interface PublicProposal {
  id: string;
  title: string;
  description: string | null;
  status: "sent" | "accepted" | "expired";
  publicToken: string;
  options: ProposalOption[];
  depositConfig: ProposalDepositConfig | null;
}
