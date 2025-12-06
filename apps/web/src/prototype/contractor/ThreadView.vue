<template>
  <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
          {{ thread?.initials }}
        </div>
        <div>
          <p class="text-sm font-semibold text-slate-900">{{ thread?.participant }}</p>
          <p class="text-xs text-slate-500">{{ thread?.project }}</p>
        </div>
      </div>
      <span class="text-xs font-semibold text-slate-500">Thread prototype</span>
    </div>

    <div class="space-y-3 px-4 py-4">
      <div
        v-for="message in thread?.messages"
        :key="message.id"
        class="flex"
        :class="message.sender === 'contractor' ? 'justify-end' : 'justify-start'"
      >
        <div
          class="max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm"
          :class="message.sender === 'contractor' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'"
        >
          <p>{{ message.text }}</p>
          <p
            class="mt-2 text-[11px]"
            :class="message.sender === 'contractor' ? 'text-blue-100 text-right' : 'text-slate-500 text-left'"
          >
            {{ message.time }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { messageStore } from "@/prototype/stores/messages";

const props = defineProps<{
  threadId: string;
}>();

const thread = computed(() => messageStore.threads.find((t) => t.id === props.threadId));

onMounted(() => {
  messageStore.markThreadRead(props.threadId);
});
</script>
