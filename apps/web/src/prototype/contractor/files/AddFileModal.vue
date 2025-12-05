<template>
  <AddFileModal
    :show="props.show"
    @close="emit('close')"
    @add="(file) => emit('add', file)"
  />
</template>

<script setup lang="ts">
import AddFileModal from "@/components/files/AddFileModal.vue";

const props = defineProps<{ show: boolean }>();
const emit = defineEmits<{
  (e: "close"): void;
  (e: "add", file: { name: string; type: "image" | "document" | "video"; thumbnail: string }): void;
}>();
</script>
