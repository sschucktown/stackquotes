import { defineStore } from 'pinia'


type Profile = { id: string; company_name: string | null; logo_url: string | null }


export const useAuthStore = defineStore('auth', {
state: () => ({ user: null as any, profile: null as Profile | null }),
actions: {
async init() {
const sb = useSb()
const { data: { user } } = await sb.auth.getUser()
this.user = user
if (user) await this.fetchProfile()
},
async signIn(email: string) {
const sb = useSb()
const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })
if (error) throw error
},
async signOut() {
const sb = useSb()
await sb.auth.signOut()
this.user = null; this.profile = null
},
async fetchProfile() {
const sb = useSb()
const { data, error } = await sb.from('contractors').select('*').single()
if (error) throw error
this.profile = data as Profile
},
async updateBrand(payload: { company_name?: string; logo_url?: string | null }) {
const sb = useSb()
const { data, error } = await sb.from('contractors').upsert(payload).select('*').single()
if (error) throw error
this.profile = data
}
}
})
