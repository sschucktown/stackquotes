<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useClientStore } from '~/stores/client'
import { useQuoteStore } from '~/stores/quote'

const auth = useAuthStore()
const clients = useClientStore()
const quotes = useQuoteStore()

const company = ref('')
const logoUrl = ref<string | null>(null)

onMounted(async () => {
  try {
    await auth.init()
    await clients.load()
    await quotes.load()

    company.value = auth.profile?.company_name ?? ''
    logoUrl.value = auth.profile?.logo_url ?? null
  } catch (err) {
    console.error('❌ Dashboard init failed:', err)
  }
})

watch(logoUrl, (url) => auth.updateBrand({ logo_url: url ?? null }))
const saveBrand = () => auth.updateBrand({ company_name: company.value })

const clientName = (id: string) => clients.list.find(c => c.id === id)?.name ?? 'Unknown'
const newQuote = async () => {
  const q = await quotes.create({
    client_id: clients.list[0]?.id,
    status: 'draft',
    subtotal: 0,
    deposit_amount: 0,
    options: { good: [], better: [], best: [] },
  } as any)
  navigateTo(`/quotes/${q.id}`)
}
</script>

<template>
  <div class="p-6">
    <h1 class="font-bold text-xl">Dashboard</h1>

    <!-- User state -->
    <div v-if="!auth.user">⏳ No user loaded yet</div>
    <div v-else>
      ✅ Logged in as: {{ auth.user.email }}
    </div>

    <!-- Profile state -->
    <div v-if="!auth.profile">⏳ No profile found</div>
    <div v-else>
      🏢 Company: {{ auth.profile.company_name || 'N/A' }}
      <br />
      <img v-if="auth.profile.logo_url" :src="auth.profile.logo_url" alt="Logo" class="h-12" />
    </div>

    <!-- Branding form -->
    <div class="mt-4">
      <input v-model="company" placeholder="Company name" class="border p-1" />
      <button class="btn ml-2" @click="saveBrand">Save</button>
    </div>

    <!-- Quotes -->
    <div class="mt-6">
      <h2 class="font-bold">Quotes</h2>
      <div v-if="quotes.list.length === 0">📭 No quotes yet</div>
      <table v-else class="w-full text-sm mt-2">
        <thead>
          <tr class="text-left">
            <th class="p-2">Client</th>
            <th class="p-2">Status</th>
            <th class="p-2">Total</th>
            <th class="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="q in quotes.list" :key="q.id" class="border-t">
            <td class="p-2">{{ clientName(q.client_id) }}</td>
            <td class="p-2">{{ q.status }}</td>
            <td class="p-2">${{ q.subtotal.toFixed(2) }}</td>
            <td class="p-2 flex gap-2">
              <NuxtLink class="btn" :to="`/quotes/${q.id}`">Open</NuxtLink>
              <a class="btn" :href="`/api/pdf/${q.id}`" target="_blank">PDF</a>
            </td>
          </tr>
        </tbody>
      </table>
      <button class="btn mt-3" @click="newQuote">➕ New Quote</button>
    </div>
  </div>
</template>
