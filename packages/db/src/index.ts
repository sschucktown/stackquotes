import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { loadServerConfig } from "@stackquotes/config";
import type {
  Client,
  ContractorProfile,
  Estimate,
  EstimateFilters,
  LineItem,
  Proposal,
  ProposalEvent,
  ProposalDepositConfig,
  ProposalOption,
  ProposalOptionLineItem,
  ProposalTotal,
  SubscriptionPlanTier,
  SubscriptionRecord,
  SubscriptionStatus,
  PaymentRecord,
  PaymentType,
  UserProjectTemplate,
  UserProposalTemplate,
  UserSettings,
} from "@stackquotes/types";
import { randomUUID } from "node:crypto";

type Json = Record<string, unknown> | Json[] | string | number | boolean | null;

const toJson = <T>(value: T): Json => JSON.parse(JSON.stringify(value)) as Json;

const asNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number") return value;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseProposalLineItems = (value: Json): ProposalOptionLineItem[] => {
  if (!Array.isArray(value)) return [];
  return (value as Array<Record<string, unknown>>).map((entry) => ({
    description: typeof entry.description === "string" ? entry.description : String(entry.description ?? ""),
    quantity: asNumber(entry.quantity, 0),
    unitCost: asNumber((entry.unitCost ?? entry.unit_cost) as unknown, 0),
    total: asNumber(entry.total, 0),
  }));
};

const KNOWN_PLAN_TIERS = new Set<SubscriptionPlanTier>(["starter", "pro", "team"]);
const normalisePlanTier = (value: string | null | undefined): SubscriptionPlanTier => {
  if (!value) return "starter";
  const normalised = value.toLowerCase();
  return KNOWN_PLAN_TIERS.has(normalised as SubscriptionPlanTier)
    ? (normalised as SubscriptionPlanTier)
    : "starter";
};

const KNOWN_SUBSCRIPTION_STATUSES = new Set<SubscriptionStatus>([
  "trialing",
  "active",
  "past_due",
  "incomplete",
  "canceled",
  "incomplete_expired",
  "unpaid",
  "paused",
  "pending",
]);

const normaliseSubscriptionStatus = (
  value: string | null | undefined
): SubscriptionStatus => {
  if (!value) return "pending";
  const normalised = value.toLowerCase();
  return KNOWN_SUBSCRIPTION_STATUSES.has(normalised as SubscriptionStatus)
    ? (normalised as SubscriptionStatus)
    : "pending";
};

const KNOWN_PAYMENT_TYPES = new Set<PaymentType>(["deposit", "upsell", "installment"]);
const normalisePaymentType = (value: string | null | undefined): PaymentType => {
  if (!value) return "deposit";
  const normalised = value.toLowerCase();
  return KNOWN_PAYMENT_TYPES.has(normalised as PaymentType)
    ? (normalised as PaymentType)
    : "deposit";
};

export interface DatabaseEstimateRow {
  id: string;
  user_id: string;
  client_id: string;
  project_title: string;
  line_items: Json;
  subtotal: number;
  tax: number;
  total: number;
  notes: string | null;
  status: string;
  converted_to_proposal: boolean;
  job_id?: string | null;
  approval_token: string | null;
  approval_token_expires_at: string | null;
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseClientRow {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  created_at: string;
}

export interface DatabaseUserSettingsRow {
  user_id: string;
  default_tax_rate: number;
  footer_text: string | null;
  logo_url: string | null;
  company_name: string | null;
  org_id: string | null;
  accent_color: string | null;
  estimate_template: string | null;
}

export interface DatabaseProposalEventRow {
  id: string;
  user_id: string;
  estimate_id: string;
  event: string;
  token: string | null;
  metadata: Json | null;
  created_at: string;
}

export interface DatabaseContractorProfileRow {
  id: string;
  user_id: string;
  business_name: string | null;
  owner_name: string | null;
  trade_type: string | null;
  trade: string | null;
  avg_project_size: string | null;
  trade_seeded: boolean | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  email: string | null;
  public_slug: string | null;
  logo_url: string | null;
  stripe_account_id: string | null;
  stripe_account_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUserRow {
  id: string;
  stripe_customer_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DatabaseSubscriptionRow {
  id: string;
  user_id: string;
  stripe_subscription_id: string | null;
  stripe_checkout_session_id: string | null;
  plan_tier: string;
  status: string;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabasePaymentRow {
  id: string;
  contractor_id: string;
  proposal_id: string | null;
  stripe_payment_intent_id: string | null;
  amount: number;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUserProjectRow {
  id: string;
  user_id: string;
  trade: string;
  trade_project_id: string | null;
  project_name: string;
  description: string | null;
  base_price: number | null;
  created_at: string;
}

export interface DatabaseUserProposalRow {
  id: string;
  user_id: string;
  user_project_id: string | null;
  trade: string;
  project_name: string;
  tier: string;
  line_items: Json;
  total_price: number | null;
  created_at: string;
}

export interface DatabaseSmartProposalRow {
  id: string;
  contractor_id: string;
  client_id: string;
  quickquote_id: string | null;
  title: string | null;
  description: string | null;
  line_items: Json;
  deposit_amount: number | null;
  deposit_config: Json | null;
  status: string;
  public_token: string | null;
  public_token_expires_at: string | null;
  sent_at: string | null;
  accepted_option: string | null;
  payment_link_url: string | null;
  payment_link_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface EstimateInput {
  userId: string;
  clientId: string;
  projectTitle: string;
  lineItems: LineItem[];
  notes?: string;
  status?: Estimate["status"];
  taxRate?: number;
  jobId?: string | null;
}

export interface EstimateUpdateInput extends Partial<EstimateInput> {
  id: string;
  userId: string;
}

export interface EstimateDuplicateInput {
  id: string;
  userId: string;
}

export interface EstimateStatusUpdateInput {
  userId: string;
  estimateId: string;
  status: Estimate["status"];
  approvedBy?: string | null;
  approvedAt?: string | null;
}

export interface ClientInput {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface SettingsInput extends Partial<UserSettings> {
  userId: string;
}

export interface ProposalEventInput {
  userId: string;
  estimateId: string;
  event: string;
  token?: string;
  metadata?: Record<string, unknown> | null;
}

export interface ProposalEventFilter {
  estimateIds?: string[];
  event?: string;
}

export interface ProposalInput {
  userId: string;
  clientId: string;
  quickquoteId?: string | null;
  title?: string | null;
  description?: string | null;
  options: ProposalOption[];
  status?: string;
  acceptedOption?: string | null;
  depositAmount?: number | null;
  depositConfig?: ProposalDepositConfig | null;
  publicToken?: string | null;
  publicTokenExpiresAt?: string | null;
  sentAt?: string | null;
  paymentLinkUrl?: string | null;
  paymentLinkId?: string | null;
}

export interface ProposalStatusUpdateInput {
  userId: string;
  proposalId: string;
  status: string;
  acceptedOption?: string | null;
  depositAmount?: number | null;
  depositConfig?: ProposalDepositConfig | null;
  publicToken?: string | null;
  publicTokenExpiresAt?: string | null;
  sentAt?: string | null;
  paymentLinkUrl?: string | null;
  paymentLinkId?: string | null;
}

export interface ProposalUpdateInput {
  userId: string;
  proposalId: string;
  clientId?: string;
  quickquoteId?: string | null;
  title?: string | null;
  description?: string | null;
  options?: ProposalOption[];
  status?: string;
  acceptedOption?: string | null;
  depositAmount?: number | null;
  depositConfig?: ProposalDepositConfig | null;
  sentAt?: string | null;
  publicToken?: string | null;
  publicTokenExpiresAt?: string | null;
  paymentLinkUrl?: string | null;
  paymentLinkId?: string | null;
}

export interface ContractorProfileInput extends Partial<Omit<ContractorProfile, "userId" | "createdAt" | "updatedAt">> {
  userId: string;
}

export interface SupabaseFactoryOptions {
  useServiceRole?: boolean;
  env?: Record<string, string | undefined>;
}

const isMissingProposalEventsTable = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }
  const code = (error as { code?: string }).code;
  return code === "42P01";
};

const parseTimestamp = (value: string): number | null => {
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : time;
};

const getViewedEventsForEstimates = async (
  client: SupabaseClient,
  estimateIds: string[]
): Promise<Map<string, ProposalEvent>> => {
  if (estimateIds.length === 0) {
    return new Map();
  }

  const [openEvents, trackingEvents] = await Promise.all([
    listProposalEvents(client, { estimateIds, event: "email_open" }),
    listProposalEvents(client, { estimateIds, event: "email_tracking" }),
  ]);

  const latestTrackingByEstimate = new Map<
    string,
    { event: ProposalEvent; timestamp: number | null }
  >();
  for (const event of trackingEvents) {
    const timestamp = parseTimestamp(event.createdAt);
    const current = latestTrackingByEstimate.get(event.estimateId);
    if (!current || (timestamp ?? -Infinity) > (current.timestamp ?? -Infinity)) {
      latestTrackingByEstimate.set(event.estimateId, { event, timestamp });
    }
  }

  const sortedOpenEvents = [...openEvents].sort((a, b) => {
    const aTime = parseTimestamp(a.createdAt) ?? 0;
    const bTime = parseTimestamp(b.createdAt) ?? 0;
    return aTime - bTime;
  });

  const result = new Map<string, ProposalEvent>();
  for (const event of sortedOpenEvents) {
    const tracking = latestTrackingByEstimate.get(event.estimateId);
    const openToken =
      typeof event.metadata === "object" && event.metadata && "trackingToken" in event.metadata
        ? (event.metadata.trackingToken as string | undefined)
        : undefined;
    const openTimestamp = parseTimestamp(event.createdAt);

    if (tracking) {
      const trackingToken = tracking.event.token ?? undefined;
      const trackingTimestamp = tracking.timestamp ?? null;
      if (trackingToken) {
        if (!openToken || openToken !== trackingToken) {
          continue;
        }
      } else if (
        trackingTimestamp !== null &&
        openTimestamp !== null &&
        openTimestamp < trackingTimestamp
      ) {
        continue;
      }
    } else if (result.has(event.estimateId)) {
      continue;
    }

    if (!result.has(event.estimateId)) {
      result.set(event.estimateId, event);
    }
  }

  if (result.size === 0 && latestTrackingByEstimate.size === 0) {
    for (const event of sortedOpenEvents) {
      if (!result.has(event.estimateId)) {
        result.set(event.estimateId, event);
      }
    }
  }

  return result;
};
export const createSupabase = (options: SupabaseFactoryOptions = {}): SupabaseClient => {
  const config = loadServerConfig(options.env);
  return createClient(
    config.SUPABASE_URL,
    options.useServiceRole ? config.SUPABASE_SERVICE_ROLE_KEY : config.SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
      },
    }
  );
};

const lineItemTotals = (lineItems: LineItem[]) => {
  const normalised = lineItems.map((item) => ({
    ...item,
    quantity: Number(item.quantity || 0),
    unitPrice: Number(item.unitPrice || 0),
    total: Number(item.quantity || 0) * Number(item.unitPrice || 0),
  }));
  const subtotal = normalised.reduce((sum, item) => sum + item.total, 0);
  return { lineItems: normalised, subtotal };
};

const toLineItems = (value: Json): LineItem[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return (value as unknown as LineItem[]).map((item) => ({
    ...item,
    quantity: Number(item.quantity || 0),
    unitPrice: Number(item.unitPrice || 0),
    total: Number(item.total || Number(item.quantity || 0) * Number(item.unitPrice || 0)),
  }));
};

const buildEstimateRecord = (row: DatabaseEstimateRow): Estimate => ({
  id: row.id,
  userId: row.user_id,
  clientId: row.client_id,
  projectTitle: row.project_title,
  lineItems: toLineItems(row.line_items),
  subtotal: row.subtotal,
  tax: row.tax,
  total: row.total,
  notes: row.notes ?? undefined,
  status: row.status as Estimate["status"],
  convertedToProposal: row.converted_to_proposal,
  jobId: row.job_id ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  approvalToken: row.approval_token ?? null,
  approvalTokenExpiresAt: row.approval_token_expires_at ?? null,
  approvedAt: row.approved_at ?? null,
  approvedBy: row.approved_by ?? null,
  viewedAt: null,
});

const buildClientRecord = (row: DatabaseClientRow): Client => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  email: row.email,
  phone: row.phone ?? undefined,
  address: row.address ?? undefined,
  createdAt: row.created_at,
});

const buildSettingsRecord = (row: DatabaseUserSettingsRow): UserSettings => ({
  userId: row.user_id,
  defaultTaxRate: row.default_tax_rate,
  footerText: row.footer_text ?? undefined,
  logoUrl: row.logo_url ?? undefined,
  companyName: row.company_name ?? undefined,
  orgId: row.org_id ?? undefined,
  accentColor: row.accent_color ?? undefined,
  estimateTemplate: (row.estimate_template as UserSettings["estimateTemplate"]) ?? undefined,
});

const buildProposalEventRecord = (row: DatabaseProposalEventRow): ProposalEvent => ({
  id: row.id,
  userId: row.user_id,
  estimateId: row.estimate_id,
  event: row.event,
  token: row.token ?? null,
  metadata: (row.metadata as Record<string, unknown> | null) ?? null,
  createdAt: row.created_at,
});

const isPlainRecord = (input: unknown): input is Record<string, unknown> =>
  typeof input === "object" && input !== null && !Array.isArray(input);

const normaliseProposalLineItem = (item: unknown): ProposalOptionLineItem => {
  const record = isPlainRecord(item) ? item : {};
  const quantity = Number(record.quantity ?? 0);
  const unitCost = Number(record.unitCost ?? record.unit_price ?? record.unit ?? 0);
  const total = Number(record.total ?? quantity * unitCost);
  return {
    id: typeof record.id === "string" ? record.id : undefined,
    description: String(record.description ?? record.desc ?? ""),
    quantity,
    unitCost,
    total,
  };
};

const coerceProposalOption = (value: unknown): ProposalOption => {
  const record = isPlainRecord(value) ? value : {};
  const rawLineItems = Array.isArray(record.lineItems) ? record.lineItems : [];
  const lineItems = rawLineItems.map((item) => normaliseProposalLineItem(item));
  const subtotal =
    typeof record.subtotal === "number"
      ? record.subtotal
      : lineItems.reduce((sum, item) => sum + item.total, 0);
  return {
    name: String(record.name ?? "Option"),
    summary: record.summary !== undefined && record.summary !== null ? String(record.summary) : null,
    lineItems,
    subtotal,
    multiplier:
      record.multiplier !== undefined && record.multiplier !== null
        ? Number(record.multiplier)
        : null,
  };
};

const coerceProposalOptions = (value: unknown): ProposalOption[] => {
  if (!Array.isArray(value)) return [];
  return value.map((option) => coerceProposalOption(option));
};

const parseDepositConfig = (value: unknown): ProposalDepositConfig | null => {
  if (!isPlainRecord(value)) return null;
  const rawType = value.type;
  if (rawType !== "percentage" && rawType !== "fixed") return null;
  const rawValue = Number(value.value ?? value.amount ?? 0);
  if (!Number.isFinite(rawValue) || rawValue < 0) return null;
  return { type: rawType, value: rawValue };
};

const parseSmartProposalPayload = (
  value: Json
): { options: ProposalOption[]; deposit: ProposalDepositConfig | null } => {
  if (Array.isArray(value)) {
    return { options: coerceProposalOptions(value), deposit: null };
  }
  if (isPlainRecord(value)) {
    const optionsSource = Array.isArray(value.options)
      ? value.options
      : Array.isArray(value.lineItems)
        ? value.lineItems
        : [];
    const options = coerceProposalOptions(optionsSource);
    const deposit = parseDepositConfig(value.deposit ?? value.depositConfig ?? null);
    return { options, deposit };
  }
  return { options: [], deposit: null };
};

const computeProposalTotals = (options: ProposalOption[]): ProposalTotal[] =>
  options.map((option) => ({
    name: option.name,
    total: option.subtotal,
  }));

const pickDepositBaseOption = (options: ProposalOption[]): ProposalOption | null => {
  if (!options.length) return null;
  const better = options.find(
    (option) => option.name?.toLowerCase?.() === "better"
  );
  return better ?? options[0];
};

const computeDepositAmount = (
  deposit: ProposalDepositConfig | null,
  options: ProposalOption[],
  explicitAmount: number | null
): number | null => {
  if (!deposit) return explicitAmount ?? null;
  if (explicitAmount !== null && Number.isFinite(explicitAmount)) {
    return explicitAmount;
  }
  const baseOption = pickDepositBaseOption(options);
  if (!baseOption) return null;
  if (deposit.type === "fixed") {
    return deposit.value;
  }
  const subtotal = Number(baseOption.subtotal ?? 0);
  if (!Number.isFinite(subtotal) || subtotal <= 0) return null;
  return Math.round(subtotal * (deposit.value / 100) * 100) / 100;
};

const buildProposalRecord = (row: DatabaseSmartProposalRow): Proposal => {
  const payload = parseSmartProposalPayload(row.line_items);
  const options = payload.options;
  const totals = computeProposalTotals(options);
  const depositAmount =
    row.deposit_amount !== null && row.deposit_amount !== undefined
      ? Number(row.deposit_amount)
      : null;
  const depositConfig = payload.deposit;
  const computedDepositAmount = computeDepositAmount(depositConfig, options, depositAmount);

  return {
    id: row.id,
    userId: row.contractor_id,
    clientId: row.client_id,
    quickquoteId: row.quickquote_id ?? null,
    title: row.title ?? "",
    description: row.description ?? null,
    options,
    totals,
    status: row.status,
    depositAmount: computedDepositAmount,
    depositType: depositConfig?.type ?? null,
    depositValue: depositConfig?.value ?? null,
    depositConfig: depositConfig ?? null,
    publicToken: row.public_token ?? null,
    sentAt: row.sent_at ?? null,
    paymentLinkUrl: row.payment_link_url ?? null,
    paymentLinkId: row.payment_link_id ?? null,
    acceptedOption: row.accepted_option ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const buildContractorProfileRecord = (row: DatabaseContractorProfileRow): ContractorProfile => ({
  userId: row.user_id,
  businessName: row.business_name ?? null,
  ownerName: row.owner_name ?? null,
  tradeType: row.trade_type ?? null,
  trade: row.trade ?? row.trade_type ?? null,
  averageProjectSize: row.avg_project_size ?? null,
  city: row.city ?? null,
  state: row.state ?? null,
  phone: row.phone ?? null,
  email: row.email ?? null,
  logoUrl: row.logo_url ?? null,
  publicSlug: row.public_slug ?? null,
  tradeSeeded: row.trade_seeded ?? null,
  stripeAccountId: row.stripe_account_id ?? null,
  stripeAccountStatus: row.stripe_account_status ?? null,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const buildSubscriptionRecord = (row: DatabaseSubscriptionRow): SubscriptionRecord => ({
  id: row.id,
  userId: row.user_id,
  stripeSubscriptionId: row.stripe_subscription_id ?? null,
  stripeCheckoutSessionId: row.stripe_checkout_session_id ?? null,
  planTier: normalisePlanTier(row.plan_tier),
  status: normaliseSubscriptionStatus(row.status),
  currentPeriodEnd: row.current_period_end ?? null,
  createdAt: row.created_at,
  updatedAt: row.updated_at ?? null,
});

const buildPaymentRecord = (row: DatabasePaymentRow): PaymentRecord => ({
  id: row.id,
  contractorId: row.contractor_id,
  proposalId: row.proposal_id ?? null,
  stripePaymentIntentId: row.stripe_payment_intent_id ?? null,
  amount: Number(row.amount ?? 0),
  type: normalisePaymentType(row.type),
  status: row.status ?? "pending",
  createdAt: row.created_at,
  updatedAt: row.updated_at ?? null,
});

const buildUserProposalRecord = (row: DatabaseUserProposalRow): UserProposalTemplate => ({
  id: row.id,
  userId: row.user_id,
  userProjectId: row.user_project_id ?? null,
  trade: row.trade,
  projectName: row.project_name,
  tier: row.tier,
  lineItems: parseProposalLineItems(row.line_items),
  totalPrice: row.total_price ?? null,
  createdAt: row.created_at,
});

const buildUserProjectRecord = (
  row: DatabaseUserProjectRow,
  proposals: UserProposalTemplate[]
): UserProjectTemplate => ({
  id: row.id,
  userId: row.user_id,
  trade: row.trade,
  tradeProjectId: row.trade_project_id,
  projectName: row.project_name,
  description: row.description ?? null,
  basePrice: row.base_price ?? null,
  createdAt: row.created_at,
  proposals,
});

export async function listEstimates(
  client: SupabaseClient,
  userId: string,
  filters: EstimateFilters = {}
): Promise<Estimate[]> {
  let query = client
    .from("estimates")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.search) {
    query = query.ilike("project_title", `%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  const estimateRows = (data as DatabaseEstimateRow[]) ?? [];
  if (estimateRows.length === 0) {
    return [];
  }

  const records = estimateRows.map((row) => buildEstimateRecord(row));
  const estimateIds = records.map((estimate) => estimate.id);
  const viewedEvents = await getViewedEventsForEstimates(client, estimateIds);
  return records.map((estimate) => ({
    ...estimate,
    viewedAt: viewedEvents.get(estimate.id)?.createdAt ?? null,
  }));
}

export async function getEstimate(
  client: SupabaseClient,
  userId: string,
  estimateId: string
): Promise<Estimate | null> {
  const { data, error } = await client
    .from("estimates")
    .select("*")
    .eq("user_id", userId)
    .eq("id", estimateId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const record = buildEstimateRecord(data as DatabaseEstimateRow);
  const openEvent = await getLatestProposalEvent(client, record.id, "email_open");
  return {
    ...record,
    viewedAt: openEvent?.createdAt ?? null,
  };
}

export async function createEstimateRecord(
  client: SupabaseClient,
  input: EstimateInput
): Promise<Estimate> {
  const taxRate = input.taxRate ?? 0;
  const { lineItems, subtotal } = lineItemTotals(input.lineItems);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const payload = {
    user_id: input.userId,
    client_id: input.clientId,
    project_title: input.projectTitle,
    line_items: lineItems,
    subtotal,
    tax,
    total,
    notes: input.notes ?? null,
    status: input.status ?? "draft",
    converted_to_proposal: false,
    job_id: input.jobId ?? null,
  } satisfies Partial<DatabaseEstimateRow> & { user_id: string; client_id: string };

  const { data, error } = await client.from("estimates").insert(payload).select("*").single();
  if (error) throw error;
  return buildEstimateRecord(data as DatabaseEstimateRow);
}

export async function updateEstimateRecord(
  client: SupabaseClient,
  input: EstimateUpdateInput
): Promise<Estimate> {
  const existing = await getEstimate(client, input.userId, input.id);
  if (!existing) {
    throw new Error("Estimate not found");
  }

  const mergedLineItems = input.lineItems ?? existing.lineItems;
  const { lineItems, subtotal } = lineItemTotals(mergedLineItems);
  const taxRate = input.taxRate ?? (existing.subtotal === 0 ? 0 : existing.tax / existing.subtotal);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const payload: Partial<DatabaseEstimateRow> = {
    client_id: input.clientId ?? existing.clientId,
    project_title: input.projectTitle ?? existing.projectTitle,
    line_items: lineItems,
    subtotal,
    tax,
    total,
    notes: input.notes ?? existing.notes ?? null,
    status: input.status ?? existing.status,
    job_id: input.jobId ?? existing.jobId ?? null,
  };

  const { data, error } = await client
    .from("estimates")
    .update(payload)
    .eq("id", input.id)
    .eq("user_id", existing.userId)
    .select("*")
    .single();
  if (error) throw error;
  const record = buildEstimateRecord(data as DatabaseEstimateRow);
  const openEvent = await getLatestProposalEvent(client, record.id, "email_open");
  return {
    ...record,
    viewedAt: openEvent?.createdAt ?? existing.viewedAt ?? null,
  };
}

export async function updateEstimateStatus(
  client: SupabaseClient,
  input: EstimateStatusUpdateInput
): Promise<Estimate> {
  const existing = await getEstimate(client, input.userId, input.estimateId);
  if (!existing) {
    throw new Error("Estimate not found");
  }

  const payload: Partial<DatabaseEstimateRow> = {
    status: input.status,
  };

  if (input.status === "accepted") {
    payload.approved_at = input.approvedAt ?? new Date().toISOString();
    payload.approved_by = input.approvedBy ?? existing.approvedBy ?? null;
    payload.converted_to_proposal = true;
  } else {
    if (input.approvedAt !== undefined) {
      payload.approved_at = input.approvedAt;
    } else {
      payload.approved_at = null;
    }
    if (input.approvedBy !== undefined) {
      payload.approved_by = input.approvedBy;
    } else {
      payload.approved_by = null;
    }
    if (input.status === "draft" || input.status === "declined") {
      payload.converted_to_proposal = false;
    }
  }

  const { data, error } = await client
    .from("estimates")
    .update(payload)
    .eq("id", existing.id)
    .eq("user_id", input.userId)
    .select("*")
    .single();
  if (error) throw error;
  const record = buildEstimateRecord(data as DatabaseEstimateRow);
  const openEvent = await getLatestProposalEvent(client, record.id, "email_open");
  return {
    ...record,
    viewedAt: openEvent?.createdAt ?? existing.viewedAt ?? null,
  };
}

const DEFAULT_APPROVAL_EXPIRY_DAYS = 30;

export interface IssueEstimateApprovalTokenInput {
  estimateId: string;
  userId: string;
  expiresAt?: Date;
  resetApproval?: boolean;
}

export interface IssueEstimateApprovalTokenResult {
  token: string;
  estimate: Estimate;
}

export async function issueEstimateApprovalToken(
  client: SupabaseClient,
  input: IssueEstimateApprovalTokenInput
): Promise<IssueEstimateApprovalTokenResult> {
  const token = randomUUID();
  const expiresAt =
    input.expiresAt ?? new Date(Date.now() + DEFAULT_APPROVAL_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  const payload: Partial<DatabaseEstimateRow> = {
    approval_token: token,
    approval_token_expires_at: expiresAt.toISOString(),
  };
  if (input.resetApproval ?? true) {
    payload.approved_at = null;
    payload.approved_by = null;
  }
  const { data, error } = await client
    .from("estimates")
    .update(payload)
    .eq("id", input.estimateId)
    .eq("user_id", input.userId)
    .select("*")
    .single();
  if (error) throw error;
  const record = buildEstimateRecord(data as DatabaseEstimateRow);
  const openEvent = await getLatestProposalEvent(client, record.id, "email_open");
  return {
    token,
    estimate: {
      ...record,
      viewedAt: openEvent?.createdAt ?? null,
    },
  };
}

export async function getEstimateByApprovalToken(
  client: SupabaseClient,
  token: string
): Promise<Estimate | null> {
  const { data, error } = await client
    .from("estimates")
    .select("*")
    .eq("approval_token", token)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const row = data as DatabaseEstimateRow;
  if (row.approval_token_expires_at) {
    const expiresAt = new Date(row.approval_token_expires_at);
    if (Number.isFinite(expiresAt.getTime()) && expiresAt.getTime() < Date.now()) {
      return null;
    }
  }
  const record = buildEstimateRecord(row);
  const openEvent = await getLatestProposalEvent(client, record.id, "email_open");
  return {
    ...record,
    viewedAt: openEvent?.createdAt ?? null,
  };
}

export interface ApproveEstimateByTokenOptions {
  approverName?: string | null;
}

export async function approveEstimateByToken(
  client: SupabaseClient,
  token: string,
  options: ApproveEstimateByTokenOptions = {}
): Promise<Estimate | null> {
  const existing = await getEstimateByApprovalToken(client, token);
  if (!existing) return null;
  if (existing.approvedAt) {
    if (options.approverName && options.approverName !== existing.approvedBy) {
      const { data, error } = await client
        .from("estimates")
        .update({
          approved_by: options.approverName,
        })
        .eq("id", existing.id)
        .select("*")
        .single();
      if (error) throw error;
      const record = buildEstimateRecord(data as DatabaseEstimateRow);
      const openEvent = await getLatestProposalEvent(client, record.id, "email_open");
      return {
        ...record,
        viewedAt: openEvent?.createdAt ?? existing.viewedAt ?? null,
      };
    }
    return existing;
  }
  const approvedAt = new Date().toISOString();
  const { data, error } = await client
    .from("estimates")
    .update({
      status: "accepted",
      approved_at: approvedAt,
      approved_by: options.approverName ?? null,
    })
    .eq("id", existing.id)
    .select("*")
    .single();
  if (error) throw error;
  const record = buildEstimateRecord(data as DatabaseEstimateRow);
  const openEvent = await getLatestProposalEvent(client, record.id, "email_open");
  return {
    ...record,
    viewedAt: openEvent?.createdAt ?? existing.viewedAt ?? null,
  };
}

export async function duplicateEstimate(
  client: SupabaseClient,
  input: EstimateDuplicateInput
): Promise<Estimate> {
  const source = await getEstimate(client, input.userId, input.id);
  if (!source) throw new Error("Estimate not found");
  return createEstimateRecord(client, {
    userId: source.userId,
    clientId: source.clientId,
    projectTitle: `${source.projectTitle} (Copy)`,
    lineItems: source.lineItems,
    notes: source.notes,
    status: "draft",
    taxRate: source.subtotal === 0 ? 0 : source.tax / source.subtotal,
    jobId: source.jobId ?? null,
  });
}

export async function listClients(client: SupabaseClient, userId: string): Promise<Client[]> {
  const { data, error } = await client
    .from("clients")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true });
  if (error) throw error;
  return (data as DatabaseClientRow[]).map((row) => buildClientRecord(row));
}

export async function getClient(
  client: SupabaseClient,
  userId: string,
  clientId: string
): Promise<Client | null> {
  const { data, error } = await client
    .from("clients")
    .select("*")
    .eq("user_id", userId)
    .eq("id", clientId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return buildClientRecord(data as DatabaseClientRow);
}

export async function createClientRecord(
  client: SupabaseClient,
  input: ClientInput
): Promise<Client> {
  const payload = {
    user_id: input.userId,
    name: input.name,
    email: input.email,
    phone: input.phone ?? null,
    address: input.address ?? null,
  };
  const { data, error } = await client.from("clients").insert(payload).select("*").single();
  if (error) throw error;
  return buildClientRecord(data as DatabaseClientRow);
}

export async function getUserSettings(
  client: SupabaseClient,
  userId: string
): Promise<UserSettings | null> {
  const { data, error } = await client
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return buildSettingsRecord(data as DatabaseUserSettingsRow);
}

export async function upsertUserSettings(
  client: SupabaseClient,
  input: SettingsInput
): Promise<UserSettings> {
  const payload: Partial<DatabaseUserSettingsRow> & { user_id: string } = {
    user_id: input.userId,
  };
  if (input.defaultTaxRate !== undefined) {
    payload.default_tax_rate = input.defaultTaxRate;
  }
  if (input.footerText !== undefined) {
    payload.footer_text = input.footerText ?? null;
  }
  if (input.logoUrl !== undefined) {
    payload.logo_url = input.logoUrl ?? null;
  }
  if (input.companyName !== undefined) {
    payload.company_name = input.companyName ?? null;
  }
  if (input.orgId !== undefined) {
    payload.org_id = input.orgId ?? null;
  }
  if (input.accentColor !== undefined) {
    payload.accent_color = input.accentColor ?? null;
  }
  if (input.estimateTemplate !== undefined) {
    payload.estimate_template = input.estimateTemplate ?? null;
  }

  const { data, error } = await client
    .from("user_settings")
    .upsert(payload, { onConflict: "user_id" })
    .select("*")
    .single();
  if (error) throw error;
  return buildSettingsRecord(data as DatabaseUserSettingsRow);
}

export async function createProposalEvent(
  client: SupabaseClient,
  input: ProposalEventInput
): Promise<ProposalEvent> {
  const payload = {
    user_id: input.userId,
    estimate_id: input.estimateId,
    event: input.event,
    token: input.token ?? null,
    metadata: input.metadata ?? null,
  } satisfies Partial<DatabaseProposalEventRow> & { user_id: string; estimate_id: string; event: string };
  const { data, error } = await client.from("proposal_events").insert(payload).select("*").single();
  if (error) {
    if (isMissingProposalEventsTable(error)) {
      console.warn("[db] proposal_events table missing; skipping createProposalEvent");
      return {
        id: randomUUID(),
        userId: input.userId,
        estimateId: input.estimateId,
        event: input.event,
        token: input.token ?? null,
        metadata: input.metadata ?? null,
        createdAt: new Date().toISOString(),
      };
    }
    throw error;
  }
  return buildProposalEventRecord(data as DatabaseProposalEventRow);
}

export async function findProposalEventByToken(
  client: SupabaseClient,
  token: string,
  options: { event?: string; estimateId?: string } = {}
): Promise<ProposalEvent | null> {
  let query = client.from("proposal_events").select("*").eq("token", token).limit(1);
  if (options.event) {
    query = query.eq("event", options.event);
  }
  if (options.estimateId) {
    query = query.eq("estimate_id", options.estimateId);
  }
  const { data, error } = await query.maybeSingle();
  if (error) {
    if (isMissingProposalEventsTable(error)) {
      return null;
    }
    throw error;
  }
  if (!data) return null;
  return buildProposalEventRecord(data as DatabaseProposalEventRow);
}

export async function listProposalEvents(
  client: SupabaseClient,
  filter: ProposalEventFilter = {}
): Promise<ProposalEvent[]> {
  let query = client.from("proposal_events").select("*");
  if (filter.estimateIds && filter.estimateIds.length > 0) {
    query = query.in("estimate_id", filter.estimateIds);
  }
  if (filter.event) {
    query = query.eq("event", filter.event);
  }
  query = query.order("created_at", { ascending: false });
  const { data, error } = await query;
  if (error) {
    if (isMissingProposalEventsTable(error)) {
      return [];
    }
    throw error;
  }
  return (data as DatabaseProposalEventRow[]).map((row) => buildProposalEventRecord(row));
}

export async function createProposalRecord(
  client: SupabaseClient,
  input: ProposalInput
): Promise<Proposal> {
  const depositAmount = computeDepositAmount(
    input.depositConfig ?? null,
    input.options,
    input.depositAmount ?? null
  );
  const lineItemsPayload =
    input.depositConfig && input.depositConfig.value !== undefined
      ? { options: input.options, deposit: input.depositConfig }
      : { options: input.options };
  const payload: Partial<DatabaseSmartProposalRow> & {
    contractor_id: string;
    client_id: string;
  } = {
    contractor_id: input.userId,
    client_id: input.clientId,
    quickquote_id: input.quickquoteId ?? null,
    title: input.title ?? null,
    description: input.description ?? null,
    line_items: toJson(lineItemsPayload),
    deposit_amount: depositAmount,
    deposit_config: input.depositConfig ? toJson(input.depositConfig) : null,
    status: input.status ?? "draft",
    public_token: input.publicToken ?? null,
    public_token_expires_at: input.publicTokenExpiresAt ?? null,
    sent_at: input.sentAt ?? null,
    accepted_option: input.acceptedOption ?? null,
    payment_link_url: input.paymentLinkUrl ?? null,
    payment_link_id: input.paymentLinkId ?? null,
  };
  const { data, error } = await client.from("smart_proposals").insert(payload).select("*").single();
  if (error) throw error;
  return buildProposalRecord(data as DatabaseSmartProposalRow);
}

export async function updateProposalRecord(
  client: SupabaseClient,
  input: ProposalUpdateInput
): Promise<Proposal> {
  const updatePayload: Record<string, unknown> = {};
  if (input.clientId !== undefined) {
    updatePayload.client_id = input.clientId;
  }
  if (input.quickquoteId !== undefined) {
    updatePayload.quickquote_id = input.quickquoteId ?? null;
  }
  if (input.title !== undefined) {
    updatePayload.title = input.title ?? null;
  }
  if (input.description !== undefined) {
    updatePayload.description = input.description ?? null;
  }
  if (input.status !== undefined) {
    updatePayload.status = input.status;
  }
  if (input.acceptedOption !== undefined) {
    updatePayload.accepted_option = input.acceptedOption ?? null;
  }
  if (input.sentAt !== undefined) {
    updatePayload.sent_at = input.sentAt ?? null;
  }
  if (input.paymentLinkUrl !== undefined) {
    updatePayload.payment_link_url = input.paymentLinkUrl ?? null;
  }
  if (input.paymentLinkId !== undefined) {
    updatePayload.payment_link_id = input.paymentLinkId ?? null;
  }
  if (input.publicToken !== undefined) {
    updatePayload.public_token = input.publicToken ?? null;
  }
  if (input.publicTokenExpiresAt !== undefined) {
    updatePayload.public_token_expires_at = input.publicTokenExpiresAt ?? null;
  }
  if (input.paymentLinkUrl !== undefined) {
    updatePayload.payment_link_url = input.paymentLinkUrl ?? null;
  }
  if (input.paymentLinkId !== undefined) {
    updatePayload.payment_link_id = input.paymentLinkId ?? null;
  }

  let depositHandledViaOptions = false;

  if (input.options !== undefined) {
    const depositConfig =
      input.depositConfig !== undefined ? input.depositConfig : undefined;
    if (depositConfig !== undefined) {
      updatePayload.deposit_config = depositConfig ? toJson(depositConfig) : null;
    }
    const computedDepositAmount = computeDepositAmount(
      depositConfig ?? null,
      input.options,
      input.depositAmount ?? null
    );
    if (depositConfig !== undefined || input.depositAmount !== undefined) {
      updatePayload.deposit_amount = computedDepositAmount;
    }
    const lineItemsPayload =
      depositConfig !== undefined && depositConfig
        ? { options: input.options, deposit: depositConfig }
        : { options: input.options };
    updatePayload.line_items = toJson(lineItemsPayload);
    depositHandledViaOptions = true;
  }

  if (!depositHandledViaOptions) {
    if (input.depositConfig !== undefined) {
      updatePayload.deposit_config = input.depositConfig ? toJson(input.depositConfig) : null;
    }
    if (input.depositAmount !== undefined) {
      updatePayload.deposit_amount = input.depositAmount;
    }
  }

  const { data, error } = await client
    .from("smart_proposals")
    .update(updatePayload)
    .eq("contractor_id", input.userId)
    .eq("id", input.proposalId)
    .select("*")
    .single();
  if (error) throw error;
  return buildProposalRecord(data as DatabaseSmartProposalRow);
}

export async function listProposals(client: SupabaseClient, userId: string): Promise<Proposal[]> {
  const { data, error } = await client
    .from("smart_proposals")
    .select("*")
    .eq("contractor_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as DatabaseSmartProposalRow[]).map((row) => buildProposalRecord(row));
}

export async function findProposalByQuickquote(
  client: SupabaseClient,
  userId: string,
  quickquoteId: string
): Promise<Proposal | null> {
  const { data, error } = await client
    .from("smart_proposals")
    .select("*")
    .eq("contractor_id", userId)
    .eq("quickquote_id", quickquoteId)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return buildProposalRecord(data as DatabaseSmartProposalRow);
}

export async function getProposalById(
  client: SupabaseClient,
  userId: string,
  proposalId: string
): Promise<Proposal | null> {
  const { data, error } = await client
    .from("smart_proposals")
    .select("*")
    .eq("contractor_id", userId)
    .eq("id", proposalId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return buildProposalRecord(data as DatabaseSmartProposalRow);
}

export async function getProposalByToken(
  client: SupabaseClient,
  token: string
): Promise<Proposal | null> {
  const { data, error } = await client
    .from("smart_proposals")
    .select("*")
    .eq("public_token", token)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return buildProposalRecord(data as DatabaseSmartProposalRow);
}

export async function getPreviousProposalLineItems(
  client: SupabaseClient,
  userId: string,
  clientId: string
): Promise<{ options: ProposalOption[]; depositConfig: ProposalDepositConfig | null } | null> {
  const { data, error } = await client
    .from("smart_proposals")
    .select("line_items, deposit_config")
    .eq("contractor_id", userId)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const record = data as { line_items: Json; deposit_config: Json | null };
  const payload = parseSmartProposalPayload(record.line_items);
  const deposit =
    record.deposit_config !== null && record.deposit_config !== undefined
      ? parseDepositConfig(record.deposit_config)
      : payload.deposit;
  return { options: payload.options, depositConfig: deposit ?? null };
}

export async function updateProposalStatus(
  client: SupabaseClient,
  input: ProposalStatusUpdateInput
): Promise<Proposal> {
  const updatePayload: Record<string, unknown> = {
    status: input.status,
    accepted_option: input.acceptedOption ?? null,
  };
  if (input.depositAmount !== undefined) {
    updatePayload.deposit_amount = input.depositAmount;
  }
  if (input.depositConfig !== undefined) {
    updatePayload.deposit_config = input.depositConfig ? toJson(input.depositConfig) : null;
  }
  if (input.publicToken !== undefined) {
    updatePayload.public_token = input.publicToken ?? null;
  }
  if (input.publicTokenExpiresAt !== undefined) {
    updatePayload.public_token_expires_at = input.publicTokenExpiresAt ?? null;
  }
  if (input.sentAt !== undefined) {
    updatePayload.sent_at = input.sentAt ?? null;
  }

  const { data, error } = await client
    .from("smart_proposals")
    .update(updatePayload)
    .eq("contractor_id", input.userId)
    .eq("id", input.proposalId)
    .select("*")
    .single();
  if (error) throw error;
  return buildProposalRecord(data as DatabaseSmartProposalRow);
}

export async function getContractorProfile(
  client: SupabaseClient,
  userId: string
): Promise<ContractorProfile | null> {
  const { data, error } = await client
    .from("contractor_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return buildContractorProfileRecord(data as DatabaseContractorProfileRow);
}

export async function upsertContractorProfile(
  client: SupabaseClient,
  input: ContractorProfileInput
): Promise<ContractorProfile> {
    const payload: Partial<DatabaseContractorProfileRow> & { user_id: string } = {
      user_id: input.userId,
      business_name: input.businessName ?? null,
      owner_name: input.ownerName ?? null,
      trade_type: input.tradeType ?? null,
      trade: input.trade ?? input.tradeType ?? null,
      avg_project_size: input.averageProjectSize ?? null,
      city: input.city ?? null,
      state: input.state ?? null,
      phone: input.phone ?? null,
      email: input.email ?? null,
      public_slug: input.publicSlug ? input.publicSlug.toLowerCase() : null,
    logo_url: input.logoUrl ?? null,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await client
    .from("contractor_profiles")
    .upsert(payload, { onConflict: "user_id" })
    .select("*")
    .single();
  if (error) throw error;
  return buildContractorProfileRecord(data as DatabaseContractorProfileRow);
}

export async function findContractorProfileBySlug(
  client: SupabaseClient,
  slug: string
): Promise<ContractorProfile | null> {
  const { data, error } = await client
    .from("contractor_profiles")
    .select("*")
    .eq("public_slug", slug.toLowerCase())
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return buildContractorProfileRecord(data as DatabaseContractorProfileRow);
}

export async function listUserProjects(
  client: SupabaseClient,
  userId: string
): Promise<UserProjectTemplate[]> {
  const { data: projects, error: projectsError } = await client
    .from("user_projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (projectsError) throw projectsError;

  const projectRows = (projects as DatabaseUserProjectRow[]) ?? [];
  if (!projectRows.length) {
    return [];
  }

  const projectIds = projectRows.map((project) => project.id);
  const { data: proposals, error: proposalsError } = await client
    .from("user_proposals")
    .select("*")
    .eq("user_id", userId)
    .in("user_project_id", projectIds);
  if (proposalsError) throw proposalsError;

  const proposalRows = (proposals as DatabaseUserProposalRow[]) ?? [];
  const proposalsByProject = new Map<string, UserProposalTemplate[]>();

  for (const proposal of proposalRows) {
    const record = buildUserProposalRecord(proposal);
    const key = record.userProjectId ?? "__unassigned";
    const bucket = proposalsByProject.get(key) ?? [];
    bucket.push(record);
    proposalsByProject.set(key, bucket);
  }

  return projectRows.map((project) => {
    const entries = proposalsByProject.get(project.id) ?? [];
    return buildUserProjectRecord(project, entries);
  });
}

export interface ProposalSummaryMetrics {
  totalProposals: number;
  acceptedProposals: number;
  revenueYtd: number;
  averageValue: number;
}

export async function getProposalSummaryForUser(
  client: SupabaseClient,
  userId: string
): Promise<ProposalSummaryMetrics> {
  const { data, error } = await client
    .from("smart_proposals")
    .select("status, line_items")
    .eq("contractor_id", userId);
  if (error) throw error;
  const proposals = (data as { status: string; line_items: Json }[]) ?? [];
  let total = 0;
  let accepted = 0;
  let revenue = 0;
  let aggregateValue = 0;
  for (const proposal of proposals) {
    total += 1;
    const payload = parseSmartProposalPayload(proposal.line_items);
    const totals = computeProposalTotals(payload.options);
    const highest =
      totals.reduce(
        (max, entry) => (typeof entry.total === "number" && entry.total > max ? entry.total : max),
        0
      ) ?? 0;
    aggregateValue += highest;
    if (proposal.status.toLowerCase() === "accepted") {
      accepted += 1;
      revenue += highest;
    }
  }
  const averageValue = total > 0 ? aggregateValue / total : 0;
  return {
    totalProposals: total,
    acceptedProposals: accepted,
    revenueYtd: revenue,
    averageValue,
  };
}

const getLatestViewedEventForEstimate = async (
  client: SupabaseClient,
  estimateId: string
): Promise<ProposalEvent | null> => {
  const events = await getViewedEventsForEstimates(client, [estimateId]);
  return events.get(estimateId) ?? null;
};

export async function getLatestProposalEvent(
  client: SupabaseClient,
  estimateId: string,
  event: string
): Promise<ProposalEvent | null> {
  if (event === "email_open") {
    return getLatestViewedEventForEstimate(client, estimateId);
  }
  const { data, error } = await client
    .from("proposal_events")
    .select("*")
    .eq("estimate_id", estimateId)
    .eq("event", event)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    if (isMissingProposalEventsTable(error)) {
      return null;
    }
    throw error;
  }
  if (!data) return null;
  return buildProposalEventRecord(data as DatabaseProposalEventRow);
}

export async function getStripeCustomerId(
  client: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data, error } = await client
    .from("users")
    .select("stripe_customer_id")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as { stripe_customer_id: string | null } | null)?.stripe_customer_id ?? null;
}

export async function upsertStripeCustomerId(
  client: SupabaseClient,
  userId: string,
  stripeCustomerId: string
): Promise<string> {
  const { data, error } = await client
    .from("users")
    .upsert({ id: userId, stripe_customer_id: stripeCustomerId }, { onConflict: "id" })
    .select("stripe_customer_id")
    .single();
  if (error) throw error;
  return (data as { stripe_customer_id: string | null }).stripe_customer_id ?? stripeCustomerId;
}

export interface SubscriptionCheckoutInput {
  userId: string;
  planTier: string;
  stripeCheckoutSessionId: string;
  status?: string;
  stripeSubscriptionId?: string | null;
  currentPeriodEnd?: string | null;
}

export async function upsertSubscriptionCheckout(
  client: SupabaseClient,
  input: SubscriptionCheckoutInput
): Promise<SubscriptionRecord> {
  const payload: Partial<DatabaseSubscriptionRow> & {
    user_id: string;
    stripe_checkout_session_id: string;
  } = {
    user_id: input.userId,
    plan_tier: input.planTier.toLowerCase(),
    status: (input.status ?? "pending").toLowerCase(),
    stripe_checkout_session_id: input.stripeCheckoutSessionId,
    stripe_subscription_id: input.stripeSubscriptionId ?? null,
    current_period_end: input.currentPeriodEnd ?? null,
  };

  const { data, error } = await client
    .from("subscriptions")
    .upsert(payload, { onConflict: "stripe_checkout_session_id" })
    .select("*")
    .single();
  if (error) throw error;
  return buildSubscriptionRecord(data as DatabaseSubscriptionRow);
}

export interface SubscriptionStatusUpdateInput {
  stripeCheckoutSessionId?: string | null;
  stripeSubscriptionId?: string | null;
  status?: string | null;
  currentPeriodEnd?: string | null;
  planTier?: string | null;
}

export async function updateSubscriptionStatusRecord(
  client: SupabaseClient,
  input: SubscriptionStatusUpdateInput
): Promise<SubscriptionRecord | null> {
  const updatePayload: Partial<DatabaseSubscriptionRow> = {};
  if (input.status !== undefined && input.status !== null) {
    updatePayload.status = input.status.toLowerCase();
  }
  if (input.currentPeriodEnd !== undefined) {
    updatePayload.current_period_end = input.currentPeriodEnd;
  }
  if (input.planTier) {
    updatePayload.plan_tier = input.planTier.toLowerCase();
  }
  if (input.stripeSubscriptionId) {
    updatePayload.stripe_subscription_id = input.stripeSubscriptionId;
  }
  if (Object.keys(updatePayload).length === 0) {
    return null;
  }

  let query = client.from("subscriptions").update(updatePayload);
  if (input.stripeCheckoutSessionId) {
    query = query.eq("stripe_checkout_session_id", input.stripeCheckoutSessionId);
  }
  if (input.stripeSubscriptionId) {
    query = query.eq("stripe_subscription_id", input.stripeSubscriptionId);
  }
  const { data, error } = await query.select("*").maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return buildSubscriptionRecord(data as DatabaseSubscriptionRow);
}

export async function getSubscriptionByCheckoutSessionId(
  client: SupabaseClient,
  sessionId: string
): Promise<SubscriptionRecord | null> {
  const { data, error } = await client
    .from("subscriptions")
    .select("*")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return buildSubscriptionRecord(data as DatabaseSubscriptionRow);
}

export async function getSubscriptionByStripeSubscriptionId(
  client: SupabaseClient,
  subscriptionId: string
): Promise<SubscriptionRecord | null> {
  const { data, error } = await client
    .from("subscriptions")
    .select("*")
    .eq("stripe_subscription_id", subscriptionId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return buildSubscriptionRecord(data as DatabaseSubscriptionRow);
}

export interface PaymentInsertInput {
  contractorId: string;
  proposalId: string | null;
  stripePaymentIntentId: string | null;
  amount: number;
  type: PaymentType;
  status: string;
}

export async function recordStripePayment(
  client: SupabaseClient,
  input: PaymentInsertInput
): Promise<PaymentRecord> {
  const payload: Partial<DatabasePaymentRow> & { contractor_id: string } = {
    contractor_id: input.contractorId,
    proposal_id: input.proposalId,
    stripe_payment_intent_id: input.stripePaymentIntentId ?? null,
    amount: input.amount,
    type: input.type,
    status: input.status,
  };

  const { data, error } = await client
    .from("payments")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return buildPaymentRecord(data as DatabasePaymentRow);
}

export interface ContractorStripeAccountInput {
  userId: string;
  accountId: string;
  status?: string | null;
}

export async function upsertContractorStripeAccount(
  client: SupabaseClient,
  input: ContractorStripeAccountInput
): Promise<ContractorProfile> {
  const payload: Partial<DatabaseContractorProfileRow> & { user_id: string } = {
    user_id: input.userId,
    stripe_account_id: input.accountId,
    stripe_account_status: input.status ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await client
    .from("contractor_profiles")
    .upsert(payload, { onConflict: "user_id" })
    .select("*")
    .single();
  if (error) throw error;
  return buildContractorProfileRecord(data as DatabaseContractorProfileRow);
}

export interface ContractorStripeStatusUpdateInput {
  accountId: string;
  status?: string | null;
}

export async function updateContractorStripeStatusByAccountId(
  client: SupabaseClient,
  input: ContractorStripeStatusUpdateInput
): Promise<ContractorProfile | null> {
  const { data, error } = await client
    .from("contractor_profiles")
    .update({
      stripe_account_status: input.status ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_account_id", input.accountId)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return buildContractorProfileRecord(data as DatabaseContractorProfileRow);
}

export const schemaPath = new URL("../schema.sql", import.meta.url).pathname;

export type { SupabaseClient };
