// apps/web/stores/auth.ts
import { defineStore } from 'pinia'

type Profile = {
  id: string
  company_name: string | null
  logo_url: string | null
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any,
    profile: null as Profile | null,
    initialized: false,
  }),

  actions: {
    async init() {
      if (process.server) return
      if (this.initialized) return
      this.initialized = true

      const sb = useSupabaseClient()
      if (!sb?.auth) {
        console.warn('❌ Supabase client not ready in init()')
        return
      }

      console.log('🔑 Restoring session with supabase.auth.getSession()...')
      const { data: { session }, error: sessionError } = await sb.auth.getSession()

      if (sessionError) {
        console.error('❌ Error in getSession:', sessionError)
        return
      }

      if (!session) {
        console.log('⚠️ No acti
