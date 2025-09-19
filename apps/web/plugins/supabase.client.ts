// apps/web/plugins/supabase.client.ts
import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const supabaseUrl = config.public.supabaseUrl
  const supabaseAnonKey = config.public.supabaseAnonKey

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase URL or Anon Key missing in runtimeConfig')
    throw new Error('Supabase not configured — check your env vars in Vercel')
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // Provide as $supabase
  nuxtApp.provide('supabase', supabase)

  // Also make a composable-style helper
  globalThis.useSb = () => supabase
})
