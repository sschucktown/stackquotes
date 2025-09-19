// apps/web/stores/auth.ts
import { defineStore } from 'pinia'

type Profile = { id: string; company_name: string | null; logo_url: string | null }

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any,
    profile: null as Profile | null,
  }),
  actions: {
    async init() {
      if (process.server) return

      const sb = useSb()
      if (!sb?.auth) {
        console.warn('Supabase client not ready in init()')
        return
      }

      const { data: { user }, error } = await sb.auth.getUser()
      if (error) {
        console.error('Error getting user:', error)
        return
      }

      this.user = user
      if (user) await this.fetchProfile()
    },

    async signIn(email: string) {
      const sb = useSb()
      if (!sb?.auth) throw new Error('Supabase client not ready')
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      })
      if (error) throw error
    },

    async signOut() {
      const sb = useSb()
      if (!sb?.auth) throw new Error('Supabase client not ready')
      await sb.auth.signOut()
      this.user = null
      this.profile = null
    },

    async fetchProfile() {
      const sb = useSb()
      if (!sb) throw new Error('Supabase client not ready')
      if (!this.user?.id) return

      const { data, error } = await sb
        .from('contractors')
        .select('*')
        .eq('id', this.user.id)
        .maybeSingle()

      if (error) {
        console.error('fetchProfile error:', error)
        return
      }

      this.profile = data as Profile | null
    },

    async updateBrand(payload: { company_name?: string; logo_url?: string | null }) {
      const sb = useSb()
      if (!sb) throw new Error('Supabase client not ready')
      if (!this.user?.id) throw new Error('No user logged in')

      const { data, error } = await sb
        .from('contractors')
        .upsert({ id: this.user.id, ...payload })
        .select('*')
        .maybeSingle()

      if (error) {
        console.error('updateBrand error:', error)
        return
      }

      this.profile = data as Profile
    },
  },
})
