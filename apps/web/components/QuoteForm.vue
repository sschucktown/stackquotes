<template>
<div>
<div class="grid md:grid-cols-3 gap-6">
<div v-for="tier in ['good','better','best']" :key="tier" class="border rounded-xl p-4">
<h3 class="font-semibold capitalize text-header mb-3">{{ tier }}</h3>
<div v-for="(li, idx) in state.options[tier]" :key="idx" class="flex gap-2 mb-2">
<input v-model="li.description" placeholder="Description" class="flex-1 border rounded p-2" />
<input v-model.number="li.qty" type="number" placeholder="Qty" class="w-20 border rounded p-2" />
<input v-model.number="li.unitPrice" type="number" placeholder="Unit $" class="w-24 border rounded p-2" />
</div>
<button class="btn" @click="add(tier)">Add Line</button>
<div class="mt-3 text-sm">Subtotal: ${{ sum(tier).toFixed(2) }}</div>
</div>
</div>
<div class="mt-6 flex items-center gap-4">
<label class="text-sm">Deposit Amount ($)</label>
<input v-model.number="state.deposit_amount" type="number" class="border rounded p-2 w-40" />
<button class="btn" @click="save">Save</button>
</div>
</div>
</template>
<script setup lang="ts">
import type { LineItem, Quote } from '~/store/quoteStore'


const props = defineProps<{ quoteId: string }>()
const quotes = useQuoteStore()
const state = reactive<Quote>({
id: props.quoteId,
client_id: '',
status: 'draft',
subtotal: 0,
deposit_amount: 0,
options: { good: [], better: [], best: [] }
} as any)


onMounted(async () => {
const q = await quotes.byId(props.quoteId)
Object.assign(state, q)
})


const add = (tier: 'good'|'better'|'best') => state.options[tier].push({ description: '', qty: 1, unitPrice: 0 } as LineItem)
const sum = (tier: 'good'|'better'|'best') => state.options[tier].reduce((s, i) => s + i.qty * i.unitPrice, 0)


const save = async () => {
state.subtotal = ['good','better','best'].map(t => sum(t as any)).sort((a,b)=>a-b)[0]
const sb = useSb()
const { error } = await sb.from('quotes').update({ options: state.options, subtotal: state.subtotal, deposit_amount: state.deposit_amount }).eq('id', state.id)
if (error) throw error
}
</script>
