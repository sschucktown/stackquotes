<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref } from 'vue'

const route = useRoute()
const quoteId = route.params.id as string

const downloading = ref(false)

const downloadPdf = async () => {
  try {
    downloading.value = true
    const res = await fetch(`/api/pdf/${quoteId}`)
    if (!res.ok) throw new Error("Failed to fetch PDF")

    // convert response to blob
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)

    // trigger download
    const a = document.createElement("a")
    a.href = url
    a.download = `quote-${quoteId}.pdf`
    a.click()

    window.URL.revokeObjectURL(url)
  } catch (err) {
    console.error("❌ PDF download failed:", err)
    alert("Failed to generate PDF. Please try again.")
  } finally {
    downloading.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto py-8">
    <!-- Example quote view -->
    <h1 class="text-2xl font-bold mb-4">Quote {{ quoteId }}</h1>
    <p class="mb-6">
      Here’s where your quote content goes (details, pricing table, etc).
    </p>

    <!-- Download button -->
    <button
      @click="downloadPdf"
      :disabled="downloading"
      class="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
    >
      <span v-if="!downloading">⬇ Download PDF</span>
      <span v-else>⏳ Generating...</span>
    </button>
  </div>
</template>
