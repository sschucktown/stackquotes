import { defineStore } from 'pinia'

type Profile = { id: string; company_name: string | null; logo_url: string | null }

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any,
    profile: null as Profile | null,
  }),
  actions: {
    async init() {
      const { $supabase } = useNuxtApp()
      const { data: { user } } = await $supabase.auth.getUser()
      this.user = user
      if (user) await this.fetchProfile()
    },
    async signIn(email: string) {
      const { $supabase } = useNuxtApp()
      const { error } = await $supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      })
      if (error) throw error
    },
    async signOut() {
      const { $supabase } = useNuxtApp()
      await $supabase.auth.signOut()
      this.user = null
      this.profile = null
    },
    async fetchProfile() {
      const { $supabase } = useNuxtApp()
      const { data, error } = await $supabase.from('contractors').select('*').single()
      if (error) throw error
      this.profile = data as Profile
    },
    async updateBrand(payload: { company_name?: string; logo_url?: string | null }) {
      const { $supabase } = useNuxtApp()
      const { data, error } = await $supabase
        .from('contractors')
        .upsert(payload)
        .select('*')
        .single()
      if (error) throw error
      this.profile = data
    },
  },
})
