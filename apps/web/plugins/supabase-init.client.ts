// apps/web/plugins/supabase-init.client.ts
import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => {
    const config = useRuntimeConfig()

    console.log('🟣 Runtime Supabase URL:', config.public.supabaseUrl || '❌ MISSING')
    console.log('🟣 Runtime Supabase Anon Key exists:', !!config.public.supabaseAnonKey)

    let sb: ReturnType<typeof useSupabaseClient> | null = null
    try {
      sb = useSupabaseClient()
      console.log("✅ Supabase client is now available in app:mounted:", sb)
    } catch (err) {
      console.error("❌ useSupabaseClient() still failed:", err)
    }

    if (!sb) {
      console.warn('⚠️ Supabase client not available, skipping auth init')
      return
    }

    console.log('✅ Supabase client available, initializing auth...')
    const auth = useAuthStore()
    auth.init()
  })
})
