<template>
  <!-- FAB -->
  <button
    class="fixed z-40 bottom-6 right-6 md:bottom-8 md:right-8 flex items-center gap-2 rounded-full shadow-lg px-4 py-3 bg-[#1E5EFF] text-white text-sm md:text-base"
    @click="togglePanel"
  >
    <span class="sr-only">Open questions panel</span>
    <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5">
        <path
          fill="currentColor"
          d="M4 4h16a2 2 0 0 1 2 2v9.5a1.5 1.5 0 0 1-1.5 1.5H9l-4 4v-4H3a1 1 0 0 1-1-1V6a2 2 0 0 1 2-2Z"
        />
      </svg>
    </span>
    <span class="hidden sm:inline">Questions?</span>
  </button>

  <!-- Overlay -->
  <Transition name="fade">
    <div v-if="isOpen" class="fixed inset-0 z-40 bg-black/40 md:bg-black/30" @click.self="closePanel">
      <!-- Panel -->
      <section
        class="absolute inset-x-0 bottom-0 md:inset-y-0 md:right-0 md:left-auto bg-white rounded-t-2xl md:rounded-none md:rounded-l-2xl shadow-xl flex flex-col max-h-[80vh] md:max-h-full md:w-[360px]"
      >
        <!-- Header -->
        <header class="px-4 py-3 border-b flex items-center justify-between">
          <div>
            <p class="text-xs uppercase tracking-wide text-slate-500">Questions about this estimate?</p>
            <p class="text-sm font-semibold text-slate-900">Message {{ contractorName || "your contractor" }}</p>
          </div>
          <button class="p-2 rounded-full hover:bg-slate-100" @click="closePanel">
            <span class="sr-only">Close</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5 text-slate-500">
              <path
                fill="currentColor"
                d="M6.225 4.811 4.81 6.225 10.586 12l-5.775 5.775 1.414 1.414L12 13.414l5.775 5.775 1.414-1.414L13.414 12l5.775-5.775-1.414-1.414L12 10.586z"
              />
            </svg>
          </button>
        </header>

        <!-- Messages -->
        <main ref="messagesContainer" class="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-slate-50/60">
          <p v-if="messages.length === 0" class="text-xs text-slate-500">
            Have a question about materials, timing, or price? Send a quick message and your contractor will reply
            here.
          </p>

          <div v-for="msg in messages" :key="msg.id" class="flex" :class="msg.fromClient ? 'justify-end' : 'justify-start'">
            <div
              class="max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed"
              :class="msg.fromClient
                ? 'bg-[#1E5EFF] text-white rounded-br-none'
                : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none'"
            >
              <p>{{ msg.body }}</p>
              <p class="mt-1 text-[10px] opacity-70" :class="msg.fromClient ? 'text-slate-100' : 'text-slate-500'">
                {{ formatTimestamp(msg.createdAt) }}
              </p>
            </div>
          </div>
        </main>

        <!-- Composer -->
        <form class="border-t bg-white px-3 py-2 flex items-center gap-2" @submit.prevent="handleSend">
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100"
            title="Attach a file (prototype only)"
          >
            +
          </button>
          <input
            v-model="draft"
            type="text"
            placeholder="Type a question"
            class="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E5EFF]/60 focus:border-[#1E5EFF] bg-white"
          />
          <button
            type="submit"
            class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#1E5EFF] text-white text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="!draft.trim()"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4">
              <path fill="currentColor" d="M3 4.27 20.29 12 3 19.73 3 14l11-2-11-2z" />
            </svg>
          </button>
        </form>
      </section>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";

const props = defineProps<{
  contractorName?: string;
}>();

type CommentMessage = {
  id: string;
  body: string;
  createdAt: string;
  fromClient: boolean;
};

const isOpen = ref(false);
const messages = ref<CommentMessage[]>([
  {
    id: "seed-1",
    body: "Hi Jordan, this range looks solid. Do you want composite or wood?",
    createdAt: new Date().toISOString(),
    fromClient: false,
  },
  {
    id: "seed-2",
    body: "Leaning toward composite if the color options are right.",
    createdAt: new Date().toISOString(),
    fromClient: true,
  },
  {
    id: "seed-3",
    body: "Great - I'll bring samples to the visit so you can compare.",
    createdAt: new Date().toISOString(),
    fromClient: false,
  },
]);
const draft = ref("");
const messagesContainer = ref<HTMLElement | null>(null);

const togglePanel = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) scrollToBottom();
};

const open = () => {
  isOpen.value = true;
  scrollToBottom();
};

const closePanel = () => {
  isOpen.value = false;
};

const scrollToBottom = async () => {
  await nextTick();
  const el = messagesContainer.value;
  if (!el) return;
  el.scrollTop = el.scrollHeight;
};

const handleSend = async () => {
  const body = draft.value.trim();
  if (!body) return;
  messages.value.push({
    id: Math.random().toString(36).slice(2),
    body,
    createdAt: new Date().toISOString(),
    fromClient: true,
  });
  draft.value = "";
  await scrollToBottom();
};

const formatTimestamp = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

defineExpose({ open, close: closePanel });
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
