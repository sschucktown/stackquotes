import { z } from "zod";

type EnvSource = Record<string, string | undefined>;

const serverSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1, "SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
  RESEND_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PRODUCT_ID: z.string().optional(),
  BASE_APP_URL: z.string().url().optional(),
  BASE_API_URL: z.string().url().optional(),
  EMAIL_TRACKING_BASE_URL: z.string().url().optional(),
});

const clientSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, "VITE_SUPABASE_ANON_KEY is required"),
  VITE_APP_NAME: z.string().default("StackQuotes"),
  VITE_API_BASE_URL: z.string().url().optional(),
});

export type ServerConfig = z.infer<typeof serverSchema>;
export type ClientConfig = z.infer<typeof clientSchema>;

export class ConfigError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Invalid environment configuration:\n${issues.join("\n")}`);
  }
}

function formatIssues(issues: z.ZodIssue[]): string[] {
  return issues.map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`);
}

export function loadServerConfig(env: EnvSource = process.env): ServerConfig {
  const parsed = serverSchema.safeParse(env);
  if (!parsed.success) {
    throw new ConfigError(formatIssues(parsed.error.issues));
  }
  return parsed.data;
}

export function loadClientConfig(env: EnvSource): ClientConfig {
  const parsed = clientSchema.safeParse(env);
  if (!parsed.success) {
    throw new ConfigError(formatIssues(parsed.error.issues));
  }
  return parsed.data;
}

export const config = {
  server: (env?: EnvSource) => loadServerConfig(env),
  client: (env: EnvSource) => loadClientConfig(env),
};

