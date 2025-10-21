import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@stackquotes/db";
import {
  createProposalRecord,
  findProposalByQuickquote,
  getContractorProfile,
  getEstimate,
  getPreviousProposalLineItems,
} from "@stackquotes/db";
import type { Proposal, ProposalDepositConfig } from "@stackquotes/types";
import { createSmartProposalFromLineItems } from "../lib/smartProposal.js";

const normaliseTitle = (projectTitle?: string | null): string => {
  if (!projectTitle) {
    return "SmartProposal";
  }
  return `${projectTitle} SmartProposal`;
};

const normaliseDescription = (notes?: string | null): string | null => {
  if (!notes) return null;
  return notes.length > 600 ? `${notes.slice(0, 597)}…` : notes;
};

const DEFAULT_DEPOSIT: ProposalDepositConfig = { type: "percentage", value: 30 };

export interface GenerateSmartProposalParams {
  supabase: SupabaseClient;
  contractorId: string;
  quickquoteId: string;
}

export type SmartProposalGenerationSource = "existing" | "recycled" | "quickquote";

export interface GenerateSmartProposalResult {
  proposal: Proposal;
  created: boolean;
  source: SmartProposalGenerationSource;
}

export const generateSmartProposalFromQuote = async ({
  supabase,
  contractorId,
  quickquoteId,
}: GenerateSmartProposalParams): Promise<GenerateSmartProposalResult> => {
  const existing = await findProposalByQuickquote(supabase, contractorId, quickquoteId);
  if (existing) {
    return { proposal: existing, created: false, source: "existing" };
  }

  const estimate = await getEstimate(supabase, contractorId, quickquoteId);
  if (!estimate) {
    throw new Error("Estimate not found");
  }

  const [previous, profile] = await Promise.all([
    getPreviousProposalLineItems(supabase, contractorId, estimate.clientId),
    getContractorProfile(supabase, contractorId),
  ]);

  const branding = { businessName: profile?.businessName ?? null };

  let options = previous?.options ?? [];
  let depositConfig = previous?.depositConfig ?? null;
  let source: SmartProposalGenerationSource = "recycled";

  if (!options.length) {
    const draft = createSmartProposalFromLineItems(estimate.lineItems, branding);
    options = draft.options;
    depositConfig = draft.deposit ?? DEFAULT_DEPOSIT;
    source = "quickquote";
  } else if (!depositConfig) {
    const draft = createSmartProposalFromLineItems(estimate.lineItems, branding);
    depositConfig = draft.deposit ?? DEFAULT_DEPOSIT;
  }

  if (!depositConfig) {
    depositConfig = DEFAULT_DEPOSIT;
  }

  const proposal = await createProposalRecord(supabase, {
    userId: contractorId,
    clientId: estimate.clientId,
    quickquoteId,
    title: normaliseTitle(estimate.projectTitle),
    description: normaliseDescription(estimate.notes),
    options,
    status: "draft",
    depositConfig,
  });

  return { proposal, created: true, source };
};

export const ensureProposalToken = (proposal: Proposal): string => {
  if (proposal.publicToken) {
    return proposal.publicToken;
  }
  return randomUUID();
};

const selectPreferredOption = (proposal: Proposal): { name: string; subtotal: number } | null => {
  if (!proposal.options.length) return null;
  const better = proposal.options.find(
    (option) => option.name?.toLowerCase?.() === "better"
  );
  const target = better ?? proposal.options[0];
  return { name: target.name, subtotal: target.subtotal };
};

export interface DepositComputationContext {
  override?: ProposalDepositConfig | null;
  optionName?: string | null;
}

export const computeDepositAmount = (
  proposal: Proposal,
  context: DepositComputationContext = {}
): { amount: number; config: ProposalDepositConfig | null } => {
  const depositConfig = context.override ?? proposal.depositConfig ?? null;
  if (!depositConfig) {
    return { amount: 0, config: null };
  }

  if (depositConfig.type === "fixed") {
    return {
      amount: Math.round(Math.max(depositConfig.value, 0) * 100) / 100,
      config: depositConfig,
    };
  }

  const base =
    (context.optionName &&
      proposal.options.find(
        (option) => option.name?.toLowerCase?.() === context.optionName?.toLowerCase?.()
      )) ||
    selectPreferredOption(proposal);

  if (!base || base.subtotal <= 0) {
    return { amount: 0, config: depositConfig };
  }

  const amount = Math.round(base.subtotal * (depositConfig.value / 100) * 100) / 100;
  return { amount, config: depositConfig };
};
