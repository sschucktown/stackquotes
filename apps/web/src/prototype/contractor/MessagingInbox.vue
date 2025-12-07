<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <div class="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
      <header class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div class="space-y-2">
          <div class="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <button class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700 shadow-inner transition hover:bg-slate-200">
              <span class="text-lg leading-none">&larr;</span>
              <span>Back</span>
            </button>
            <span class="text-slate-400">|</span>
            <span class="font-semibold text-slate-800">Maple St Deck</span>
            <span class="text-slate-400">|</span>
            <span class="text-slate-600">Messages</span>
          </div>
          <div>
            <h1 class="text-xl font-semibold text-slate-900">Inbox</h1>
            <p class="text-sm text-slate-600">All job messages and updates</p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="filter in filters"
            :key="filter.value"
            class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold transition"
            :class="activeFilter === filter.value ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-inner' : 'border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50'"
            @click="activeFilter = filter.value"
          >
            {{ filter.label }}
          </button>
          <button
            class="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Settings"
            @click="showSettings = true"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.6" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.757.426 1.757 2.924 0 3.35a1.724 1.724 0 0 0-1.065 2.573c.94 1.543-.827 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.757-2.924 1.757-3.35 0a1.724 1.724 0 0 0-2.573-1.065c-1.543.94-3.31-.827-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.757-.426-1.757-2.924 0-3.35a1.724 1.724 0 0 0 1.065-2.573c-.94-1.543.827-3.31 2.37-2.37.966.589 2.199.167 2.573-1.065Z"
              />
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </button>
        </div>
      </header>

      <div class="grid gap-4 md:grid-cols-[280px,1fr]">
        <!-- Thread List -->
        <aside
          class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          :class="showThreadsOnMobile ? 'block' : 'hidden md:block'"
        >
          <div class="border-b border-slate-200 px-4 py-3">
            <p class="text-sm font-semibold text-slate-800">Threads</p>
          </div>
          <div class="max-h-[70vh] overflow-y-auto">
            <button
              v-for="thread in filteredThreads"
              :key="thread.id"
              class="flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50"
              :class="selectedThreadId === thread.id ? 'bg-blue-50/70 border-l-2 border-l-blue-500' : ''"
              @click="selectThread(thread.id)"
            >
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                {{ thread.initials }}
              </div>
              <div class="flex-1 space-y-1">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <p :class="['text-sm font-semibold', thread.unread ? 'text-slate-900' : 'text-slate-800']">
                      {{ thread.participant }}
                    </p>
                    <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                      {{ thread.jobType }}
                    </span>
                  </div>
                  <span class="text-xs text-slate-500">{{ thread.lastMessageTime }}</span>
                </div>
                <p :class="['text-sm text-slate-600', thread.unread ? 'font-semibold text-slate-800' : '']">
                  {{ thread.lastMessage }}
                </p>
              </div>
              <div v-if="thread.unread" class="flex h-full items-center">
                <span class="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
              </div>
            </button>
          </div>
        </aside>

        <!-- Thread View -->
        <section
          class="relative flex min-h-[70vh] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          :class="showThreadsOnMobile ? 'hidden md:flex' : 'flex'"
        >
          <div class="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
            <div class="flex items-center gap-3">
              <button
                class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 md:hidden"
                @click="showThreadsOnMobile = true"
              >
                <span class="text-lg leading-none">&larr;</span>
                <span>Back to Inbox</span>
              </button>
              <div class="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                {{ selectedThread?.initials }}
              </div>
              <div class="space-y-0.5">
                <div class="flex items-center gap-2">
                  <p class="text-sm font-semibold text-slate-900">{{ selectedThread?.participant }}</p>
                  <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    Maple St Deck
                  </span>
                  <span class="flex h-2 w-2 items-center justify-center rounded-full bg-emerald-500"></span>
                </div>
                <p class="text-xs text-slate-500">{{ selectedThread ? channelLabels[selectedThread.channel] : "" }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                Call
              </button>
              <button class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                Add Note
              </button>
              <button class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
                Files
              </button>
            </div>
          </div>

          <div class="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
            <div
              v-for="(message, index) in activeMessages"
              :key="message.id"
              class="flex flex-col gap-2"
              :class="message.sender === 'contractor' ? 'items-end' : 'items-start'"
            >
              <div class="flex max-w-[85%] flex-col gap-2 sm:max-w-[70%]">
                <div
                  class="rounded-2xl px-4 py-3 text-sm shadow-sm"
                  :class="message.sender === 'contractor' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'"
                >
                  <p class="leading-relaxed">{{ message.text }}</p>
                  <div v-if="message.attachment" class="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white/70 shadow-inner">
                    <img
                      v-if="message.attachment.type === 'image'"
                      :src="message.attachment.url"
                      alt="Attachment"
                      class="h-28 w-full object-cover"
                    />
                    <div
                      v-else
                      class="flex items-center gap-3 px-3 py-2 text-slate-700"
                    >
                      <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                          <path d="M14 2v6h6" />
                          <path d="M16 13H8" />
                          <path d="M16 17H8" />
                          <path d="M10 9H8" />
                        </svg>
                      </div>
                      <div>
                        <p class="text-sm font-semibold text-slate-800">{{ message.attachment.name }}</p>
                        <p class="text-xs text-slate-500">PDF</p>
                      </div>
                    </div>
                  </div>
                </div>
                <p class="text-xs text-slate-500" :class="message.sender === 'contractor' ? 'text-right' : 'text-left'">
                  {{ message.time }}
                  <span v-if="index === activeMessages.length - 1 && message.sender === 'contractor'"> - Delivered</span>
                </p>
              </div>
            </div>
          </div>

          <div class="sticky bottom-0 border-t border-slate-200 bg-white px-4 py-4 sm:px-5">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div class="relative flex-1">
                <textarea
                  v-model="draft"
                  rows="2"
                  class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Type a message..."
                ></textarea>
                <button
                  class="absolute right-2 top-2 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
                  aria-label="Attach"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21.44 11.05 12.42 20.07a5 5 0 0 1-7.07-7.07l9.02-9.02a3 3 0 0 1 4.25 4.24l-8.49 8.5a1 1 0 0 1-1.42-1.42l7.78-7.78" />
                  </svg>
                </button>
              </div>
              <button class="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700">
                Send
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
    <SettingsDrawer v-if="showSettings" @close="showSettings = false" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import SettingsDrawer from "@/components/Settings/SettingsDrawer.vue";
import { messageStore } from "@/prototype/stores/messages";

const filters = [
  { value: "all", label: "All" },
  { value: "unread", label: "Unread" },
  { value: "sms", label: "SMS" },
  { value: "email", label: "Email" },
  { value: "internal", label: "Internal Notes" }
] as const;

const channelLabels: Record<"sms" | "email" | "internal", string> = {
  sms: "SMS Thread",
  email: "Email Thread",
  internal: "Internal Thread"
};

const threads = computed(() =>
  messageStore.threads.map((thread) => ({
    ...thread,
    channel: thread.jobType === "Team" ? "internal" : "sms"
  }))
);

const activeFilter = ref<typeof filters[number]["value"]>("all");
const showSettings = ref(false);
const selectedThreadId = ref<string>(threads.value[0]?.id ?? "");
const draft = ref("");
const showThreadsOnMobile = ref(true);

const filteredThreads = computed(() => {
  let list = threads.value;
  if (activeFilter.value === "unread") {
    list = list.filter((thread) => thread.unread);
  } else if (activeFilter.value !== "all") {
    list = list.filter((thread) => thread.channel === activeFilter.value);
  }
  return list;
});

const selectedThread = computed(() => threads.value.find((thread) => thread.id === selectedThreadId.value));

const activeMessages = computed(() => {
  const id = selectedThreadId.value;
  const found = messageStore.threads.find((thread) => thread.id === id);
  return found?.messages ?? [];
});

const selectThread = (id: string) => {
  selectedThreadId.value = id;
  messageStore.markThreadRead(id);
  showThreadsOnMobile.value = false;
};
</script>
