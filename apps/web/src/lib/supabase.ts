import { createClient } from "@supabase/supabase-js";
import { loadClientConfig } from "@stackquotes/config";

const config = loadClientConfig(import.meta.env);

export const supabase = createClient(config.VITE_SUPABASE_URL, config.VITE_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    storageKey: "stackquotes.auth",
  },
});

export const apiBaseUrl = config.VITE_API_BASE_URL ?? "/api";

