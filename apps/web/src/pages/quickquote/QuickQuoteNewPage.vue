<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto max-w-5xl px-6 py-8">
      <header class="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">Create QuickQuote</h1>
          <p class="text-sm text-slate-500">Start from a project template for your trade.</p>
        </div>
      </header>

      <!-- Selector Card -->
      <section class="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 mb-6">
        <h2 class="text-sm font-semibold text-slate-700 mb-3">Project Template</h2>
        <select
          v-model="selectedProject"
          @change="handleProjectSelect"
          class="rounded-lg border border-slate-300 px-3 py-2 text-sm w-full bg-white text-slate-900"
        >
          <option disabled :value="null">Select a project template</option>
          <option v-for="p in projectTemplates" :key="p.id" :value="p">{{ p.name }}</option>
        </select>
        <div v-if="selectedProject" class="mt-3 p-4 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-700">
          <p><strong>Description:</strong> {{ selectedProject.description }}</p>
          <p><strong>Base Price:</strong> ${{ Number(selectedProject.base_price ?? 0).toFixed(2) }}</p>
          <p v-if="selectedProject.default_notes" class="text-slate-500 mt-1">{{ selectedProject.default_notes }}</p>
        </div>
      </section>

      <!-- Client & Fields Card -->
      <section class="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 mb-6">
        <h2 class="text-sm font-semibold text-slate-700 mb-3">Client & Details</h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-600">Client</label>
            <select v-model="clientId" class="rounded-lg border border-slate-300 px-3 py-2 text-sm w-full bg-white text-slate-900">
              <option disabled value="">Select a client</option>
              <option v-for="c in clients" :key="c.id" :value="c.id">{{ c.name }} — {{ c.email }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-600">Project Title</label>
            <input v-model="projectTitle" type="text" placeholder="e.g., Premium Deck Install"
              class="rounded-lg border border-slate-300 px-3 py-2 text-sm w-full" />
          </div>
        </div>
      </section>

      <!-- Pricing Card -->
      <section class="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 mb-6">
        <h2 class="text-sm font-semibold text-slate-700 mb-3">Line Item</h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label class="mb-1 block text-xs font-medium text-slate-600">Description</label>
            <textarea v-model="description" rows="3" class="rounded-lg border border-slate-300 px-3 py-2 text-sm w-full" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-600">Unit Price</label>
            <input v-model.number="unitPrice" type="number" min="0" step="0.01" class="rounded-lg border border-slate-300 px-3 py-2 text-sm w-full" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-600">Tax Rate (%)</label>
            <input v-model.number="taxRatePct" type="number" min="0" step="0.1" class="rounded-lg border border-slate-300 px-3 py-2 text-sm w-full" />
          </div>
          <div class="sm:col-span-2">
            <label class="mb-1 block text-xs font-medium text-slate-600">Notes</label>
            <textarea v-model="notes" rows="3" class="rounded-lg border border-slate-300 px-3 py-2 text-sm w-full" />
          </div>
        </div>
      </section>

      <!-- Sticky Footer Summary -->
      <div class="sticky bottom-0 bg-white border-t border-slate-200 p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div>
          <p class="text-sm text-slate-600">Tax ({{ taxRatePct.toFixed(1) }}%)</p>
          <p class="text-lg font-semibold text-slate-900">Total: ${{ total.toFixed(2) }}</p>
        </div>
        <button
          @click="createProposal"
          class="mt-3 sm:mt-0 rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-cyan-300 transition-all"
        >
          Create Proposal
        </button>
      </div>

      <p v-if="error" class="mt-3 text-sm text-red-600">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'

type ProjectTemplate = {
  id: string
  name: string
  description: string
  base_price: number
  default_notes: string | null
  trade?: string | null
}

type Client = { id: string; name: string; email: string }

const router = useRouter()
const { user } = useAuth()

const projectTemplates = ref<ProjectTemplate[]>([])
const selectedProject = ref<ProjectTemplate | null>(null)
const clients = ref<Client[]>([])
const clientId = ref<string>('')

const projectTitle = ref('')
const description = ref('')
const unitPrice = ref<number>(0)
const notes = ref('')

const taxRate = ref<number>(0)
const taxRatePct = computed({
  get: () => taxRate.value * 100,
  set: (v: number) => (taxRate.value = (Number(v) || 0) / 100),
})

const subtotal = computed(() => Number(unitPrice.value || 0))
const tax = computed(() => subtotal.value * taxRate.value)
const total = computed(() => subtotal.value + tax.value)

const error = ref<string | null>(null)

const loadProfileAndTemplates = async () => {
  error.value = null
  const uid = user.value?.id
  if (!uid) return

  const { data: profile, error: profileErr } = await supabase
    .from('contractor_profiles')
    .select('trade')
    .eq('user_id', uid)
    .maybeSingle()

  if (profileErr) {
    console.error(profileErr)
  }

  const trade = profile?.trade ?? null

  const { data: templates, error: tErr } = await supabase
    .from('project_templates')
    .select('id, name, description, base_price, default_notes, trade')
    .maybeSingle(false)
    .eq(trade ? 'trade' : 'id', trade ? trade : '00000000-0000-0000-0000-000000000000') // harmless no-op when no trade

  if (tErr) {
    console.error(tErr)
  }
  projectTemplates.value = (templates as ProjectTemplate[]) || []

  const { data: settings } = await supabase
    .from('user_settings')
    .select('default_tax_rate')
    .eq('user_id', uid)
    .maybeSingle()
  if (settings?.default_tax_rate != null) {
    taxRate.value = Number(settings.default_tax_rate) || 0
  }
}

const loadClients = async () => {
  const uid = user.value?.id
  if (!uid) return
  const { data } = await supabase
    .from('clients')
    .select('id, name, email')
    .order('created_at', { ascending: false })
  clients.value = (data as Client[]) || []
}

onMounted(() => {
  loadProfileAndTemplates()
  loadClients()
})

const handleProjectSelect = () => {
  if (!selectedProject.value) return
  const p = selectedProject.value
  description.value = p.description || ''
  unitPrice.value = Number(p.base_price || 0)
  notes.value = p.default_notes || ''
  if (!projectTitle.value) projectTitle.value = p.name
  // focus price next tick
  requestAnimationFrame(() => {
    const input = document.querySelector<HTMLInputElement>('input[type="number"]')
    input?.focus()
  })
}

const createProposal = async () => {
  error.value = null
  try {
    if (!selectedProject.value) throw new Error('Please select a project template')
    if (!clientId.value) throw new Error('Please select a client')
    if (subtotal.value <= 0) throw new Error('Unit price must be greater than 0')

    const uid = user.value?.id
    if (!uid) throw new Error('Not authenticated')

    const lineItems = [
      {
        description: description.value,
        quantity: 1,
        unit_price: subtotal.value,
        total: subtotal.value,
      },
    ]

    const insertPayload = {
      user_id: uid,
      client_id: clientId.value,
      project_title: projectTitle.value || selectedProject.value.name,
      line_items: lineItems,
      subtotal: subtotal.value,
      tax: tax.value,
      total: total.value,
      notes: notes.value,
      status: 'draft',
    }

    const { data, error: insErr } = await supabase
      .from('estimates')
      .insert(insertPayload)
      .select('id')
      .single()

    if (insErr) throw insErr
    const id = data?.id
    if (!id) throw new Error('Failed to create draft')

    await router.push({ path: '/smartproposals/new', query: { quoteId: id } })
  } catch (e: any) {
    console.error(e)
    error.value = e?.message ?? 'Unable to create proposal'
  }
}
</script>

<style scoped>
</style>

