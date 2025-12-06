<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <div class="mx-auto flex max-w-5xl flex-col gap-5 px-4 py-6 sm:px-6 lg:px-8">
      <header class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div class="flex flex-wrap items-center gap-3">
          <button class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 shadow-inner transition hover:bg-slate-200">
            <span class="text-lg leading-none">&larr;</span>
            <span>Back</span>
          </button>
          <div class="flex flex-col">
            <div class="flex flex-wrap items-center gap-2">
              <h1 class="text-lg font-semibold text-slate-900">Maple St Deck</h1>
              <span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-inner">In Progress</span>
              <button
                class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-inner transition hover:bg-blue-100"
                @click="openPayments"
              >
                Payments
              </button>
              <button
                class="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 shadow-inner transition hover:bg-violet-100"
                @click="openInbox"
              >
                Messages
              </button>
              <button
                class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 shadow-inner transition hover:bg-slate-200"
                @click="openFiles"
              >
                Files
              </button>
            </div>
            <p class="text-xs text-slate-500">Individual Job View</p>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 shadow-inner">Client: Sarah Thompson</span>
          <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 shadow-inner">Due Today 3:00 PM</span>
        </div>
      </header>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Job Snapshot</p>
            <h2 class="text-lg font-semibold text-slate-900">Maple St Deck</h2>
            <p class="text-sm text-slate-600">482 Maple St, Seattle, WA - Site Walk Today at 3PM</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 shadow-inner">
              Remaining Balance: $17,400
            </span>
            <button class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 shadow-inner transition hover:bg-blue-100">
              Send Payment Link
            </button>
            <button class="text-sm font-semibold text-blue-600 underline-offset-4 hover:underline">
              Record Offline Payment
            </button>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 class="mb-4 text-base font-semibold text-slate-900">Quick Info</h3>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
            <p class="text-xs uppercase tracking-wide text-slate-500">Job Type</p>
            <p class="text-sm font-semibold text-slate-900">Deck</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
            <p class="text-xs uppercase tracking-wide text-slate-500">Created</p>
            <p class="text-sm font-semibold text-slate-900">Nov 28, 2025</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
            <p class="text-xs uppercase tracking-wide text-slate-500">Proposal</p>
            <p class="text-sm font-semibold text-slate-900">Sent</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
            <p class="text-xs uppercase tracking-wide text-slate-500">Estimate Range</p>
            <p class="text-sm font-semibold text-slate-900">$12,800 - $19,800</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
            <p class="text-xs uppercase tracking-wide text-slate-500">Assigned Crew</p>
            <p class="text-sm font-semibold text-slate-900">Not Assigned</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
            <p class="text-xs uppercase tracking-wide text-slate-500">Tags</p>
            <p class="text-sm font-semibold text-slate-900">Deck, Composite</p>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold text-slate-900">Payments Snapshot</h3>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 shadow-inner">
              Remaining Balance: $17,400
            </span>
            <button class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-inner transition hover:bg-blue-100">
              Send Payment Link
            </button>
            <button class="text-sm font-semibold text-blue-600 underline-offset-4 hover:underline">
              Record Offline Payment
            </button>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-base font-semibold text-slate-900">Project Timeline</h3>
          <button class="text-sm font-semibold text-blue-600 underline-offset-4 hover:underline" @click="openInbox">
            View Inbox
          </button>
        </div>
        <div class="relative pl-5">
          <div class="absolute left-2 top-3 bottom-3 w-px bg-slate-200"></div>
          <div class="space-y-4">
            <div v-for="item in previewEvents" :key="item.id" class="relative flex gap-4">
              <div class="absolute left-[-1px] top-1.5 h-3 w-3 rounded-full bg-blue-500 shadow"></div>
              <div class="pl-5">
                <p class="text-sm font-semibold text-slate-900">{{ item.title }}</p>
                <p class="text-xs text-slate-600">{{ item.time }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="text-base font-semibold text-slate-900">Tasks</h3>
          <span class="text-xs text-slate-500">Preview</span>
        </div>
        <ul class="space-y-2">
          <li
            v-for="task in tasks"
            :key="task"
            class="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-inner"
          >
            <span class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">+</span>
            <span class="text-sm font-medium text-slate-900">{{ task }}</span>
          </li>
        </ul>
        <button class="mt-4 text-sm font-semibold text-blue-600 underline-offset-4 hover:underline" @click="openFiles">
          Manage Task Files ->
        </button>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-900">Files &amp; Photos</h2>
          <button class="text-sm font-semibold text-blue-600 underline-offset-4 hover:underline" @click="openFiles">
            View All Files ->
          </button>
        </div>

        <div class="grid grid-cols-3 gap-3 sm:grid-cols-4">
          <div
            v-for="file in previewFiles"
            :key="file.id"
            class="aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
          >
            <img
              v-if="file.type === 'image'"
              :src="file.url"
              class="h-full w-full object-cover"
            />
            <div v-else class="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-500">
              {{ file.type.toUpperCase() }}
            </div>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h3 class="text-base font-semibold text-slate-900">Recent Messages</h3>
            <span class="text-xs text-slate-500">3</span>
          </div>
          <button class="text-sm font-semibold text-blue-600 underline-offset-4 hover:underline" @click="openInbox">
            View Full Inbox ->
          </button>
        </div>
        <div class="space-y-3">
          <button
            v-for="message in previewMessages"
            :key="message.name"
            type="button"
            class="flex w-full items-start justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left shadow-inner transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50"
            @click="openThread(message.threadId)"
          >
            <div>
              <div class="flex items-center gap-2">
                <p class="text-sm font-semibold text-slate-900">{{ message.name }} ({{ message.project }})</p>
                <span v-if="message.unread" class="inline-block h-2 w-2 rounded-full bg-blue-500"></span>
              </div>
              <p
                class="text-sm"
                :class="message.unread ? 'font-semibold text-slate-900' : 'text-slate-600'"
              >
                {{ message.preview }}
              </p>
            </div>
            <span class="text-xs text-slate-500">{{ message.time }}</span>
          </button>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-base font-semibold text-slate-900">Financial Summary</h3>
          <button
            class="inline-flex items-center gap-2 rounded-full bg-blue-600 px-3 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-blue-700"
            @click="openPayments"
          >
            View Payment Activity ->
          </button>
        </div>
        <div class="grid gap-4 sm:grid-cols-3">
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
            <p class="text-xs uppercase tracking-wide text-slate-500">Contract Amount</p>
            <p class="text-lg font-semibold text-slate-900">$19,800</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
            <p class="text-xs uppercase tracking-wide text-slate-500">Deposit Paid</p>
            <p class="text-lg font-semibold text-slate-900">$2,400</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-inner">
            <p class="text-xs uppercase tracking-wide text-slate-500">Remaining Balance</p>
            <p class="text-lg font-semibold text-slate-900">$17,400</p>
          </div>
        </div>
      </section>

      <div class="pb-20"></div>
    </div>

    <Transition name="fade">
      <PaymentActivity v-if="showPayments" @close="showPayments = false" />
    </Transition>
    <Transition name="fade">
      <FullMessagingInbox v-if="showInbox" @close="showInbox = false" />
    </Transition>
    <Transition name="fade">
      <FilesManager v-if="showFiles" @close="showFiles = false" />
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { messageStore } from "@/prototype/stores/messages";
import PaymentActivity from "./PaymentActivity.vue";
import FullMessagingInbox from "./FullMessagingInbox.vue";
import FilesManager from "./FilesManager.vue";
import { timelineEvents } from "./usePrototypeEvents";

const router = useRouter();
const showPayments = ref(false);
const showInbox = ref(false);
const showFiles = ref(false);

const tasks = [
  "Perform site measurements",
  "Photograph existing deck",
  "Identify hazards or obstructions"
];

const previewFiles = [
  { id: 1, url: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=400&q=80", type: "image" },
  { id: 2, url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80", type: "image" },
  { id: 3, url: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=400&q=80", type: "image" }
];

const previewEvents = computed(() => timelineEvents.value.slice(0, 3));
const previewMessages = computed(() =>
  messageStore.threads.slice(0, 3).map((thread) => ({
    name: thread.participant,
    project: thread.project,
    preview: thread.lastMessage,
    time: thread.lastMessageTime,
    threadId: thread.id,
    unread: thread.unread
  }))
);

function openPayments() {
  showPayments.value = true;
}

function openInbox() {
  router.push({ path: "/prototype/contractor/messages" });
}

function openFiles() {
  showFiles.value = true;
}

function openThread(id: string) {
  messageStore.markThreadRead(id);
  router.push({ path: "/prototype/contractor/messages", query: { threadId: id } });
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
