import { createSupabase } from "@stackquotes/db";
import type { SupabaseClient } from "@stackquotes/db";

export const getServiceClient = (env?: Record<string, string | undefined>): SupabaseClient => {
  return createSupabase({ useServiceRole: true, env });
};

export const getAnonClient = (env?: Record<string, string | undefined>): SupabaseClient => {
  return createSupabase({ useServiceRole: false, env });
};

