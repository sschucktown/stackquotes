<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSupabaseClient } from '#imports'
import { useQuoteStore } from '~/stores/quote'

const supabase = useSupabaseClient()
const quoteStore = useQuoteStore()

// state
const clients = ref<any[]>([])
const clientId = ref('')
const showNewClientForm = ref(false)
const newClient = ref({ name: '', email: '', phone: '' })
const loading = ref(false)
const errorMsg = ref('')

// load existing clients
async function loadClients() {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    errorMsg.value = error.message
    return
  }
  clients.value = data ?? []
}

onMounted(() => {
  loadClients()
})

// create new client inline
async function addClient() {
  if (!newClient.value.name) {
    errorMsg.value = 'Name is required'
    return
  }
  const { data, error } = await supabase
    .from('clients')
    .insert([newClient.value])
    .select()
    .single()

  if (error) {
    errorMsg.value = error.message
    return
  }

  clients.value.unshift(data)
  clientId.value = data.id
  showNewClientForm.value = false
  newClient.value = { name: '', email: '', phone: '' }
}

// create new quote
async function startQuote() {
  if (!clientId.value) {
    errorMsg.value = '⚠️ Please select or create a client first'
    return
  }

  loading.value = true
  try {
    const quote = await quoteStore.create({ client_id: clientId.value })
    navigateTo(`/quotes/${quote.id}`)
  } catch (e: any) {
    errorMsg.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-lg mx-auto p-6 space-y-6">
    <h1 class="text-2xl font-bold">New Quote</h1>

    <!-- existing clients -->
    <div>
      <label class="block text-sm font-medium mb-1">Select Client</label>
      <select v-model="clientId" class="w-full border rounded px-3 py-2">
        <option value="">-- Choose --</option>
        <option v-for="c in clients" :key="c.id" :value="c.id">
          {{ c.name }} ({{ c.email || c.phone || 'no contact' }})
        </option>
      </select>
      <button
        type="button"
        class="mt-2 text-blue-600 underline"
        @click="showNewClientForm = !showNewClientForm"
      >
        {{ showNewClientForm ? 'Cancel' : '➕ Add New Client' }}
      </button>
    </div>

    <!-- inline new client form -->
    <div v-if="showNewClientForm" class="space-y-3 border p-4 rounded">
      <input
        v-model="newClient.name"
        type="text"
        placeholder="Name"
        class="w-full border rounded px-3 py-2"
      />
      <input
        v-model="newClient.email"
        type="email"
        placeholder="Email"
        class="w-full border rounded px-3 py-2"
      />
      <input
        v-model="newClient.phone"
        type="text"
        placeholder="Phone"
        class="w-full border rounded px-3 py-2"
      />
      <button
        @click="addClient"
        class="bg-gray-800 text-white px-4 py-2 rounded"
      >
        Save Client
      </button>
    </div>

    <!-- start quote -->
    <div>
      <button
        @click="startQuote"
        :disabled="loading"
        class="w-full bg-black text-white px-4 py-2 rounded"
      >
        {{ loading ? 'Creating…' : 'Start Quote' }}
      </button>
    </div>

    <p v-if="errorMsg" class="text-red-600 text-sm">{{ errorMsg }}</p>
  </div>
</template>
