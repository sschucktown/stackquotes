<template>
</div>
<div class="overflow-x-auto">
<table class="w-full text-sm">
<thead>
<tr class="text-left text-header">
<th class="p-2">Client</th>
<th class="p-2">Status</th>
<th class="p-2">Total</th>
<th class="p-2">Actions</th>
</tr>
</thead>
<tbody>
<tr v-for="q in quotes.list" :key="q.id" class="border-t">
<td class="p-2">{{ clientName(q.client_id) }}</td>
<td class="p-2">
<span class="px-2 py-1 rounded bg-bg">{{ q.status }}</span>
</td>
<td class="p-2">${{ q.subtotal.toFixed(2) }}</td>
<td class="p-2 flex gap-2">
<NuxtLink class="btn" :to="`/quotes/${q.id}`">Open</NuxtLink>
<a class="btn" :href="`/api/pdf/${q.id}`" target="_blank">PDF</a>
</td>
</tr>
</tbody>
</table>
</div>
</section>
</div>
</template>
<script setup lang="ts">
const auth = useAuthStore(); await auth.init()
const clients = useClientStore(); await clients.load()
const quotes = useQuoteStore(); await quotes.load()


const company = ref(auth.profile?.company_name ?? '')
const logoUrl = ref(auth.profile?.logo_url ?? null)


watch(logoUrl, (url) => auth.updateBrand({ logo_url: url ?? null }))
const saveBrand = () => auth.updateBrand({ company_name: company.value })


const clientName = (id: string) => clients.list.find(c => c.id === id)?.name ?? 'Unknown'
const newQuote = async () => {
const q = await quotes.create({
client_id: clients.list[0]?.id,
status: 'draft',
subtotal: 0,
deposit_amount: 0,
options: { good: [], better: [], best: [] }
} as any)
navigateTo(`/quotes/${q.id}`)
}
</script>
