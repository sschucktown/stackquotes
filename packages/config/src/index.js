import { z } from "zod";
const serverSchema = z.object({
    SUPABASE_URL: z.string().url(),
    SUPABASE_ANON_KEY: z.string().min(1, "SUPABASE_ANON_KEY is required"),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
    RESEND_API_KEY: z.string().optional(),
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    STRIPE_CONNECT_CLIENT_ID: z.string().optional(),
    STRIPE_PRODUCT_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
    BASE_APP_URL: z.string().url().optional(),
    BASE_API_URL: z.string().url().optional(),
    EMAIL_TRACKING_BASE_URL: z.string().url().optional(),
});
const clientSchema = z.object({
    VITE_SUPABASE_URL: z.string().url(),
    VITE_SUPABASE_ANON_KEY: z.string().min(1, "VITE_SUPABASE_ANON_KEY is required"),
    VITE_APP_NAME: z.string().default("StackQuotes"),
    VITE_API_BASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
    VITE_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
});
export class ConfigError extends Error {
    issues;
    constructor(issues) {
        super(`Invalid environment configuration:\n${issues.join("\n")}`);
        this.issues = issues;
    }
}
function formatIssues(issues) {
    return issues.map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`);
}
export function loadServerConfig(env = process.env) {
    const parsed = serverSchema.safeParse(env);
    if (!parsed.success) {
        throw new ConfigError(formatIssues(parsed.error.issues));
    }
    return parsed.data;
}
export function loadClientConfig(env) {
    const parsed = clientSchema.safeParse(env);
    if (!parsed.success) {
        throw new ConfigError(formatIssues(parsed.error.issues));
    }
    return parsed.data;
}
export const config = {
    server: (env) => loadServerConfig(env),
    client: (env) => loadClientConfig(env),
};
