import { defineStore } from 'pinia'
import { z } from 'zod'
import { useAuthStore } from '~/stores/auth'

export type LineItem = {
  id?: string
  description: string
  qty: number
  unitPrice: number
}

export type Quote = {
  id: string
  client_id: string
  contractor_id: string
  status: 'draft' | 'sent' | 'accepted' | 'declined'
  subtotal: number
  deposit_amount: number | null
  options: {
    good: LineItem[]
    better: LineItem[]
    best: LineItem[]
  }
}

export const LineItemSchema = z.object({
  description: z.string().min(1),
  qty: z.number().min(0),
  unitPrice: z.number().min(0),
})

export const useQuoteStore = defineStore('quotes', {
  state: () => ({
    list: [] as Quote[],
    current: null as Quote | null,
  }),

  actions: {
    async load() {
      const sb = useSb()
      const auth = useAuthStore()

      if (!auth.user?.id) {
        console.warn('⚠️ Tried to load quotes without a logged-in user')
        return
      }

      const { data, error } = await sb
        .from('quotes')
        .select('*')
        .eq('contractor_id', auth.user.id) // ✅ scoped to contractor
        .order('created_at', { ascending: false })

      if (error) throw error
      this.list = (data ?? []) as Quote[]
    },

    async create(payload: Partial<Quote>) {
      const sb = useSb()
      const auth = useAuthStore()

      if (!auth.user?.id) {
        throw new Error('❌ No contractor (auth user) found')
      }

      // ✅ force contractor_id
      const fullPayload = {
        contractor_id: auth.user.id,
        ...payload,
      }

      const { data, error } = await sb
        .from('quotes')
        .insert(fullPayload)
        .select('*')
        .single()

      if (error) throw error

      this.list.unshift(data as Quote)
      return data as Quote
    },

    async byId(id: string) {
      const sb = useSb()
      const auth = useAuthStore()

      if (!auth.user?.id) {
        throw new Error('❌ No contractor (auth user) found')
      }

      const { data, error } = await sb
        .from('quotes')
        .select('*')
        .eq('id', id)
        .eq('contractor_id', auth.user.id) // ✅ enforce ownership
        .single()

      if (error) throw error
      this.current = data as Quote
      return this.current
    },

    async update(id: string, changes: Partial<Quote>) {
      const sb = useSb()
      const auth = useAuthStore()

      if (!auth.user?.id) {
        throw new Error('❌ No contractor (auth user) found')
      }

      const { data, error } = await sb
        .from('quotes')
        .update(changes)
        .eq('id', id)
        .eq('contractor_id', auth.user.id)
        .select('*')
        .single()

      if (error) throw error

      // Update list + current
      const idx = this.list.findIndex(q => q.id === id)
      if (idx !== -1) this.list[idx] = data as Quote
      if (this.current?.id === id) this.current = data as Quote

      return data as Quote
    },

    async remove(id: string) {
      const sb = useSb()
      const auth = useAuthStore()

      if (!auth.user?.id) {
        throw new Error('❌ No contractor (auth user) found')
      }

      const { error } = await sb
        .from('quotes')
        .delete()
        .eq('id', id)
        .eq('contractor_id', auth.user.id)

      if (error) throw error

      // Update store state
      this.list = this.list.filter(q => q.id !== id)
      if (this.current?.id === id) this.current = null
    },
