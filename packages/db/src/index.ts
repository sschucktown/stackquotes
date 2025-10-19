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
  ProposalOption,
  ProposalTotal,
  UserSettings,
} from "@stackquotes/types";
import { randomUUID } from "node:crypto";

type Json = Record<string, unknown> | Json[] | string | number | boolean | null;

const toJson = <T>(value: T): Json => JSON.parse(JSON.stringify(value)) as Json;

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
  city: string | null;
  state: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseProposalRow {
  id: string;
  user_id: string;
  quickquote_id: string | null;
  options: Json;
  totals: Json;
  status: string;
  accepted_option: string | null;
  created_at: string;
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
  quickquoteId?: string | null;
  options: ProposalOption[];
  totals: ProposalTotal[];
  status?: string;
  acceptedOption?: string | null;
}

export interface ProposalStatusUpdateInput {
  userId: string;
  proposalId: string;
  status: string;
  acceptedOption?: string | null;
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

const normaliseProposalLineItem = (item: unknown): { description: string; quantity: number; unitCost: number; total: number } => {
  const record = (item as Record<string, unknown>) ?? {};
  const quantity = Number(record.quantity ?? 0);
  const unitCost = Number(record.unitCost ?? record.unit_price ?? record.unit ?? 0);
  const total = Number(record.total ?? quantity * unitCost);
  return {
    description: String(record.description ?? record.desc ?? ""),
    quantity,
    unitCost,
    total,
  };
};

const coerceProposalOptions = (value: Json): ProposalOption[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return (value as ProposalOption[]).map((option) => {
    const record = option as Record<string, unknown>;
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
  });
};

const coerceProposalTotals = (value: Json): ProposalTotal[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return (value as ProposalTotal[]).map((entry) => ({
    name: String((entry as Record<string, unknown>).name ?? "Option"),
    total: Number((entry as Record<string, unknown>).total ?? 0),
  }));
};

const buildProposalRecord = (row: DatabaseProposalRow): Proposal => ({
  id: row.id,
  userId: row.user_id,
  quickquoteId: row.quickquote_id ?? null,
  options: coerceProposalOptions(row.options),
  totals: coerceProposalTotals(row.totals),
  status: row.status,
  acceptedOption: row.accepted_option ?? null,
  createdAt: row.created_at,
});

const buildContractorProfileRecord = (row: DatabaseContractorProfileRow): ContractorProfile => ({
  userId: row.user_id,
  businessName: row.business_name ?? null,
  ownerName: row.owner_name ?? null,
  tradeType: row.trade_type ?? null,
  city: row.city ?? null,
  state: row.state ?? null,
  phone: row.phone ?? null,
  email: row.email ?? null,
  logoUrl: row.logo_url ?? null,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
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
  const payload: Partial<DatabaseProposalRow> & { user_id: string } = {
    user_id: input.userId,
    quickquote_id: input.quickquoteId ?? null,
    options: toJson(input.options),
    totals: toJson(input.totals),
    status: input.status ?? "Generated",
    accepted_option: input.acceptedOption ?? null,
  };
  const { data, error } = await client.from("proposals").insert(payload).select("*").single();
  if (error) throw error;
  return buildProposalRecord(data as DatabaseProposalRow);
}

export async function listProposals(client: SupabaseClient, userId: string): Promise<Proposal[]> {
  const { data, error } = await client
    .from("proposals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as DatabaseProposalRow[]).map((row) => buildProposalRecord(row));
}

export async function findProposalByQuickquote(
  client: SupabaseClient,
  userId: string,
  quickquoteId: string
): Promise<Proposal | null> {
  const { data, error } = await client
    .from("proposals")
    .select("*")
    .eq("user_id", userId)
    .eq("quickquote_id", quickquoteId)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return buildProposalRecord(data as DatabaseProposalRow);
}

export async function updateProposalStatus(
  client: SupabaseClient,
  input: ProposalStatusUpdateInput
): Promise<Proposal> {
  const { data, error } = await client
    .from("proposals")
    .update({
      status: input.status,
      accepted_option: input.acceptedOption ?? null,
    })
    .eq("user_id", input.userId)
    .eq("id", input.proposalId)
    .select("*")
    .single();
  if (error) throw error;
  return buildProposalRecord(data as DatabaseProposalRow);
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
    city: input.city ?? null,
    state: input.state ?? null,
    phone: input.phone ?? null,
    email: input.email ?? null,
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

export const schemaPath = new URL("../schema.sql", import.meta.url).pathname;

export type { SupabaseClient };
