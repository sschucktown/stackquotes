// apps/web/plugins/supabase.client.ts
import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const supabaseUrl = config.public.supabaseUrl
  const supabaseAnonKey = config.public.supabaseAnonKey

  console.log('📡 Supabase plugin init...')
  console.log('📡 Supabase URL:', supabaseUrl)
  console.log('📡 Supabase Anon Key exists:', !!supabaseAnonKey)

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase env vars missing. Check NUXT_PUBLIC_SUPABASE_URL / NUXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_*')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  console.log('✅ Supabase client created')

  return {
    provide: { supabase },
  }
})
