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

      let sb: ReturnType<typeof useSupabaseClient> | null = null
      try {
        sb = useSupabaseClient()
      } catch (err) {
        console.error('❌ Failed to get Supabase client via useSupabaseClient()', err)
      }

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
      let sb: ReturnType<typeof useSupabaseClient> | null = null
      try {
        sb = useSupabaseClient()
      } catch (err) {
        console.error('❌ Failed to get Supabase client', err)
      }
      if (!sb?.auth) throw new Error('Supabase client not ready')

      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      })

      if (error) throw error
      alert('✅ Magic link sent! Check your email.')
    },

    async signOut() {
      let sb: ReturnType<typeof useSupabaseClient> | null = null
      try {
        sb = useSupabaseClient()
      } catch (err) {
        console.error('❌ Failed to get Supabase client', err)
      }
      if (!sb?.auth) throw new Error('Supabase client not ready')

      await sb.auth.signOut()
      this.user = null
      this.profile = null
      this.initialized = false
      console.log('✅ Signed out')
    },

    async fetchProfileOrCreate() {
      let sb: ReturnType<typeof useSupabaseClient> | null = null
      try {
        sb = useSupabaseClient()
      } catch (err) {
        console.error('❌ Failed to get Supabase client', err)
      }
      if (!sb) throw new Error('Supabase client not ready')
      if (!this.user?.id) throw new Error('No user ID available')

      const { data, error } = await sb
        .from('contractors')
        .upsert(
          { id: this.user.id, company_name: null, logo_url: null },
          { onConflict: 'id' }
        )
        .select('*')
        .single()

      if (error) throw error
      this.profile = data as Profile
      console.log('✅ Profile loaded or created:', data)
    },

    async updateBrand(payload: { company_name?: string; logo_url?: string | null }) {
      let sb: ReturnType<typeof useSupabaseClient> | null = null
      try {
        sb = useSupabaseClient()
      } catch (err) {
        console.error('❌ Failed to get Supabase client', err)
      }
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
      console.log('✅ Brand updated:', data)
    },
  },
})
