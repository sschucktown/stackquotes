// apps/web/plugins/supabase-init.client.ts
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(() => {
  onNuxtReady(() => {
    const config = useRuntimeConfig()

    console.log('🟣 Runtime Supabase URL:', config.public.supabaseUrl || '❌ MISSING')
    console.log('🟣 Runtime Supabase Anon Key exists:', !!config.public.supabaseAnonKey)

    let sb: ReturnType<typeof useSupabaseClient> | null = null
    try {
      sb = useSupabaseClient()
    } catch (err) {
      console.error('❌ useSupabaseClient() threw an error:', err)
    }

    if (!sb) {
      console.warn('⚠️ Supabase client is NOT available yet in supabase-init plugin')
      return
    }

    console.log('✅ Supabase client available, initializing auth...')

    const auth = useAuthStore()
    auth.init()
  })
})
