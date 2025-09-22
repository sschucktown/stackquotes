// apps/web/plugins/debug.client.ts
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  console.log('🟣 Runtime Supabase URL:', config.public.supabaseUrl)
  console.log('🟣 Runtime Supabase Anon Key exists:', !!config.public.supabaseAnonKey)
})
