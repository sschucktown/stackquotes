import { createClient } from "@supabase/supabase-js";

/**
 * Returns a Supabase client authenticated with the SERVICE ROLE key.
 * This client:
 * - Bypasses RLS
 * - Can insert/update/delete freely
 * - Must ONLY be used server-side
 */
export function getServiceClient() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // 🚨 Fail fast — do NOT allow silent misconfiguration
  if (!url) {
    throw new Error("❌ SUPABASE_URL is missing");
  }

  if (!serviceKey) {
    throw new Error("❌ SUPABASE_SERVICE_ROLE_KEY is missing");
  }

  console.log("🔐 [Supabase] Using SERVICE ROLE client");

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        // Makes it obvious in Supabase logs which client did the write
        "x-stackquotes-role": "service",
      },
    },
  });
}
