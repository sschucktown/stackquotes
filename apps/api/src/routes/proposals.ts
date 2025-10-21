import { Hono } from "hono";
import { z } from "zod";
import {
  createProposalRecord,
  getClient,
  getContractorProfile,
  getProposalById,
  getPreviousProposalLineItems,
  listProposals,
  updateProposalRecord,
  updateProposalStatus,
} from "@stackquotes/db";
import type { ProposalDepositConfig, ProposalOption } from "@stackquotes/types";
import { loadServerConfig } from "@stackquotes/config";
import { requireUser } from "../lib/auth.js";
import { getServiceClient } from "../lib/supabase.js";
import {
  computeDepositAmount,
  ensureProposalToken,
  generateSmartProposalFromQuote,
} from "../services/smartProposals.js";
import { sendEstimateEmail } from "../lib/email.js";
import { createDepositPaymentLink } from "../lib/stripe.js";

const listSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

const generateSchema = z.object({
  estimateId: z.string().uuid(),
});

const optionLineItemSchema = z.object({
  id: z.string().uuid().optional(),
  description: z.string().min(1),
  quantity: z.number().min(0),
  unitCost: z.number().min(0),
  total: z.number().min(0).optional(),
});

const optionSchema = z.object({
  name: z.string().min(1),
  summary: z.string().optional().nullable(),
  multiplier: z.number().optional().nullable(),
  lineItems: z.array(optionLineItemSchema).min(1),
  subtotal: z.number().min(0).optional(),
});

const depositSchema = z.object({
  type: z.enum(["percentage", "fixed"]),
  value: z.number().min(0),
});

const saveSchema = z.object({
  id: z.string().uuid().optional(),
  clientId: z.string().uuid(),
  quickquoteId: z.string().uuid().optional().nullable(),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  options: z.array(optionSchema).min(1),
  deposit: depositSchema.optional(),
});

const sendSchema = z.object({
  id: z.string().uuid(),
  subject: z.string().optional(),
  message: z.string().optional(),
  deposit: depositSchema.optional(),
});

const previousSchema = z.object({
  clientId: z.string().uuid(),
});

const getSchema = z.object({
  id: z.string().uuid(),
});

const acceptSchema = z.object({
  proposalId: z.string().uuid(),
  optionName: z.string().min(1),
});

const DEFAULT_DEPOSIT: ProposalDepositConfig = { type: "percentage", value: 30 };

const roundCurrency = (value: number): number => Math.round(value * 100) / 100;

const sanitizeOption = (option: z.infer<typeof optionSchema>): ProposalOption => {
  const lineItems = option.lineItems.map((item) => {
    const quantity = Number(item.quantity ?? 0);
    const unitCost = Number(item.unitCost ?? 0);
    const total = roundCurrency(item.total !== undefined ? item.total : quantity * unitCost);
    return {
      id: item.id,
      description: item.description,
      quantity,
      unitCost,
      total,
    };
  });
  const subtotal = roundCurrency(lineItems.reduce((sum, item) => sum + item.total, 0));
  return {
    name: option.name,
    summary: option.summary ?? null,
    multiplier: option.multiplier ?? null,
    lineItems,
    subtotal,
  };
};

const sanitizeOptions = (options: z.infer<typeof optionSchema>[]): ProposalOption[] =>
  options.map((option) => sanitizeOption(option));

const resolveDepositConfig = (
  input: z.infer<typeof depositSchema> | undefined,
  fallback?: ProposalDepositConfig | null
): ProposalDepositConfig => {
  if (input) {
    return {
      type: input.type,
      value: roundCurrency(input.value),
    };
  }
  if (fallback) {
    return fallback;
  }
  return DEFAULT_DEPOSIT;
};

const escapeHtml = (value: string): string =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const getBaseAppUrl = (): string => {
  const config = loadServerConfig();
  const base =
    config.BASE_APP_URL ||
    (config.BASE_API_URL ? config.BASE_API_URL.replace(/\/api$/, "") : null) ||
    "https://stackquotes.app";
  return base.replace(/\/$/, "");
};

interface EmailTemplateParams {
  contractorName: string;
  messageHtml?: string | null;
  proposalUrl: string;
  paymentLinkUrl?: string | null;
  proposalTitle: string;
  depositDisplay?: string | null;
}

const buildProposalEmailHtml = (params: EmailTemplateParams): string => {
  const messageBlock = params.messageHtml ? `<p style="margin:16px 0 24px;">${params.messageHtml}</p>` : "";
  const depositBlock = params.depositDisplay
    ? `<p style="margin:0 0 16px; font-weight:600;">Deposit due: ${params.depositDisplay}</p>`
    : "";
  const paymentLinkBlock = params.paymentLinkUrl
    ? `<a href="${params.paymentLinkUrl}" style="display:inline-block;margin-top:12px;padding:12px 20px;background:#0ea5e9;color:#ffffff;text-decoration:none;border-radius:8px;">Pay Deposit</a>`
    : "";

  return `
    <div style="font-family:Inter,Segoe UI,sans-serif;font-size:16px;color:#0f172a;">
      <p style="margin:0 0 16px;">${params.contractorName} invited you to review the proposal <strong>${escapeHtml(
        params.proposalTitle
      )}</strong>.</p>
      ${messageBlock}
      ${depositBlock}
      <a href="${params.proposalUrl}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:8px;">View Proposal</a>
      ${paymentLinkBlock}
      <p style="margin:24px 0 0;font-size:14px;color:#475569;">If the button above does not work, copy and paste this link:<br />${params.proposalUrl}</p>
    </div>
  `;
};

export const proposalsRouter = new Hono();

proposalsRouter.get("/list", async (c) => {
  const user = await requireUser(c);
  const query = listSchema.parse(c.req.query());
  const supabase = getServiceClient();
  const data = await listProposals(supabase, user.id);
  const limited = typeof query.limit === "number" ? data.slice(0, query.limit) : data;
  return c.json({ data: limited });
});

proposalsRouter.get("/previous-line-items", async (c) => {
  const user = await requireUser(c);
  const query = previousSchema.parse(c.req.query());
  const supabase = getServiceClient();
  const previous = await getPreviousProposalLineItems(supabase, user.id, query.clientId);
  if (!previous) {
    return c.json({ data: null });
  }
  return c.json({ data: { options: previous.options, deposit: previous.depositConfig } });
});

proposalsRouter.get("/:id", async (c) => {
  const user = await requireUser(c);
  const params = getSchema.parse(c.req.param());
  const supabase = getServiceClient();
  const proposal = await getProposalById(supabase, user.id, params.id);
  if (!proposal) {
    c.status(404);
    return c.json({ error: "Proposal not found" });
  }
  return c.json({ data: proposal });
});

proposalsRouter.post("/generate", async (c) => {
  const user = await requireUser(c);
  const payload = generateSchema.parse(await c.req.json());
  const supabase = getServiceClient();
  const result = await generateSmartProposalFromQuote({
    supabase,
    contractorId: user.id,
    quickquoteId: payload.estimateId,
  });
  return c.json({
    data: result.proposal,
    meta: { created: result.created, source: result.source },
  });
});

proposalsRouter.post("/save", async (c) => {
  const user = await requireUser(c);
  const payload = saveSchema.parse(await c.req.json());
  const supabase = getServiceClient();
  const options = sanitizeOptions(payload.options);

  if (payload.id) {
    const existing = await getProposalById(supabase, user.id, payload.id);
    if (!existing) {
      c.status(404);
      return c.json({ error: "Proposal not found" });
    }
    const depositConfig = resolveDepositConfig(payload.deposit, existing.depositConfig ?? null);
    const data = await updateProposalRecord(supabase, {
      userId: user.id,
      proposalId: payload.id,
      clientId: payload.clientId,
      quickquoteId: payload.quickquoteId ?? existing.quickquoteId ?? null,
      title: payload.title,
      description: payload.description ?? null,
      options,
      status: "draft",
      depositConfig,
    });
    return c.json({ data });
  }

  const depositConfig = resolveDepositConfig(payload.deposit, null);
  const data = await createProposalRecord(supabase, {
    userId: user.id,
    clientId: payload.clientId,
    quickquoteId: payload.quickquoteId ?? null,
    title: payload.title,
    description: payload.description ?? null,
    options,
    status: "draft",
    depositConfig,
  });
  return c.json({ data });
});

proposalsRouter.post("/send", async (c) => {
  const user = await requireUser(c);
  const payload = sendSchema.parse(await c.req.json());
  const supabase = getServiceClient();

  const proposal = await getProposalById(supabase, user.id, payload.id);
  if (!proposal) {
    c.status(404);
    return c.json({ error: "Proposal not found" });
  }

  const client = await getClient(supabase, user.id, proposal.clientId);
  if (!client) {
    c.status(404);
    return c.json({ error: "Client not found" });
  }

  const depositConfig = resolveDepositConfig(payload.deposit, proposal.depositConfig ?? null);
  const selectedOption = proposal.acceptedOption ?? null;
  const depositMeta = selectedOption
    ? computeDepositAmount(proposal, { override: depositConfig, optionName: selectedOption })
    : { amount: 0, config: depositConfig };
  const depositAmount = selectedOption ? depositMeta.amount : 0;

  const token = ensureProposalToken(proposal);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const sentAt = new Date().toISOString();

  let paymentLinkUrl = depositAmount > 0 ? proposal.paymentLinkUrl ?? null : null;
  let paymentLinkId = depositAmount > 0 ? proposal.paymentLinkId ?? null : null;
  if (depositAmount > 0 && !paymentLinkUrl) {
    const link = await createDepositPaymentLink({
      amount: depositAmount,
      proposalTitle: proposal.title,
      contractorId: user.id,
      proposalId: proposal.id,
      customerName: client.name,
    });
    if (link) {
      paymentLinkUrl = link.url;
      paymentLinkId = link.id;
    }
  }

  const updated = await updateProposalStatus(supabase, {
    userId: user.id,
    proposalId: proposal.id,
    status: "sent",
    acceptedOption: proposal.acceptedOption ?? null,
    depositAmount,
    depositConfig,
    publicToken: token,
    publicTokenExpiresAt: expiresAt,
    sentAt,
    paymentLinkUrl,
    paymentLinkId,
  });

  const profile = await getContractorProfile(supabase, user.id);
  const contractorName = profile?.businessName ?? "Your Contractor";
  const contractorEmail = profile?.email ?? undefined;

  const baseUrl = getBaseAppUrl();
  const proposalUrl = `${baseUrl}/proposal/${token}`;

  const messageHtml = payload.message
    ? escapeHtml(payload.message).replace(/\r?\n/g, "<br />")
    : null;
  const depositDisplay = depositAmount > 0 ? formatCurrency(depositAmount) : null;

  const html = buildProposalEmailHtml({
    contractorName,
    messageHtml,
    proposalUrl,
    paymentLinkUrl: depositAmount > 0 ? paymentLinkUrl : null,
    proposalTitle: updated.title,
    depositDisplay: depositAmount > 0 ? depositDisplay : null,
  });

  const subject = payload.subject?.trim()?.length
    ? payload.subject.trim()
    : `${contractorName} sent you a SmartProposal`;

  await sendEstimateEmail({
    to: client.email,
    subject,
    html,
    contractorName,
    contractorEmail,
  });

  return c.json({
    data: updated,
    meta: {
      paymentLinkUrl,
      depositAmount,
    },
  });
});

proposalsRouter.post("/accept", async (c) => {
  const user = await requireUser(c);
  const payload = acceptSchema.parse(await c.req.json());
  const supabase = getServiceClient();
  const data = await updateProposalStatus(supabase, {
    userId: user.id,
    proposalId: payload.proposalId,
    status: "accepted",
    acceptedOption: payload.optionName,
  });
  return c.json({ data });
});
