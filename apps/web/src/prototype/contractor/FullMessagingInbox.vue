<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <div class="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-6 sm:px-6">
      <header class="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex items-center gap-3">
          <button
            class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 shadow-inner transition hover:bg-slate-200"
            @click="emit('close')"
          >
            <span class="text-lg leading-none">&larr;</span>
            <span>Back</span>
          </button>
          <div>
            <p class="text-xs uppercase tracking-[0.08em] text-slate-500">Messages</p>
            <h1 class="text-lg font-semibold text-slate-900">Message Inbox</h1>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600">
          <span class="rounded-full bg-slate-100 px-3 py-1">Maple St Deck</span>
        </div>
      </header>

      <section class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="tab in tabs"
            :key="tab"
            class="rounded-full border px-3 py-1 text-sm font-semibold transition"
            :class="tab === 'All' ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'"
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

      <section class="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="divide-y divide-slate-100">
          <div
            v-for="thread in threads"
            :key="thread.id"
            class="flex items-start gap-3 px-4 py-4 transition hover:bg-slate-50"
          >
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
              {{ thread.initials }}
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <p class="text-sm font-semibold text-slate-900">{{ thread.name }}</p>
                  <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                    {{ thread.job }}
                  </span>
                </div>
                <span class="text-xs text-slate-500">{{ thread.time }}</span>
              </div>
              <p class="text-sm text-slate-600">{{ thread.preview }}</p>
            </div>
          </div>
        </div>
      </section>

      <div class="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div class="mx-auto flex max-w-2xl items-center justify-between px-4 py-3 sm:px-6">
          <span class="text-sm font-semibold text-slate-800">New message</span>
          <button class="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700">
            New Message
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: "close"): void;
}>();

const tabs = ["All", "Unread", "Jobs", "Payments"];

const threads = [
  {
    id: "t1",
    name: "Sarah Thompson",
    initials: "ST",
    job: "Deck",
    preview: "Quick question about materials.",
    time: "2h ago"
  },
  {
    id: "t2",
    name: "Mike Robertson",
    initials: "MR",
    job: "Patio",
    preview: "Did you get the photos?",
    time: "4h ago"
  },
  {
    id: "t3",
    name: "Crew Chat",
    initials: "CC",
    job: "Team",
    preview: "Material staged by side gate.",
    time: "Yesterday"
  },
  {
    id: "t4",
    name: "Auto Messages",
    initials: "AM",
    job: "System",
    preview: "Proposal follow-up pending",
    time: "Yesterday"
  }
];
</script>
