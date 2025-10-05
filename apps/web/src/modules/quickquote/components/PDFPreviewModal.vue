<template>
  <SQModal
    :open="open"
    title="Estimate PDF"
    description="Preview and share your estimate PDF"
    @close="$emit('close')"
  >
    <div v-if="pdfUrl" class="aspect-[8.5/11] w-full overflow-hidden rounded-lg border border-slate-200">
      <iframe :src="pdfUrl" class="h-full w-full" title="Estimate PDF" />
    </div>
    <p v-else class="text-sm text-slate-500">Generating PDF…</p>

    <template #footer>
      <SQButton variant="ghost" @click="$emit('close')">Close</SQButton>
      <a
        v-if="pdfUrl"
        :href="pdfUrl"
        download
        class="inline-flex items-center justify-center rounded-md bg-sq-primary px-4 py-2 text-sm font-medium text-white shadow-sm"
      >
        Download PDF
      </a>
    </template>
  </SQModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  open: boolean;
  pdfUrl: string | null;
}>();

defineEmits<["close"]>();
</script>
