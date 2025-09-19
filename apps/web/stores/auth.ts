// apps/web/stores/auth.ts
import { defineStore } from 'pinia'

type Profile = { id: string; company_name: string | null; logo_url: string | null }

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any,
    profile: null as Profile | null,
    initialized: false,
    loading: true, // 👈 track auth bootstrap
  }),
  actions: {
    async init() {
      if (process.server) return
      if (this.initialized) return
      this.initialized = true
      this.loading = true

      const sb = useSb()
      if (!sb?.auth) {
        console.warn('❌ Supabase client not ready in init()')
        this.loading = false
        return
      }

      const { data: { user } } = await sb.auth.getUser()
      this.user = user
      if (user) await this.fetchProfileOrCreate()

      // 🔑 Keep session synced
      sb.auth.onAuthStateChange(async (_event, session) => {
        this.user = session?.user ?? null
        if (this.user) {
          await this.fetchProfileOrCreate()
        } else {
          this.profile = null
        }
      })

      this.loading = false
    },
    // ... signIn, signOut, fetchProfileOrCreate, updateBrand (unchanged) ...
  },
})
