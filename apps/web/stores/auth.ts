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
      if (process.server) {
        console.log('⚡ auth.init() skipped (server-side)')
        return
      }
      if (this.initialized) {
        console.log('⚡ auth.init() skipped (already initialized)')
        return
      }
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
        console.log('⚠️ No active session found, user not logged in')
        this.user = null
        return
      }

      console.log('✅ Session found:', session)
      const { data: { user }, error: userError } = await sb.auth.getUser()

      if (userError) {
        console.error('❌ Error in getUser:', userError)
        return
      }

      this.user = user
      console.log('👤 User result:', user)

      if (user) {
        await this.fetchProfileOrCreate()
      }
    },

    async signIn(email: string) {
      const sb = useSupabaseClient()
      if (!sb?.auth) throw new Error('Supabase client not ready')

      console.log('📧 Sending magic link to:', email)
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      })

      if (error) {
        console.error('❌ Sign-in error:', error)
        throw error
      }

      alert('✅ Magic link sent! Check your email.')
    },

    async signOut() {
      const sb = useSupabaseClient()
      if (!sb?.auth) throw new Error('Supabase client not ready')

      console.log('🚪 Signing out...')
      await sb.auth.signOut()
      this.user = null
      this.profile = null
      this.initialized = false
      console.log('✅ Signed out')
    },

    async fetchProfileOrCreate() {
      const sb = useSupabaseClient()
      if (!sb) throw new Error('Supabase client not ready')
      if (!this.user?.id) throw new Error('No user ID available')

      console.log('📄 Fetching or creating profile for user:', this.user.id)

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
      const sb = useSupabaseClient()
      if (!sb) throw new Error('Supabase client not ready')
      if (!this.user?.id) throw new Error('No user ID available')

      console.log('🎨 Updating brand for user:', this.user.id, 'with:', payload)

      const { data, error } = await sb
        .from('contractors')
        .upsert(
          { id: this.user.id, ...payload },
          { onConflict: 'id' }
        )
        .select('*')
        .single()

      if (error) {
        console.error('❌ Error in updateBrand:', error)
        throw error
      }

      console.log('✅ Brand updated:', data)
      this.profile = data as Profile
    },
  },
})
