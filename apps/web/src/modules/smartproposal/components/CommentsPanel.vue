<template>
  <div class="rounded-3xl bg-white/90 p-4 shadow-sm ring-1 ring-slate-200">
    <div class="mb-3 flex items-center justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Comments</p>
        <p class="text-sm text-slate-600">Share quick clarifications without leaving the proposal.</p>
      </div>
      <span
        class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
        :class="sending ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-700'"
      >
        {{ statusLabel }}
      </span>
    </div>

    <div
      ref="scrollArea"
      class="mb-3 max-h-72 space-y-3 overflow-y-auto rounded-2xl bg-slate-50/70 px-3 py-3 transition"
    >
      <div v-if="loading" class="py-4 text-center text-sm text-slate-500">Loading comments…</div>
      <div v-else-if="!hasComments" class="py-4 text-center text-sm text-slate-500">
        No messages yet. Start the conversation below.
      </div>
      <div
        v-for="item in comments"
        :key="item.id"
        class="flex gap-3"
        :class="item.authorType === 'contractor' ? 'justify-start' : 'justify-end flex-row-reverse'"
      >
        <div class="flex-1 max-w-[80%]">
          <div class="flex items-center justify-between gap-2 text-xs text-slate-500">
            <span class="font-semibold text-slate-700">
              {{ authorLabel(item) }}
            </span>
            <span>{{ timeLabel(item.createdAt) }}</span>
          </div>
          <div
            class="mt-1 rounded-2xl px-4 py-2 text-sm text-slate-800 shadow-sm transition"
            :class="bubbleClass(item)"
          >
            <p class="leading-snug">{{ item.message }}</p>
            <span v-if="item.optimistic" class="mt-1 inline-block text-[11px] text-slate-500">Sending…</span>
          </div>
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-2 rounded-2xl bg-slate-50/80 p-3">
      <textarea
        v-model="draft"
        class="min-h-[68px] w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-inner transition focus:border-[#0F62FE] focus:outline-none focus:ring-2 focus:ring-[#0F62FE]/40"
        :placeholder="placeholderText"
        :disabled="sending || disabled"
        @keydown.meta.enter.prevent="send"
        @keydown.ctrl.enter.prevent="send"
      />
      <div class="flex items-center justify-between gap-3">
        <span class="text-xs text-slate-500">
          {{ helperText }}
        </span>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition"
          :class="sendButtonClass"
          :style="sendButtonStyle"
          :disabled="sending || disabled || !draft.trim() || !proposalId"
          @click="send"
        >
          <span v-if="sending">Sending…</span>
          <span v-else>Send</span>
        </button>
      </div>
      <p v-if="error" class="text-xs text-rose-600">{{ error }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useProposalComments, type ProposalComment } from "../composables/useProposalComments";

const props = defineProps<{
  proposalId: string | null | undefined;
  token?: string | null;
  mode?: "client" | "contractor";
  accentColor?: string | null;
  disabled?: boolean;
}>();

const { comments, loading, sending, error, hasComments, loadComments, addComment } = useProposalComments({
  token: props.token ?? null,
});

const draft = ref("");
const scrollArea = ref<HTMLElement | null>(null);

const statusLabel = computed(() => {
  if (sending.value) return "Sending";
  if (loading.value) return "Updating";
  return hasComments.value ? "Live" : "Idle";
});

const placeholderText = computed(() =>
  props.mode === "contractor" ? "Ask for clarifications or share updates…" : "Ask a question or request a tweak…"
);

const helperText = computed(() => {
  if (props.disabled) return "Save the proposal before commenting.";
  if (!props.proposalId) return "Load a proposal to start commenting.";
  return props.mode === "contractor"
    ? "Clients see your name with each reply."
    : "Contractor will be notified by email.";
});

const sendButtonClass = computed(() => {
  return "bg-[#0F62FE] hover:bg-[#0d55e5] disabled:opacity-50";
});

const sendButtonStyle = computed(() => {
  if (props.mode === "contractor" && props.accentColor) {
    return {
      backgroundColor: props.accentColor,
      borderColor: props.accentColor,
    };
  }
  return {};
});

const bubbleClass = (item: ProposalComment) => {
  const fromContractor = item.authorType === "contractor";
  if (fromContractor) {
    return "bg-white ring-1 ring-slate-200";
  }
  return "bg-[#0F62FE]/90 text-white shadow-md";
};

const authorLabel = (item: ProposalComment) => {
  if (props.mode === "contractor" && item.authorType === "contractor") return "You";
  if (props.mode === "client" && item.authorType === "client") return "You";
  if (item.authorName) return item.authorName;
  return item.authorType === "contractor" ? "Contractor" : "Client";
};

const timeLabel = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = Date.now();
  const diff = Math.max(0, now - d.getTime());
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
};

const scrollToBottom = () => {
  nextTick(() => {
    if (!scrollArea.value) return;
    scrollArea.value.scrollTop = scrollArea.value.scrollHeight;
  });
};

const hydrate = async () => {
  if (!props.proposalId) return;
  await loadComments(props.proposalId, props.token ?? null);
  scrollToBottom();
};

const send = async () => {
  if (!props.proposalId || !draft.value.trim() || props.disabled) return;
  const message = draft.value;
  draft.value = "";
  await addComment(props.proposalId, message, props.token ?? null);
  scrollToBottom();
};

watch(
  () => props.proposalId,
  async (id) => {
    if (id) {
      await hydrate();
    } else {
      comments.value = [];
    }
  },
  { immediate: true }
);

watch(
  () => comments.value.length,
  () => scrollToBottom()
);

onMounted(() => {
  void hydrate();
});
</script>
