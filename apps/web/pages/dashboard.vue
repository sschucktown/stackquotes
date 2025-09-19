<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useClientStore } from '~/stores/client'
import { useQuoteStore } from '~/stores/quote'

const auth = useAuthStore()
const clients = useClientStore()
const quotes = useQuoteStore()

const company = ref('')
const logoUrl = ref<string|null>(null)

onMounted(async () => {
  await auth.safeInit() // <-- client-only now
  await clients.load()
  await quotes.load()

  company.value = auth.profile?.company_name ?? ''
  logoUrl.value = auth.profile?.logo_url ?? null
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
