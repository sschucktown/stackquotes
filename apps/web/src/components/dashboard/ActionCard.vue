<script setup lang="ts">
const props = defineProps<{
  title: string
  description: string
  ctaText: string
  ctaRoute: string
  icon?: string
}>()
const emit = defineEmits<{ (e: 'click'): void }>()
</script>

<template>
  <article class="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
    <div>
      <p class="text-xs uppercase tracking-wide text-slate-500">{{ title }}</p>
      <h3 class="mt-1 text-lg font-semibold text-slate-900">{{ description }}</h3>
    </div>
    <div class="mt-4">
      <button type="button" class="rounded-full bg-[#3A7D99] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#4f8faa]" @click="emit('click')">
        {{ ctaText }}
      </button>
    </div>
  </article>
</template>

