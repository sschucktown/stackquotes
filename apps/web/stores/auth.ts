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
        console.warn('❌ Supabase client not ready in init()')
        return
      }

      console.log('🔑 Calling supabase.auth.getUser()...')
      const { data: { user }, error } = await sb.auth.getUser()
      if (error) {
        console.error('❌ Error in getUser:', error)
      }
      console.log('👤 User result:', user)

      this.user = user
      if (user) {
        console.log('➡️ Fetching profile...')
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
    },

    async signOut() {
      const sb = useSb()
      if (!sb?.auth) throw new Error('Supabase client not ready')
      await sb.auth.signOut()
      this.user = null
      this.profile = null
    },

    async fetchProfileOrCreate() {
      const sb = useSb()
      if (!sb) throw new Error('Supabase client not ready')

      // Try to fetch
      const { data, error } = await sb.from('contractors').select('*').eq('id', this.user.id).single()
      if (error && error.code !== 'PGRST116') {
        // 116 = no rows
        throw error
      }

      if (data) {
        console.log('✅ Profile loaded:', data)
        this.profile = data as Profile
        return
      }

      // If not found, insert
      console.log('ℹ️ No profile found, creating default...')
      const { data: created, error: insertErr } = await sb.from('contractors')
        .insert({ id: this.user.id, company_name: null, logo_url: null })
        .select('*')
        .single()
      if (insertErr) throw insertErr

      console.log('✅ Profile created:', created)
      this.profile = created as Profile
    },

    async updateBrand(payload: { company_name?: string; logo_url?: string | null }) {
      const sb = useSb()
      if (!sb) throw new Error('Supabase client not ready')
      const { data, error } = await sb.from('contractors').upsert({
        id: this.user?.id,
        ...payload,
      }).select('*').single()
      if (error) throw error
      this.profile = data as Profile
    },
  },
})
