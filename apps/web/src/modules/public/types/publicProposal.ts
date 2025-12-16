import type { ProposalOption, ProposalDepositConfig } from "@stackquotes/types";

export interface PublicProposal {
  publicToken: string;
  status: "sent" | "accepted" | "paid";
  title: string;
  description?: string | null;
  options: ProposalOption[];
  depositConfig: ProposalDepositConfig | null;
}
