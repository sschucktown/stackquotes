import { defineStore } from 'pinia'
import { useSupabaseClient, useSupabaseUser } from '#imports'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any, // supabase.User | null
    loading: true,
  }),

  actions: {
    async init() {
      const supabase = useSupabaseClient()
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error('❌ Error getting session:', error)
      }

      this.user = data?.session?.user ?? null
      this.loading = false

      console.log('✅ Auth store initialized:', this.user)

      // Subscribe to auth changes
      supabase.auth.onAuthStateChange((_event, session) => {
        this.user = session?.user ?? null
        console.log('🔄 Auth state changed:', _event, this.user)
      })
    },

    async logout() {
      const supabase = useSupabaseClient()
      await supabase.auth.signOut()
      this.user = null
    }
  }
})
