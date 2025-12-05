<template>
  <ImageViewerModal
    :show="!!file && show"
    :images="normalizedFile ? [normalizedFile] : []"
    :start-index="0"
    @close="emit('close')"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import ImageViewerModal from "@/components/files/ImageViewerModal.vue";
import type { FileCardItem } from "@/components/files/FileCard.vue";

const props = defineProps<{
  show: boolean;
  file: FileCardItem | { id: number | string; url?: string; type?: string } | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const normalizedFile = computed<FileCardItem | null>(() => {
  if (!props.file) return null;
  const base: any = props.file;
  return {
    id: String(base.id ?? "1"),
    name: base.name ?? "Preview",
    thumbnail: base.thumbnail ?? base.url ?? "https://placehold.co/800x600?text=Preview",
    type: (base.type as any) ?? "image",
    createdAt: base.createdAt
  };
});
</script>
