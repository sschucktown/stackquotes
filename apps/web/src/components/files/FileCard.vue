<template>
  <div
    class="group rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
    @click="$emit('open')"
  >
    <div class="relative overflow-hidden rounded-t-2xl">
      <img
        :src="file.thumbnail"
        alt=""
        class="aspect-video w-full object-cover transition duration-200 group-hover:brightness-90"
      />
      <div
        v-if="file.type === 'document'"
        class="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8">
          <path stroke-linecap="round" stroke-linejoin="round" d="M7 3h7l4 4v14H7z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M14 3v4h4" />
        </svg>
      </div>
      <div
        v-else-if="file.type === 'video'"
        class="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-violet-600 shadow"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor">
          <path d="m9 7 8 5-8 5V7Z" />
        </svg>
      </div>
    </div>
    <div class="flex items-center justify-between px-3 py-3">
      <div>
        <p class="text-sm font-semibold text-slate-900">{{ file.name }}</p>
        <p class="text-xs text-slate-500">{{ file.addedBy }}</p>
      </div>
      <span
        class="rounded-full px-3 py-1 text-xs font-semibold"
        :class="badgeClasses"
      >
        {{ badgeLabel }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

type FileType = "image" | "document" | "video";

export type FileCardItem = {
  id: string;
  name: string;
  type: FileType;
  thumbnail: string;
  createdAt?: string;
  addedBy?: string;
};

const props = defineProps<{
  file: FileCardItem;
}>();

defineEmits<{
  (e: "open"): void;
}>();

const badgeLabel = computed(() => {
  if (props.file.type === "video") return "Video";
  if (props.file.type === "document") return "Document";
  return "Image";
});

const badgeClasses = computed(() => {
  if (props.file.type === "video") return "bg-violet-50 text-violet-700 border border-violet-100";
  if (props.file.type === "document") return "bg-slate-100 text-slate-700 border border-slate-200";
  return "bg-blue-50 text-blue-700 border border-blue-100";
});
</script>
