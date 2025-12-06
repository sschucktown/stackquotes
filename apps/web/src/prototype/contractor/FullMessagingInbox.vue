<script setup lang="ts">
import { computed, ref } from "vue";
import {
  messageThreads,
  addMessageToThread,
  timelineEvents,
} from "./usePrototypeEvents";

const emit = defineEmits<{
  (e: "close"): void;
}>();

const tabs = ["All", "Unread", "Jobs", "Payments"];

const threads = messageThreads;
const activeThreadId = ref(messageThreads.value[0]?.id ?? "");
const newMessage = ref("");
const showSynced = ref(false);

const activeThread = computed(() =>
  threads.value.find((thread) => thread.id === activeThreadId.value)
);

const activeMessages = computed(() => activeThread.value?.messages ?? []);

function sendMessage() {
  if (!newMessage.value.trim() || !activeThreadId.value) return;

  const msg = {
    from: "Contractor",
    text: newMessage.value.trim(),
    time: "Just now",
  };

  addMessageToThread(activeThreadId.value, msg);

  newMessage.value = "";
  showSynced.value = true;
  setTimeout(() => {
    showSynced.value = false;
  }, 1200);
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <div class="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-6 sm:px-6 pb-28">
      <!-- HEADER -->
      <header
        class="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div class="flex items-center gap-3">
          <button
            class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 shadow-inner transition hover:bg-slate-200"
            @click="emit('close')"
          >
            <span class="text-lg leading-none">&larr;</span>
            <span>Back</span>
          </button>
          <div>
            <p
              class="text-xs uppercase tracking-[0.08em] text-slate-500"
            >
              Messages
            </p>
            <h1 class="text-lg font-semibold text-slate-900">
              Message Inbox
            </h1>
          </div>
        </div>
        <div
          class="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600"
        >
          <span class="rounded-full bg-slate-100 px-3 py-1">Maple St Deck</span>
        </div>
      </header>

      <!-- FILTER TABS -->
      <section
        class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="tab in tabs"
            :key="tab"
            class="rounded-full border px-3 py-1 text-sm font-semibold transition"
            :class="
              tab === 'All'
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            "
          >
            {{ tab }}
          </button>
        </div>
        <div class="mt-4">
          <input
            type="text"
            class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Search messages (prototype)"
          />
        </div>
      </section>

      <!-- THREAD LIST -->
      <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="divide-y divide-slate-100">
          <button
            v-for="thread in threads"
            :key="thread.id"
            class="flex w-full items-start gap-3 px-4 py-4 text-left transition hover:bg-slate-50"
            :class="thread.id === activeThreadId ? 'bg-blue-50/60' : ''"
            @click="activeThreadId = thread.id"
          >
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700"
            >
              {{ thread.clientInitials }}
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <p class="text-sm font-semibold text-slate-900">
                    {{ thread.clientName }}
                  </p>
                  <span
                    class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600"
                  >
                    {{ thread.jobName }}
                  </span>
                </div>
                <span class="text-xs text-slate-500">
                  {{ thread.lastUpdated }}
                </span>
              </div>
              <p class="text-sm text-slate-600">
                {{ thread.lastMessage }}
              </p>
            </div>
          </button>
        </div>
      </section>

      <!-- THREAD MESSAGES -->
      <section
        class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div class="mb-3 flex items-center justify-between">
          <div>
            <p
              class="text-xs uppercase tracking-[0.08em] text-slate-500"
            >
              Thread
            </p>
            <h2 class="text-lg font-semibold text-slate-900">
              {{ activeThread?.clientName }}
            </h2>
            <p class="text-xs text-slate-500">
              {{ activeThread?.jobName }}
            </p>
          </div>
          <span
            class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
            >Live prototype</span
          >
        </div>

        <div
          class="max-h-[320px] space-y-3 overflow-y-auto rounded-xl bg-slate-50/70 p-3"
        >
          <div
            v-for="message in activeMessages"
            :key="message.id"
            class="flex"
            :class="
              message.from === 'Contractor'
                ? 'justify-end'
                : 'justify-start'
            "
          >
            <div
              class="max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm sm:max-w-[70%]"
              :class="
                message.from === 'Contractor'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-800 border border-slate-200'
              "
            >
              <p class="leading-relaxed">{{ message.text }}</p>
              <p
                class="mt-2 text-[11px]"
                :class="
                  message.from === 'Contractor'
                    ? 'text-blue-50/90'
                    : 'text-slate-500'
                "
              >
                {{ message.time }}
                <span v-if="message.from === 'Contractor'"> · Sent</span>
              </p>
            </div>
          </div>

          <div
            v-if="!activeMessages.length"
            class="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500"
          >
            No messages yet. Start the conversation below.
          </div>
        </div>
      </section>
    </div>

    <!-- INPUT BAR -->
    <div
      class="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 backdrop-blur"
    >
      <div class="mx-auto flex max-w-2xl flex-col gap-2 px-4 py-3 sm:px-6">
        <span class="text-sm font-semibold text-slate-800">New message</span>
        <textarea
          v-model="newMessage"
          rows="2"
          class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 shadow-inner focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
          placeholder="Type a quick reply (prototype sync)"
        ></textarea>
        <div class="flex items-center justify-between">
          <span v-if="showSynced" class="text-xs font-semibold text-emerald-600"
            >Synced ✓</span
          >
          <div class="flex items-center gap-2">
            <span class="text-xs text-slate-500">Sending as Contractor</span>
            <button
              class="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:opacity-50"
              :disabled="!newMessage.trim()"
              @click="sendMessage"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
