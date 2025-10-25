import { z } from "zod";

type EnvSource = Record<string, string | undefined>;

const serverSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1, "SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),
  RESEND_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_CONNECT_CLIENT_ID: z.string().optional(),
  STRIPE_PRODUCT_ID: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  PRO_PRICE_ID: z.string().optional(),
  STRIPE_PRICE_PRO: z.string().optional(),
  STRIPE_ADDON_PERMITSYNC: z.string().optional(),
  STRIPE_ADDON_SUPPLYLINK: z.string().optional(),
  STRIPE_ADDON_QUOTEIQ_PLUS: z.string().optional(),
  STRIPE_ADDON_FINANCING_BOOST: z.string().optional(),
  FORCE_REQUIRE_CC_FOR_TEST: z.string().optional(),
  BASE_APP_URL: z.string().url().optional(),
  BASE_API_URL: z.string().url().optional(),
  EMAIL_TRACKING_BASE_URL: z.string().url().optional(),
  WISESTACK_PARTNER_ID: z.string().optional(),
  WISESTACK_API_KEY: z.string().optional(),
  WISESTACK_ENV: z.enum(["sandbox", "production"]).default("sandbox"),
});

const clientSchema = z.object({
  VITE_SUPABASE_URL: z.string().url(),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, "VITE_SUPABASE_ANON_KEY is required"),
  VITE_APP_NAME: z.string().default("StackQuotes"),
  VITE_API_BASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  VITE_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_FORCE_REQUIRE_CC_FOR_TEST: z.string().optional(),
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

export { STRIPE_PRICES, PRICE_ID_TO_PLAN } from "./stripePrices.js";

