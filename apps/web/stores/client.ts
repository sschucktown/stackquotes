// apps/web/stores/client.ts
import { defineStore } from 'pinia'

export type Client = {
  id: string
  name: string
  email: string | null
  phone: string | null
}

export const useClientStore = defineStore('clients', {
  state: () => ({
    list: [] as Client[],
    current: null as Client | null,
  }),
  actions: {
    async load() {
      const sb = useSb()
      const { data, error } = await sb.from('clients').select('*').order('created_at', { ascending: false })
      if (error) throw error
      this.list = data as Client[]
    },
    async byId(id: string) {
      const sb = useSb()
      const { data, error } = await sb.from('clients').select('*').eq('id', id).single()
      if (error) throw error
      this.current = data as Client
      return this.current
    },
    async create(payload: Partial<Client>) {
      const sb = useSb()
      const { data, error } = await sb.from('clients').insert(payload).select('*').single()
      if (error) throw error
      this.list.unshift(data as Client)
      return data as Client
    },
  },
})
