import { defineStore } from 'pinia'


export type Client = { id: string; name: string; email: string; phone?: string | null }


export const useClientStore = defineStore('clients', {
state: () => ({ list: [] as Client[] }),
actions: {
async load() {
const sb = useSb()
const { data, error } = await sb.from('clients').select('*').order('created_at', { ascending: false })
if (error) throw error
this.list = data as Client[]
},
async add(c: Omit<Client, 'id'>) {
const sb = useSb()
const { data, error } = await sb.from('clients').insert(c).select('*').single()
if (error) throw error
this.list.unshift(data as Client)
}
}
})
