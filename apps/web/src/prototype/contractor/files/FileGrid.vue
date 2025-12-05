<template>
  <FileGridBase
    :title="title"
    :files="normalizedFiles"
    @open="(file, idx) => emit('open', files[idx] ?? file)"
  >
    <slot name="action" />
  </FileGridBase>
</template>

<script setup lang="ts">
import { computed } from "vue";
import FileGridBase from "@/components/files/FileGrid.vue";
import type { FileCardItem } from "@/components/files/FileCard.vue";

type RawFile = {
  id?: string | number;
  name?: string;
  url?: string;
  thumbnail?: string;
  type?: string;
  createdAt?: string;
  addedBy?: string;
};

const props = defineProps<{
  title?: string;
  files: RawFile[];
}>();

const emit = defineEmits<{
  (e: "open", file: RawFile | FileCardItem): void;
}>();

const normalizedFiles = computed<FileCardItem[]>(() =>
  props.files.map((file, idx) => ({
    id: String(file.id ?? idx),
    name: file.name ?? "File",
    type: (file.type === "pdf" ? "document" : file.type) as any || "image",
    thumbnail: file.thumbnail ?? file.url ?? "https://placehold.co/400x300?text=File",
    createdAt: file.createdAt,
    addedBy: file.addedBy
  }))
);
</script>
