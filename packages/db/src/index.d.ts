import { type SupabaseClient } from "@supabase/supabase-js";
import type { Client, Estimate, EstimateFilters, LineItem, UserSettings } from "@stackquotes/types";
type Json = Record<string, unknown> | Json[] | string | number | boolean | null;
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
export interface SupabaseFactoryOptions {
    useServiceRole?: boolean;
    env?: Record<string, string | undefined>;
}
export declare const createSupabase: (options?: SupabaseFactoryOptions) => SupabaseClient;
export declare function listEstimates(client: SupabaseClient, userId: string, filters?: EstimateFilters): Promise<Estimate[]>;
export declare function getEstimate(client: SupabaseClient, userId: string, estimateId: string): Promise<Estimate | null>;
export declare function createEstimateRecord(client: SupabaseClient, input: EstimateInput): Promise<Estimate>;
export declare function updateEstimateRecord(client: SupabaseClient, input: EstimateUpdateInput): Promise<Estimate>;
export declare function duplicateEstimate(client: SupabaseClient, input: EstimateDuplicateInput): Promise<Estimate>;
export declare function listClients(client: SupabaseClient, userId: string): Promise<Client[]>;
export declare function getClient(client: SupabaseClient, userId: string, clientId: string): Promise<Client | null>;
export declare function createClientRecord(client: SupabaseClient, input: ClientInput): Promise<Client>;
export declare function getUserSettings(client: SupabaseClient, userId: string): Promise<UserSettings | null>;
export declare function upsertUserSettings(client: SupabaseClient, input: SettingsInput): Promise<UserSettings>;
export declare const schemaPath: string;
export type { SupabaseClient };
//# sourceMappingURL=index.d.ts.map