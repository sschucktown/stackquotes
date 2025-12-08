<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useContractorHQPrototype } from "@/stores/contractorHQPrototype";

type Sender = "client" | "contractor";
type LocalMessage = { id: string; sender: Sender; text: string; time: string };

const props = defineProps<{
  open?: boolean;
  jobId?: string;
  actor?: Sender;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const hqStore = useContractorHQPrototype();
const isOpen = ref(Boolean(props.open));
const input = ref("");
const messages = ref<LocalMessage[]>([]);
const STORAGE_KEY = "stackquotes:kickoff:messages";

const job = computed(() => hqStore.getJob(props.jobId));
const jobName = computed(() => job.value?.name || "Maple St Deck");
const actor = computed<Sender>(() => props.actor || "client");
const threadKey = computed(() => props.jobId || job.value?.id || "job-maple");

const seed: LocalMessage[] = [
  { id: "m1", sender: "client", text: "Thanks for sending the kickoff packet.", time: "9:02 AM" },
  { id: "m2", sender: "contractor", text: "You’re set for Monday. Arrival 8–10 AM.", time: "9:04 AM" },
];

const persist = () => {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[threadKey.value] = messages.value;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
  } catch {
    /* ignore storage issues in prototype */
  }
};

const load = () => {
  if (typeof window === "undefined") {
    messages.value = [...seed];
    return;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    messages.value = parsed[threadKey.value] && Array.isArray(parsed[threadKey.value]) ? parsed[threadKey.value] : [...seed];
  } catch {
    messages.value = [...seed];
  }
};

const sendMessage = () => {
  const text = input.value.trim();
  if (!text) return;
  const now = new Date();
  const msg: LocalMessage = {
    id: `msg-${now.getTime()}`,
    sender: actor.value,
    text,
    time: now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  };
  messages.value = [...messages.value, msg];
  persist();
  const id = threadKey.value;
  hqStore.addTimelineEvent(id, "MESSAGE_SENT", `New message: ${text}`);
  hqStore.addHQAlert(`New client message for ${jobName.value}`);
  input.value = "";
};

const handleClose = () => {
  isOpen.value = false;
  emit("close");
};

watch(
  () => props.open,
  (val) => {
    if (typeof val === "boolean") {
      isOpen.value = val;
    }
  }
);

watch(threadKey, () => load());
watch(messages, () => persist(), { deep: true });

onMounted(() => {
  load();
});
</script>

<template>
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-start justify-end bg-white/80 backdrop-blur"
    >
      <div class="absolute inset-0" @click="handleClose"></div>
      <Transition name="slide-in">
        <div class="relative z-10 flex h-full w-full max-w-xl flex-col gap-3 rounded-l-2xl border border-slate-200 bg-white shadow-2xl">
          <header class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Messages</p>
              <p class="text-sm font-semibold text-slate-900">{{ jobName }}</p>
            </div>
            <button
              type="button"
              class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
              @click="handleClose"
            >
              Close
            </button>
          </header>

          <div class="mx-4 mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 shadow-inner">
            Kickoff messaging stays in this drawer. Fake data only.
          </div>

          <div class="flex-1 space-y-3 overflow-y-auto px-4 pb-4">
            <div
              v-for="msg in messages"
              :key="msg.id"
              class="flex items-start gap-3"
              :class="msg.sender === 'contractor' ? 'flex-row' : 'flex-row-reverse'"
            >
              <div
                class="grid h-9 w-9 place-items-center rounded-full text-xs font-semibold shadow-inner"
                :class="msg.sender === 'contractor' ? 'bg-slate-900 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'"
              >
                {{ msg.sender === 'contractor' ? 'JD' : 'CL' }}
              </div>
              <div
                class="max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm"
                :class="msg.sender === 'contractor' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-900'"
              >
                <p>{{ msg.text }}</p>
                <p class="mt-1 text-[11px] text-slate-400">{{ msg.time }}</p>
              </div>
            </div>
          </div>

          <div class="border-t border-slate-200 bg-white px-4 py-3">
            <div class="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 shadow-inner">
              <input
                v-model="input"
                type="text"
                class="flex-1 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none"
                placeholder="Type a message..."
                @keydown.enter.prevent="sendMessage"
              />
              <button
                type="button"
                class="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
                :disabled="!input.trim()"
                @click="sendMessage"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-in-enter-active,
.slide-in-leave-active {
  transition: all 0.24s ease;
}
.slide-in-enter-from,
.slide-in-leave-to {
  opacity: 0;
  transform: translateX(10%);
}
</style>
