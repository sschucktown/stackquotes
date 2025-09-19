import { defineStore } from 'pinia'
import { z } from 'zod'
import { useAuthStore } from '~/stores/auth'

export type LineItem = { id?: string; description: string; qty: number; unitPrice: number }
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
  state: () => ({ list: [] as Quote[], current: null as Quote | null }),
  actions: {
    async load() {
      const sb = useSb()
      const auth = useAuthStore()
      const { data, error } = await sb
        .from('quotes')
        .select('*')
        .eq('contractor_id', auth.user?.id) // ✅ only load this contractor’s quotes
        .order('created_at', { ascending: false })
      if (error) throw error
      this.list = (data ?? []) as Quote[]
    },

    async create(payload: Partial<Quote>) {
  const sb = useSb()
  const auth = useAuthStore()

  if (!auth.user?.id) {
    throw new Error("No contractor (auth user) found")
  }

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
      const { data, error } = await sb
        .from('quotes')
        .select('*')
        .eq('id', id)
        .eq('contractor_id', auth.user?.id) // ✅ enforce ownership
        .single()
      if (error) throw error
      this.current = data as Quote
      return this.current
    },
  },
})
