<template>
  <!-- FAB -->
  <button
    class="fixed z-40 bottom-6 right-6 md:bottom-8 md:right-8 flex items-center gap-2 rounded-full shadow-lg px-4 py-3 bg-sq-primary text-white text-sm md:text-base"
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
            <p class="text-xs uppercase tracking-wide text-slate-500">Questions about this project</p>
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
          <p v-if="loading && messages.length === 0" class="text-xs text-slate-500">Loading messages…</p>
          <p v-else-if="!loading && messages.length === 0" class="text-xs text-slate-500">
            Have a question about materials, timing, or price? Send a quick message and your contractor will reply
            here.
          </p>

          <div v-for="msg in messages" :key="msg.id" class="flex" :class="msg.fromClient ? 'justify-end' : 'justify-start'">
            <div
              class="max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed"
              :class="msg.fromClient
                ? 'bg-sq-primary text-white rounded-br-none'
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
        <form class="border-t bg-white px-3 py-2 flex items-end gap-2" @submit.prevent="handleSend">
          <textarea
            v-model="draft"
            rows="1"
            placeholder="Type a question…"
            class="flex-1 resize-none text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sq-primary/60 focus:border-sq-primary max-h-24"
          />
          <button
            type="submit"
            class="inline-flex items-center justify-center rounded-full px-3 py-2 bg-sq-primary text-white text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="!draft.trim() || sending"
          >
            <span class="hidden sm:inline">Send</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4 sm:ml-1">
              <path fill="currentColor" d="M3 4.27 20.29 12 3 19.73 3 14l11-2-11-2z" />
            </svg>
          </button>
        </form>
      </section>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { createProposalComment, fetchProposalComments, type CommentMessage } from "@/api/comments";

const props = defineProps<{
  proposalId: string;
  contractorName?: string;
}>();

const isOpen = ref(false);
const messages = ref<CommentMessage[]>([]);
const draft = ref("");
const loading = ref(false);
const sending = ref(false);
const messagesContainer = ref<HTMLElement | null>(null);

const togglePanel = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value && messages.value.length === 0) {
    loadMessages();
  }
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

const loadMessages = async () => {
  try {
    loading.value = true;
    const data = await fetchProposalComments(props.proposalId);
    messages.value = data;
    await scrollToBottom();
  } catch (err) {
    console.error("Failed to load messages", err);
  } finally {
    loading.value = false;
  }
};

const handleSend = async () => {
  const body = draft.value.trim();
  if (!body || sending.value) return;

  sending.value = true;
  try {
    const newMsg: CommentMessage = {
      id: Math.random().toString(36).slice(2),
      body,
      createdAt: new Date().toISOString(),
      fromClient: true,
    };
    messages.value.push(newMsg);
    draft.value = "";
    await scrollToBottom();

    await createProposalComment(props.proposalId, { body, fromClient: true });
  } catch (err) {
    console.error("Failed to send message", err);
  } finally {
    sending.value = false;
  }
};

const formatTimestamp = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

onMounted(() => {
  // Optionally prefetch
  // loadMessages();
});
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
