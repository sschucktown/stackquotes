import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => {
    const config = useRuntimeConfig()

    console.log('🟣 Runtime Supabase URL:', config.public.supabaseUrl || '❌ MISSING')
    console.log('🟣 Runtime Supabase Anon Key exists:', !!config.public.supabaseAnonKey)

    let sb: ReturnType<typeof useSupabaseClient> | null = null
    try {
      sb = useSupabaseClient()
    } catch (err) {
      console.error('❌ useSupabaseClient() failed:', err)
    }

    if (!sb) {
      console.warn('⚠️ Supabase client not available, skipping auth init')
      return
    }

    console.log('✅ Supabase client available, initializing auth...')
    useAuthStore().init()
  })
})
