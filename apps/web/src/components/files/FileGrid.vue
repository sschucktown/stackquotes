<template>
  <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div class="mb-4 flex items-center justify-between">
      <div>
        <p class="text-xs uppercase tracking-wide text-slate-500">Library</p>
        <h3 class="text-base font-semibold text-slate-900">{{ title }}</h3>
      </div>
      <slot name="action"></slot>
    </div>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <slot>
        <FileCard
          v-for="file in files"
          :key="file.id"
          :file="file"
          @open="$emit('open', file)"
        />
      </slot>
    </div>
  </section>
</template>

<script setup lang="ts">
import FileCard, { type FileCardItem } from "./FileCard.vue";

defineProps<{
  title: string;
  files: FileCardItem[];
}>();

defineEmits<{
  (e: "open", file: FileCardItem): void;
}>();
</script>
