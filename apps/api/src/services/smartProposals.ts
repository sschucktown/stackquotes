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
  return notes.length > 600 ? `${notes.slice(0, 597)}...` : notes;
};

const DEFAULT_DEPOSIT: ProposalDepositConfig = { type: "percentage", value: 30 };

const deriveTierFromName = (name: string): "good" | "better" | "best" => {
  const lower = (name ?? "").toLowerCase();
  if (lower.includes("best")) return "best";
  if (lower.includes("better")) return "better";
  return "good";
};

const normaliseTrade = (trade?: string | null): string => {
  if (!trade) return "generic";
  const trimmed = trade.trim().toLowerCase();
  return trimmed.length ? trimmed : "generic";
};

const withDefaultVisuals = (options: Proposal["options"], trade?: string | null) =>
  options.map((option) => {
    const existing = option.visual ?? null;
    const abstractKey =
      existing?.abstract_key ??
      `${normaliseTrade(trade)}-${deriveTierFromName(option.name ?? "good")}`;
    return {
      ...option,
      visual: {
        abstract_key: abstractKey,
        custom_image_url: existing?.custom_image_url ?? null,
        accent_key: existing?.accent_key ?? null,
      },
    };
  });

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

  const [previous, profile, plan] = await Promise.all([
    getPreviousProposalLineItems(supabase, contractorId, estimate.clientId),
    getContractorProfile(supabase, contractorId),
    supabase.from("users").select("subscription_tier, trial_end").eq("id", contractorId).maybeSingle(),
  ]);

  const branding = {
    businessName: profile?.businessName ?? null,
    trade: profile?.trade ?? profile?.tradeType ?? null,
  };

  // Gating: Launch (non-trial) plans only get a single option (baseline from QuickQuote).
  // Pro/Crew and active trials should receive full Good/Better/Best options.
  const tier = (plan?.data?.subscription_tier as string | undefined)?.toLowerCase?.() ?? "launch";
  const trialEndRaw = plan?.data?.trial_end as string | null | undefined;
  const inTrial = (() => {
    if (typeof trialEndRaw !== "string") return false;
    const d = new Date(trialEndRaw);
    return !Number.isNaN(d.getTime()) && d.getTime() > Date.now();
  })();
  const allowMultiOptions = tier === "pro" || tier === "crew" || inTrial; // paid tiers and active trial allow multi-options

  let options = previous?.options ?? [];
  let depositConfig = previous?.depositConfig ?? null;
  let source: SmartProposalGenerationSource = options.length ? "recycled" : "quickquote";

  if (allowMultiOptions) {
    // On Pro/Crew (or active trial), always ensure the client gets a full
    // Good/Better/Best proposal derived from the current QuickQuote.
    // If a previous proposal only had a single option (e.g. from Launch),
    // regenerate fresh multi-option pricing from the QuickQuote.
    if (options.length <= 1) {
      const draft = createSmartProposalFromLineItems(estimate.lineItems, branding);
      options = draft.options;
      depositConfig = depositConfig ?? draft.deposit ?? DEFAULT_DEPOSIT;
      source = "quickquote";
    } else if (!depositConfig) {
      // Preserve existing multi-option structure but normalise deposit config when missing.
      const draft = createSmartProposalFromLineItems(estimate.lineItems, branding);
      depositConfig = draft.deposit ?? DEFAULT_DEPOSIT;
    }
  } else {
    // Launch / non-trial: reuse previous proposal structure when available,
    // otherwise fall back to a single-option baseline from the QuickQuote.
    if (!options.length) {
      const draft = createSmartProposalFromLineItems(estimate.lineItems, branding);
      options = draft.options;
      depositConfig = draft.deposit ?? DEFAULT_DEPOSIT;
      source = "quickquote";
    } else if (!depositConfig) {
      const draft = createSmartProposalFromLineItems(estimate.lineItems, branding);
      depositConfig = draft.deposit ?? DEFAULT_DEPOSIT;
    }

    if (options.length > 1) {
      const better = options.find((o) => o.name?.toLowerCase?.() === "better");
      options = [better ?? options[0]];
    }
  }

  if (!depositConfig) {
    depositConfig = DEFAULT_DEPOSIT;
  }

  options = withDefaultVisuals(options, branding.trade);

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
