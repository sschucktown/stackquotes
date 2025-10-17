import { createSupabase } from "@stackquotes/db";
import type { SupabaseClient } from "@stackquotes/db";

const REQUIRED_KEYS = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_ANON_KEY"
] as const;

const validateEnv = (env: Record<string, string | undefined>) => {
  const missing = REQUIRED_KEYS.filter((key) => !env[key]);
  if (missing.length) {
    console.error("[supabase] missing env", missing);
    throw new Error(`Supabase configuration missing: ${missing.join(", ")}`);
  }
};

export const getServiceClient = (
  env: Record<string, string | undefined> = process.env
): SupabaseClient => {
  validateEnv(env);
  return createSupabase({ useServiceRole: true, env });
};

export const getAnonClient = (
  env: Record<string, string | undefined> = process.env
): SupabaseClient => {
  validateEnv(env);
  return createSupabase({ useServiceRole: false, env });
};
