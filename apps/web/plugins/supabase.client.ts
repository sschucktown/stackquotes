// apps/web/plugins/supabase.client.ts
import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabaseUrl!
  const supabaseAnonKey = config.public.supabaseAnonKey!
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  return { provide: { supabase } }
})
