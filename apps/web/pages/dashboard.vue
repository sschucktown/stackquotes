<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useClientStore } from '~/stores/client'
import { useQuoteStore } from '~/stores/quote'

const auth = useAuthStore()
const clients = useClientStore()
const quotes = useQuoteStore()

const company = ref(auth.profile?.company_name ?? '')
const logoUrl = ref<string | null>(auth.profile?.logo_url ?? null)

onMounted(async () => {
  // ✅ middleware already initializes auth
  await clients.load()
  await quotes.load()
})

watch(logoUrl, (url) => auth.updateBrand({ logo_url: url ?? null }))
const saveBrand = () => auth.updateBrand({ company_name: company.value })

const clientName = (id: string) =>
  clients.list.find((c) => c.id === id)?.name ?? 'Unknown'

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
