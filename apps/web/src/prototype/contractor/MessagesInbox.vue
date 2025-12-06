<template>
  <div class="min-h-screen bg-gradient-to-br from-[#F3F3F5] via-[#E8F0FF] to-white text-slate-900">
    <!-- Sticky Header -->
    <header class="sticky top-0 z-30 border-b border-white/70 bg-white/85 backdrop-blur">
      <div class="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div class="flex flex-col gap-2">
          <div class="flex flex-wrap items-center gap-2 text-sm text-slate-700">
            <a
              href="/prototype/contractor/job-demo"
              class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-800 shadow-inner transition hover:-translate-y-0.5 hover:bg-slate-200"
            >
              <span class="text-lg leading-none">&larr;</span>
              <span>Back</span>
            </a>
            <span class="text-slate-400">|</span>
            <span class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Messages</span>
            <span class="rounded-full bg-[#E8F0FF] px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-inner">
              Full Inbox Prototype
            </span>
          </div>
          <div>
            <h1 class="text-2xl font-semibold text-slate-900">Messages</h1>
            <p class="text-sm text-slate-600">Premium inbox view for contractors (prototype)</p>
          </div>
        </div>
        <div class="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
          <div class="flex flex-wrap items-center gap-2">
            <button
              v-for="filter in filters"
              :key="filter.value"
              class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold transition"
              :class="activeFilter === filter.value ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-inner' : 'border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50'"
              @click="activeFilter = filter.value"
            >
              {{ filter.label }}
            </button>
          </div>
          <div class="relative w-full sm:w-64">
            <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <input
              v-model="search"
              type="text"
              placeholder="Search threads"
              class="w-full rounded-full border border-slate-200 bg-white px-10 py-2 text-sm text-slate-800 shadow-inner focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 pb-36 pt-6 sm:px-6 lg:px-8">
      <div class="grid gap-4 md:grid-cols-[340px,1fr]">
        <!-- Thread List -->
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
        >
          <aside
            v-if="showList"
            class="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.55)] backdrop-blur"
          >
            <div class="flex items-center justify-between gap-2 border-b border-slate-200/80 px-4 py-3">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Inbox</p>
                <p class="text-sm font-semibold text-slate-900">Threads</p>
              </div>
              <span class="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700 shadow-inner">
                {{ filteredThreads.length }} active
              </span>
            </div>

            <div class="max-h-[70vh] space-y-2 overflow-y-auto px-3 py-3">
              <button
                v-for="thread in filteredThreads"
                :key="thread.id"
                class="group relative flex w-full items-start gap-3 rounded-2xl border border-transparent bg-white px-3 py-3 text-left transition duration-150 hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-lg"
                :class="thread.id === selectedThreadId ? 'border-l-4 border-blue-500/90 bg-blue-50/60 shadow-lg' : 'shadow-sm'"
                @click="selectThread(thread.id)"
              >
                <div
                  class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#E8F0FF] to-white text-sm font-semibold text-slate-800 shadow-inner"
                >
                  {{ thread.initials }}
                </div>
                <div class="flex-1 space-y-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="text-sm font-semibold text-slate-900">
                      {{ thread.name }}
                    </p>
                    <span
                      class="rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                      :class="badgeClass(thread.jobType)"
                    >
                      {{ thread.jobType }}
                    </span>
                    <span class="text-xs text-slate-500">• {{ thread.project }}</span>
                  </div>
                  <p
                    class="line-clamp-1 text-sm text-slate-700"
                    :class="thread.unread ? 'font-semibold text-slate-900' : ''"
                  >
                    {{ thread.lastMessage }}
                  </p>
                  <div class="flex items-center gap-2 text-xs text-slate-500">
                    <span>{{ thread.time }}</span>
                    <span class="h-1.5 w-1.5 rounded-full bg-slate-200"></span>
                    <span class="text-slate-600">{{ thread.category === 'team' ? 'Team' : 'Client' }}</span>
                  </div>
                </div>
                <div class="flex flex-col items-end gap-2">
                  <span v-if="thread.unread" class="h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_0_4px_rgba(191,215,255,0.5)]"></span>
                  <span class="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600 shadow-inner">
                    {{ thread.time }}
                  </span>
                </div>
              </button>
            </div>
          </aside>
        </transition>

        <!-- Thread View -->
        <transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 translate-x-4"
          enter-to-class="opacity-100 translate-x-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="opacity-100 translate-x-0"
          leave-to-class="opacity-0 -translate-x-4"
        >
          <section
            v-if="showChat"
            class="relative flex min-h-[70vh] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.55)] backdrop-blur"
          >
            <div class="flex items-center justify-between gap-3 border-b border-slate-200/80 px-4 py-3 sm:px-6">
              <div class="flex items-center gap-3">
                <button
                  class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 md:hidden"
                  @click="mobileView = 'list'"
                >
                  <span class="text-lg leading-none">&larr;</span>
                  <span>Threads</span>
                </button>
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700 shadow-inner">
                  {{ selectedThread?.initials }}
                </div>
                <div class="space-y-0.5">
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="text-base font-semibold text-slate-900">{{ selectedThread?.name }}</p>
                    <span class="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 shadow-inner">
                      {{ selectedThread?.project }}
                    </span>
                    <span
                      class="rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                      :class="badgeClass(selectedThread?.jobType || '')"
                    >
                      {{ selectedThread?.jobType }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-500">Messages synced across client & team views (demo)</p>
                </div>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <button
                  class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
                  @click="markAsRead"
                >
                  <span class="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.15)]"></span>
                  Mark as Read
                </button>
                <a
                  href="/prototype/contractor/job-demo"
                  class="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  View Job
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m9 5 7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>

            <div class="flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-white via-[#F8FAFF] to-[#E8F0FF] px-4 py-4 sm:px-6">
              <transition-group
                name="fade"
                enter-active-class="transition duration-200 ease-out"
                enter-from-class="opacity-0 translate-y-2"
                enter-to-class="opacity-100 translate-y-0"
              >
                <div
                  v-for="message in activeMessages"
                  :key="message.id"
                  class="flex"
                  :class="message.sender === 'contractor' ? 'justify-end' : 'justify-start'"
                >
                  <div class="flex max-w-[78%] flex-col gap-2 sm:max-w-[65%]">
                    <div
                      class="rounded-2xl px-4 py-3 text-sm shadow-md transition"
                      :class="message.sender === 'contractor' ? 'bg-blue-600 text-white shadow-blue-100' : 'bg-white/90 text-slate-800 border border-slate-200/80'"
                    >
                      <p class="leading-relaxed">{{ message.text }}</p>
                    </div>
                    <p
                      class="text-[11px] font-semibold"
                      :class="message.sender === 'contractor' ? 'text-blue-100 text-right' : 'text-slate-500 text-left'"
                    >
                      {{ message.time }}
                    </p>
                  </div>
                </div>
              </transition-group>
            </div>

            <!-- Composer -->
            <div class="sticky bottom-0 border-t border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur sm:px-6">
              <div class="flex items-end gap-3">
                <button
                  class="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
                  aria-label="Attach"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m21.44 11.05-9.02 9.02a5 5 0 1 1-7.07-7.07l9.02-9.02a3 3 0 1 1 4.25 4.24l-8.49 8.5a1 1 0 0 1-1.42-1.42l7.78-7.78" />
                  </svg>
                </button>
                <div class="relative flex-1">
                  <textarea
                    v-model="draft"
                    rows="2"
                    class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 shadow-inner focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="Type a message (prototype)"
                  ></textarea>
                  <div class="pointer-events-none absolute inset-x-4 bottom-2 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                    <span>Auto-saves to client + team</span>
                    <span>Typing...</span>
                  </div>
                </div>
                <button
                  class="inline-flex h-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-200 px-4 text-sm font-semibold text-white shadow-inner opacity-70"
                  disabled
                >
                  Send
                </button>
              </div>
              <div class="pt-2 text-[11px] font-semibold text-slate-500 md:hidden">
                Pinned composer • Safe keyboard spacing
              </div>
            </div>
          </section>
        </transition>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";

type Thread = {
  id: string;
  name: string;
  initials: string;
  project: string;
  jobType: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  category: "client" | "team";
};

type Message = {
  id: string;
  sender: "client" | "contractor" | "team";
  text: string;
  time: string;
};

const filters = [
  { value: "all", label: "All" },
  { value: "clients", label: "Clients" },
  { value: "team", label: "Team" },
] as const;

const threads = ref<Thread[]>([
  {
    id: "sarah",
    name: "Sarah Thompson",
    initials: "ST",
    project: "Maple St Deck",
    jobType: "Deck",
    lastMessage: "Quick question about materials.",
    time: "2h ago",
    unread: true,
    category: "client",
  },
  {
    id: "mike",
    name: "Mike Robertson",
    initials: "MR",
    project: "Lakeview Patio",
    jobType: "Patio",
    lastMessage: "Did you get the photos?",
    time: "4h ago",
    unread: false,
    category: "client",
  },
  {
    id: "crew",
    name: "Crew Chat",
    initials: "CC",
    project: "Team Thread",
    jobType: "Team",
    lastMessage: "Material staged by side gate.",
    time: "Yesterday",
    unread: false,
    category: "team",
  },
]);

const messages: Record<string, Message[]> = {
  sarah: [
    { id: "m1", sender: "client", text: "Hi Jordan, can you confirm the composite color options?", time: "9:04 AM" },
    { id: "m2", sender: "contractor", text: "Yes! We can show you samples during the visit.", time: "9:06 AM" },
    { id: "m3", sender: "client", text: "Great, thank you!", time: "9:09 AM" },
  ],
  mike: [
    { id: "m4", sender: "client", text: "Hi Jordan, can you confirm the composite color options?", time: "8:40 AM" },
    { id: "m5", sender: "contractor", text: "Yes! We can show you samples during the visit.", time: "8:44 AM" },
    { id: "m6", sender: "client", text: "Great, thank you!", time: "8:45 AM" },
  ],
  crew: [
    { id: "m7", sender: "team", text: "Hi Jordan, can you confirm the composite color options?", time: "Yesterday 6:30 PM" },
    { id: "m8", sender: "contractor", text: "Yes! We can show you samples during the visit.", time: "Yesterday 6:42 PM" },
    { id: "m9", sender: "team", text: "Great, thank you!", time: "Yesterday 6:44 PM" },
  ],
};

const activeFilter = ref<typeof filters[number]["value"]>("all");
const search = ref("");
const selectedThreadId = ref(threads.value[0]?.id ?? "");
const draft = ref("");
const mobileView = ref<"list" | "chat">("list");
const isDesktop = ref(typeof window !== "undefined" ? window.innerWidth >= 768 : true);

const filteredThreads = computed(() => {
  let list = threads.value;

  if (activeFilter.value === "clients") {
    list = list.filter((thread) => thread.category === "client");
  } else if (activeFilter.value === "team") {
    list = list.filter((thread) => thread.category === "team");
  }

  if (search.value.trim()) {
    const query = search.value.toLowerCase();
    list = list.filter(
      (thread) =>
        thread.name.toLowerCase().includes(query) ||
        thread.project.toLowerCase().includes(query) ||
        thread.lastMessage.toLowerCase().includes(query)
    );
  }

  return list;
});

const selectedThread = computed(() =>
  threads.value.find((thread) => thread.id === selectedThreadId.value)
);

const activeMessages = computed(() => messages[selectedThreadId.value] || []);

const showList = computed(() => mobileView.value === "list" || isDesktop.value);
const showChat = computed(() => mobileView.value === "chat" || isDesktop.value);

const badgeClass = (jobType: string) => {
  if (jobType === "Deck") return "border-blue-100 bg-blue-50 text-blue-700";
  if (jobType === "Patio") return "border-amber-100 bg-amber-50 text-amber-700";
  if (jobType === "Fence") return "border-emerald-100 bg-emerald-50 text-emerald-700";
  if (jobType === "Team") return "border-slate-200 bg-slate-100 text-slate-700";
  return "border-slate-200 bg-slate-50 text-slate-700";
};

const selectThread = (id: string) => {
  selectedThreadId.value = id;
  mobileView.value = "chat";
  const thread = threads.value.find((item) => item.id === id);
  if (thread) thread.unread = false;
};

const markAsRead = () => {
  const thread = threads.value.find((item) => item.id === selectedThreadId.value);
  if (thread) thread.unread = false;
};

const updateIsDesktop = () => {
  if (typeof window === "undefined") return;
  isDesktop.value = window.innerWidth >= 768;
};

onMounted(() => {
  updateIsDesktop();
  if (typeof window !== "undefined") {
    window.addEventListener("resize", updateIsDesktop);
  }
});

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", updateIsDesktop);
  }
});
</script>
