// apps/web/plugins/debug.client.ts
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
      console.warn('⚠️ Supabase client is NOT available in debug plugin')
    } else {
      console.log('✅ Supabase client initialized:', sb)
    }
  })
})
