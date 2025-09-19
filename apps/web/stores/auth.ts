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
    initialized: false, // prevents duplicate init calls
  }),

  actions: {
    async init() {
      if (process.server) return
      if (this.initialized) return
      this.initialized = true

      const sb = useSb()
      if (!sb?.auth) {
        console.warn('❌ Supabase client not ready in init()')
        return
      }

      console.log('🔑 Restoring session with supabase.auth.getUser()...')
      const { data: { user }, error } = await sb.auth.getUser()
      if (error) {
        console.error('❌ Error in getUser:', error)
        return
      }

      this.user = user
      console.log('👤 User result:', user)

      if (user) {
        await this.fetchProfileOrCreate()
      }
    },

    async signIn(email: string) {
      const sb = useSb()
      if (!sb?.auth) throw new Error('Supabase client not ready')

      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      })

      if (error) throw error
      alert('✅ Magic link sent! Check your email.')
    },

    async signOut() {
      const sb = useSb()
      if (!sb?.auth) throw new Error('Supabase client not ready')

      await sb.auth.signOut()
      this.user = null
      this.profile = null
      this.initialized = false
    },

    async fetchProfileOrCreate() {
      const sb = useSb()
      if (!sb) throw new Error('Supabase client not ready')
      if (!this.user?.id) throw new Error('No user ID available')

      // ✅ Upsert avoids duplicates when multiple init calls fire
      const { data, error } = await sb
        .from('contractors')
        .upsert(
          { id: this.user.id, company_name: null, logo_url: null },
          { onConflict: 'id' }
        )
        .select('*')
        .single()

      if (error) {
        console.error('❌ Error in fetchProfileOrCreate:', error)
        throw error
      }

      console.log('✅ Profile ready:', data)
      this.profile = data as Profile
    },

    async updateBrand(payload: { company_name?: string; logo_url?: string | null }) {
      const sb = useSb()
      if (!sb) throw new Error('Supabase client not ready')
      if (!this.user?.id) throw new Error('No user ID available')

      const { data, error } = await sb
        .from('contractors')
        .upsert(
          { id: this.user.id, ...payload },
          { onConflict: 'id' }
        )
        .select('*')
        .single()

      if (error) throw error
      this.profile = data as Profile
    },
  },
})
