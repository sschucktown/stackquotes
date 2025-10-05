import { createClient } from "@supabase/supabase-js";
import { loadServerConfig } from "@stackquotes/config";
export const createSupabase = (options = {}) => {
    const config = loadServerConfig(options.env);
    return createClient(config.SUPABASE_URL, options.useServiceRole ? config.SUPABASE_SERVICE_ROLE_KEY : config.SUPABASE_ANON_KEY, {
        auth: {
            persistSession: false,
        },
    });
};
const lineItemTotals = (lineItems) => {
    const normalised = lineItems.map((item) => ({
        ...item,
        quantity: Number(item.quantity || 0),
        unitPrice: Number(item.unitPrice || 0),
        total: Number(item.quantity || 0) * Number(item.unitPrice || 0),
    }));
    const subtotal = normalised.reduce((sum, item) => sum + item.total, 0);
    return { lineItems: normalised, subtotal };
};
const toLineItems = (value) => {
    if (!Array.isArray(value)) {
        return [];
    }
    return value.map((item) => ({
        ...item,
        quantity: Number(item.quantity || 0),
        unitPrice: Number(item.unitPrice || 0),
        total: Number(item.total || Number(item.quantity || 0) * Number(item.unitPrice || 0)),
    }));
};
const buildEstimateRecord = (row) => ({
    id: row.id,
    userId: row.user_id,
    clientId: row.client_id,
    projectTitle: row.project_title,
    lineItems: toLineItems(row.line_items),
    subtotal: row.subtotal,
    tax: row.tax,
    total: row.total,
    notes: row.notes ?? undefined,
    status: row.status,
    convertedToProposal: row.converted_to_proposal,
    jobId: row.job_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});
const buildClientRecord = (row) => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    address: row.address ?? undefined,
    createdAt: row.created_at,
});
const buildSettingsRecord = (row) => ({
    userId: row.user_id,
    defaultTaxRate: row.default_tax_rate,
    footerText: row.footer_text ?? undefined,
    logoUrl: row.logo_url ?? undefined,
    companyName: row.company_name ?? undefined,
    orgId: row.org_id ?? undefined,
});
export async function listEstimates(client, userId, filters = {}) {
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
    if (error)
        throw error;
    return data.map((row) => buildEstimateRecord(row));
}
export async function getEstimate(client, userId, estimateId) {
    const { data, error } = await client
        .from("estimates")
        .select("*")
        .eq("user_id", userId)
        .eq("id", estimateId)
        .maybeSingle();
    if (error)
        throw error;
    if (!data)
        return null;
    return buildEstimateRecord(data);
}
export async function createEstimateRecord(client, input) {
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
    };
    const { data, error } = await client.from("estimates").insert(payload).select("*").single();
    if (error)
        throw error;
    return buildEstimateRecord(data);
}
export async function updateEstimateRecord(client, input) {
    const existing = await getEstimate(client, input.userId, input.id);
    if (!existing) {
        throw new Error("Estimate not found");
    }
    const mergedLineItems = input.lineItems ?? existing.lineItems;
    const { lineItems, subtotal } = lineItemTotals(mergedLineItems);
    const taxRate = input.taxRate ?? (existing.subtotal === 0 ? 0 : existing.tax / existing.subtotal);
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    const payload = {
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
    if (error)
        throw error;
    return buildEstimateRecord(data);
}
export async function duplicateEstimate(client, input) {
    const source = await getEstimate(client, input.userId, input.id);
    if (!source)
        throw new Error("Estimate not found");
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
export async function listClients(client, userId) {
    const { data, error } = await client
        .from("clients")
        .select("*")
        .eq("user_id", userId)
        .order("name", { ascending: true });
    if (error)
        throw error;
    return data.map((row) => buildClientRecord(row));
}
export async function getClient(client, userId, clientId) {
    const { data, error } = await client
        .from("clients")
        .select("*")
        .eq("user_id", userId)
        .eq("id", clientId)
        .maybeSingle();
    if (error)
        throw error;
    if (!data)
        return null;
    return buildClientRecord(data);
}
export async function createClientRecord(client, input) {
    const payload = {
        user_id: input.userId,
        name: input.name,
        email: input.email,
        phone: input.phone ?? null,
        address: input.address ?? null,
    };
    const { data, error } = await client.from("clients").insert(payload).select("*").single();
    if (error)
        throw error;
    return buildClientRecord(data);
}
export async function getUserSettings(client, userId) {
    const { data, error } = await client
        .from("user_settings")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
    if (error)
        throw error;
    if (!data)
        return null;
    return buildSettingsRecord(data);
}
export async function upsertUserSettings(client, input) {
    const payload = {
        user_id: input.userId,
        default_tax_rate: input.defaultTaxRate ?? 0,
        footer_text: input.footerText ?? null,
        logo_url: input.logoUrl ?? null,
        company_name: input.companyName ?? null,
        org_id: input.orgId ?? null,
    };
    const { data, error } = await client
        .from("user_settings")
        .upsert(payload, { onConflict: "user_id" })
        .select("*")
        .single();
    if (error)
        throw error;
    return buildSettingsRecord(data);
}
export const schemaPath = new URL("../schema.sql", import.meta.url).pathname;
