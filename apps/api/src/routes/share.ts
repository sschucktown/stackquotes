import { Hono } from "hono";
import { z } from "zod";
import {
  getEstimateByApprovalToken,
  getClient,
  getUserSettings,
  approveEstimateByToken,
  updateEstimateStatus,
  createProposalEvent,
  findProposalEventByToken,
  findContractorProfileBySlug,
  getContractorProfile,
  getProposalSummaryForUser,
  listProposals,
  getProposalByToken,
  updateProposalStatus,
} from "@stackquotes/db";
import type { Proposal } from "@stackquotes/types";
import { getServiceClient } from "../lib/supabase.js";
import { generateSmartProposalFromQuote } from "../services/smartProposals.js";
import { computeDepositAmount } from "../services/smartProposals.js";
import { getEstimatePdfSignedUrl } from "../lib/storage.js";
import { createDepositPaymentLink } from "../lib/stripe.js";

const tokenParams = z.object({
  token: z.string().uuid(),
});

const slugParams = z.object({
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(30, "Slug must be at most 30 characters")
    .regex(/^[a-z0-9-]+$/i, "Slug can only include letters, numbers, and hyphens"),
});

const approveBody = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(120, "Name must be 120 characters or fewer")
      .optional(),
  })
  .strict()
  .optional();

const proposalTokenParams = z.object({
  token: z.string().uuid(),
});

const proposalAcceptBody = z.object({
  optionName: z.string().min(1, "Option selection is required"),
});

const normaliseTrade = (trade?: string | null): string => {
  if (!trade) return "generic";
  const trimmed = trade.trim().toLowerCase();
  return trimmed.length ? trimmed : "generic";
};

const deriveTierFromName = (name: string): "good" | "better" | "best" => {
  const lower = (name ?? "").toLowerCase();
  if (lower.includes("best")) return "best";
  if (lower.includes("better")) return "better";
  return "good";
};

const ensureVisuals = (options: Proposal["options"], trade?: string | null) =>
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

export const shareRouter = new Hono();

shareRouter.get("/estimate/:token", async (c) => {
  const { token } = tokenParams.parse(c.req.param());
  const supabase = getServiceClient();
  let estimate = await getEstimateByApprovalToken(supabase, token);
  if (!estimate) {
    c.status(404);
    return c.json({ error: "This approval link is invalid or has expired." });
  }

  if (estimate.status === "sent") {
    try {
      estimate = await updateEstimateStatus(supabase, {
        userId: estimate.userId,
        estimateId: estimate.id,
        status: "seen",
      });
      await createProposalEvent(supabase, {
        userId: estimate.userId,
        estimateId: estimate.id,
        event: "seen",
      });
    } catch (error) {
      console.error("[api/share] failed to mark estimate as seen", error);
    }
  }

  const client = await getClient(supabase, estimate.userId, estimate.clientId);
  if (!client) {
    c.status(404);
    return c.json({ error: "Client not found for this estimate." });
  }
  const settings = await getUserSettings(supabase, estimate.userId);
  const downloadUrl = await getEstimatePdfSignedUrl(estimate.userId, estimate.id);

  return c.json({
    data: {
      estimate,
      client,
      settings,
      downloadUrl,
    },
  });
});

shareRouter.post("/estimate/:token/approve", async (c) => {
  const { token } = tokenParams.parse(c.req.param());
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    body = undefined;
  }
  const parsed = approveBody.parse(body);
  const supabase = getServiceClient();
  const estimate = await approveEstimateByToken(supabase, token, {
    approverName: parsed?.name ?? null,
  });
  if (!estimate) {
    c.status(400);
    return c.json({ error: "This approval link is invalid or has expired." });
  }
  // Best-effort: generate SmartProposal from this accepted QuickQuote
  try {
    await generateSmartProposalFromQuote({
      supabase,
      contractorId: estimate.userId,
      quickquoteId: estimate.id,
    });
  } catch (e) {
    console.error("[share/approve] failed to generate smart proposal", e);
  }
  return c.json({ data: estimate });
});
shareRouter.post("/estimate/:token/decline", async (c) => {
  const { token } = tokenParams.parse(c.req.param());
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    body = undefined;
  }
  const parsed = approveBody.safeParse(body);
  const supabase = getServiceClient();
  const estimate = await getEstimateByApprovalToken(supabase, token);
  if (!estimate) {
    c.status(400);
    return c.json({ error: "This approval link is invalid or has expired." });
  }
  const updated = await updateEstimateStatus(supabase, {
    userId: estimate.userId,
    estimateId: estimate.id,
    status: "declined",
    approvedBy: parsed.success ? parsed.data?.name ?? null : null,
    approvedAt: null,
  });
  return c.json({ data: updated });
});

shareRouter.get("/proposal/:token", async (c) => {
  const { token } = proposalTokenParams.parse(c.req.param());
  const supabase = getServiceClient();
  const proposal = await getProposalByToken(supabase, token);
  if (!proposal) {
    c.status(404);
    return c.json({ error: "This proposal link is invalid or has expired." });
  }

  const [settings, contractorProfile, client, plan] = await Promise.all([
    getUserSettings(supabase, proposal.userId),
    getContractorProfile(supabase, proposal.userId),
    getClient(supabase, proposal.userId, proposal.clientId).catch(() => null),
    supabase
      .from("users")
      .select("subscription_tier, trial_end")
      .eq("id", proposal.userId)
      .maybeSingle(),
  ]);
  const selectedOption = proposal.acceptedOption ?? null;
  // Launch (non-trial) contractors: show only one baseline option to clients
  const tier = (plan?.data?.subscription_tier as string | undefined)?.toLowerCase?.() ?? "launch";
  const trialEndRaw = plan?.data?.trial_end as string | null | undefined;
  const inTrial = (() => {
    if (typeof trialEndRaw !== "string") return false;
    const d = new Date(trialEndRaw);
    return !Number.isNaN(d.getTime()) && d.getTime() > Date.now();
  })();
  const allowMultiOptions = tier === "pro" || tier === "crew";
  const visualTrade = contractorProfile?.trade ?? contractorProfile?.tradeType ?? null;
  const visibleOptions = (() => {
    if (allowMultiOptions) return proposal.options;
    const better = proposal.options.find((o) => o.name?.toLowerCase?.() === "better");
    return [better ?? proposal.options[0]].filter(Boolean);
  })();
  const optionsForClient = ensureVisuals(visibleOptions, visualTrade);
  const proposalForClient = allowMultiOptions
    ? { ...proposal, options: ensureVisuals(proposal.options, visualTrade) }
    : {
        ...proposal,
        options: optionsForClient,
        totals: optionsForClient.map((o) => ({ name: o.name, total: o.subtotal })),
      };
  const depositMeta = selectedOption
    ? computeDepositAmount(proposalForClient, { optionName: selectedOption })
    : computeDepositAmount(proposalForClient);

  // Record a proposal view event linked to the originating QuickQuote when available.
  try {
    if (proposal.sentAt && proposal.quickquoteId) {
      const existing = await findProposalEventByToken(supabase, token, {
        event: "proposal_view",
        estimateId: proposal.quickquoteId,
      });
      if (!existing) {
        await createProposalEvent(supabase, {
          userId: proposal.userId,
          estimateId: proposal.quickquoteId,
          event: "proposal_view",
          token,
          metadata: { source: "public_proposal" },
        });
      }
    }
  } catch (e) {
    console.error("[api/share] failed to record proposal view", e);
  }

  return c.json({
    data: {
      proposal: proposalForClient,
      contractor: settings || contractorProfile
        ? {
            businessName: contractorProfile?.businessName ?? settings?.companyName ?? null,
            accentColor: settings?.accentColor ?? null,
            logoUrl: contractorProfile?.logoUrl ?? settings?.logoUrl ?? null,
            email: contractorProfile?.email ?? null,
          }
        : null,
      client,
      deposit: {
        amount: selectedOption ? depositMeta.amount : null,
        config: depositMeta.config,
      },
      paymentLinkUrl: selectedOption ? proposal.paymentLinkUrl ?? null : null,
      plan: {
        tier,
        allowMultiOptions,
        wowPortalEnabled: allowMultiOptions,
        inTrial,
      },
    },
  });
});

shareRouter.post("/proposal/:token/accept", async (c) => {
  const { token } = proposalTokenParams.parse(c.req.param());
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    body = undefined;
  }
  const parsed = proposalAcceptBody.parse(body ?? {});
  const supabase = getServiceClient();
  const proposal = await getProposalByToken(supabase, token);
  if (!proposal) {
    c.status(404);
    return c.json({ error: "This proposal link is invalid or has expired." });
  }

  const [client, plan] = await Promise.all([
    getClient(supabase, proposal.userId, proposal.clientId).catch(() => null),
    supabase.from("users").select("subscription_tier, trial_end").eq("id", proposal.userId).maybeSingle(),
  ]);

  const tier = (plan?.data?.subscription_tier as string | undefined)?.toLowerCase?.() ?? "launch";
  const allowMultiOptions = tier === "pro" || tier === "crew";
  const allowedOptions = allowMultiOptions
    ? proposal.options
    : [
        proposal.options.find((o) => o.name?.toLowerCase?.() === "better") ?? proposal.options[0],
      ].filter(Boolean);
  const selected =
    allowedOptions.find(
      (option) => option.name?.toLowerCase?.() === parsed.optionName.toLowerCase()
    ) ?? null;
  if (!selected) {
    c.status(400);
    return c.json({ error: "Selected package is not available for this proposal." });
  }

  const depositMeta = computeDepositAmount(proposal, { optionName: selected.name });
  const depositAmount = depositMeta.amount;

  let paymentLinkUrl: string | null = null;
  let paymentLinkId: string | null = null;
  if (depositAmount > 0) {
    const link = await createDepositPaymentLink({
      amount: depositAmount,
      proposalTitle: proposal.title,
      contractorId: proposal.userId,
      proposalId: proposal.id,
      customerName: client?.name ?? null,
    });
    if (link) {
      paymentLinkUrl = link.url;
      paymentLinkId = link.id;
    }
  }

  const data = await updateProposalStatus(supabase, {
    userId: proposal.userId,
    proposalId: proposal.id,
    status: "accepted",
    acceptedOption: selected.name,
    depositAmount,
    depositConfig: depositMeta.config ?? null,
    paymentLinkUrl,
    paymentLinkId,
  });
  return c.json({
    data,
    meta: {
      depositAmount,
      paymentLinkUrl,
    },
  });
});

// Public proposal comments
shareRouter.get("/proposal/:token/comments", async (c) => {
  const { token } = proposalTokenParams.parse(c.req.param());
  const supabase = getServiceClient();

  const proposal = await getProposalByToken(supabase, token);
  if (!proposal) {
    c.status(404);
    return c.json({ error: "This proposal link is invalid or has expired." });
  }

  const { data, error } = await supabase
    .from("proposal_comments")
    .select("*")
    .eq("proposal_id", proposal.id)
    .order("created_at", { ascending: true });

  if (error) {
    c.status(500);
    return c.json({ error: error.message });
  }
  return c.json({ data: data ?? [] });
});

shareRouter.post("/proposal/:token/comments", async (c) => {
  const { token } = proposalTokenParams.parse(c.req.param());

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    body = {};
  }

  const parsed = z
    .object({
      message: z.string().min(1).max(2000),
      authorName: z.string().max(120).optional(),
      avatarUrl: z.string().url().optional(),
      authorRole: z.enum(["contractor", "client"]).optional(),
    })
    .parse(body ?? {});

  const supabase = getServiceClient();
  const proposal = await getProposalByToken(supabase, token);
  if (!proposal) {
    c.status(404);
    return c.json({ error: "This proposal link is invalid or has expired." });
  }

  let authorName = parsed.authorName ?? null;
  if (!authorName) {
    try {
      const client = await getClient(supabase, proposal.userId, proposal.clientId).catch(() => null);
      authorName = client?.name ?? null;
    } catch {}
  }

  const { data, error } = await supabase
    .from("proposal_comments")
    .insert({
      proposal_id: proposal.id,
      author_role: parsed.authorRole ?? "client",
      author_name: authorName,
      avatar_url: parsed.avatarUrl ?? null,
      message: parsed.message,
    })
    .select("*")
    .single();

  if (error) {
    c.status(500);
    return c.json({ error: error.message });
  }

  return c.json({ data });
});

shareRouter.get("/profile/:slug", async (c) => {
  const { slug } = slugParams.parse(c.req.param());
  const supabase = getServiceClient();
  const profile = await findContractorProfileBySlug(supabase, slug.toLowerCase());
  if (!profile) {
    c.status(404);
    return c.json({ error: "This public profile could not be found." });
  }

  const [summary, proposals, settings] = await Promise.all([
    getProposalSummaryForUser(supabase, profile.userId),
    listProposals(supabase, profile.userId),
    getUserSettings(supabase, profile.userId),
  ]);

  const acceptanceRate = summary.totalProposals
    ? Math.round((summary.acceptedProposals / summary.totalProposals) * 100)
    : 0;
  const highlightedProposals = proposals.slice(0, 3).map((proposal) => ({
    id: proposal.id,
    quickquoteId: proposal.quickquoteId,
    status: proposal.status,
    totals: proposal.totals,
    options: proposal.options,
    createdAt: proposal.createdAt,
  }));

  const toNullableString = (value: string | null | undefined) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  };

  const branding = {
    accentColor: toNullableString(settings?.accentColor),
    companyName: toNullableString(settings?.companyName) ?? toNullableString(profile.businessName),
    logoUrl: toNullableString(profile.logoUrl) ?? toNullableString(settings?.logoUrl),
    footerText: toNullableString(settings?.footerText),
  };

  const hasBrandingContent =
    branding.accentColor !== null ||
    branding.companyName !== null ||
    branding.logoUrl !== null ||
    branding.footerText !== null;

  return c.json({
    data: {
      profile,
      metrics: {
        totalProposals: summary.totalProposals,
        acceptedProposals: summary.acceptedProposals,
        acceptanceRate,
        revenueYtd: summary.revenueYtd,
        averageValue: summary.averageValue,
      },
      proposals: highlightedProposals,
      branding: hasBrandingContent ? branding : null,
    },
  });
});

