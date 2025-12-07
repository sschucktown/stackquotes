<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <header class="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div class="flex items-center gap-3">
          <button
            class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 shadow-inner transition hover:bg-slate-200"
          >
            <span class="text-lg leading-none">&larr;</span>
            <span>Maple St Deck</span>
          </button>
          <div class="flex flex-col">
            <span class="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Project</span>
            <h1 class="text-xl font-semibold text-slate-900">Project Timeline</h1>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div
            class="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm sm:inline-flex"
          >
            <span class="text-slate-500">Range</span>
            <span>June 5 - June 28</span>
          </div>
          <button
            class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
          >
            <span class="hidden sm:inline">Filter:</span>
            <span>{{ currentFilterLabel }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
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
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <section class="mb-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Activity</p>
            <p class="text-lg font-semibold text-slate-900">Chronological job history</p>
          </div>
          <div class="flex items-center gap-2 overflow-x-auto pb-1 sm:justify-end">
            <button
              v-for="option in filterOptions"
              :key="option.value"
              class="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold transition"
              :class="activeFilter === option.value ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-inner' : 'border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50'"
              @click="activeFilter = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div class="relative pl-6">
          <div class="absolute top-0 bottom-0 left-3 w-px bg-slate-200"></div>
          <div v-for="event in filteredEvents" :key="event.id" class="relative mb-8 last:mb-0">
            <div
              class="absolute -left-1 top-1 h-3 w-3 rounded-full shadow-sm"
              :class="typeStyles[event.type]?.dot ?? 'bg-slate-400'"
            ></div>

            <div
              class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-150 hover:-translate-y-0.5 hover:shadow-md sm:p-5"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-start gap-3">
                  <div
                    class="flex h-10 w-10 items-center justify-center rounded-xl"
                    :class="typeStyles[event.type]?.iconBg ?? 'bg-slate-100 text-slate-700'"
                  >
                    <svg
                      v-if="event.type === 'file'"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      class="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M4 4h10l6 6v10H4z" />
                      <path d="M14 4v6h6" />
                    </svg>
                    <svg
                      v-else-if="event.type === 'task'"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      class="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="m5 12 4 4L19 6" />
                    </svg>
                    <svg
                      v-else-if="event.type === 'note' || event.type === 'status'"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      class="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M6 5h9l3 3v11H6z" />
                      <path d="M15 5v3h3" />
                    </svg>
                    <svg
                      v-else-if="event.type === 'message'"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      class="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8Z" />
                    </svg>
                    <svg
                      v-else-if="event.type === 'payment'"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      class="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <path d="M2 10h20" />
                      <path d="M6 15h2" />
                      <path d="M9 15h2" />
                    </svg>
                    <svg
                      v-else
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      class="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 3" />
                    </svg>
                  </div>
                    <div class="space-y-1">
                      <div class="flex flex-wrap items-center gap-2">
                        <p class="text-sm font-semibold text-slate-900">{{ event.title }}</p>
                        <span
                          v-if="event.type === 'message' && event.unread"
                          class="h-2 w-2 rounded-full bg-purple-400"
                        ></span>
                        <span
                          class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold"
                          :class="typeStyles[event.type]?.badge ?? 'border-slate-200 bg-slate-100 text-slate-700'"
                        >
                          {{ typeLabels[event.type] ?? 'Event' }}
                        </span>
                      </div>
                      <p class="text-xs text-slate-500">{{ event.time }}</p>
                    </div>
                </div>
                <div class="hidden rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500 sm:block">
                  {{ event.type === 'payment' && event.amount ? event.amount : 'Timeline' }}
                </div>
              </div>

              <div v-if="event.description || event.messagePreview || event.text" class="mt-3 text-sm text-slate-700">
                <p>{{ event.description ?? event.messagePreview ?? event.text }}</p>
              </div>

              <div v-if="event.amount && event.type === 'payment'" class="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 6v12" />
                  <path d="M9 9h6a3 3 0 0 1 0 6H9" />
                </svg>
                {{ event.amount }}
              </div>

              <div v-if="event.fileUrl || event.thumbnails" class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                <div
                  v-for="(thumb, idx) in event.thumbnails ?? [event.fileUrl]"
                  :key="`${event.id}-thumb-${idx}`"
                  class="group relative h-28 cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                  @click="thumb && openViewer(thumb)"
                >
                  <img v-if="thumb" :src="thumb" alt="" class="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02] group-hover:brightness-95" />
                  <div
                    v-else
                    class="flex h-full w-full items-center justify-center text-xs font-semibold text-slate-500"
                  >
                    No Preview
                  </div>
                  <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent"></div>
                </div>
              </div>

              <div class="mt-4 flex flex-wrap gap-2">
                <button
                  v-if="event.type === 'task'"
                  class="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 shadow-inner transition hover:-translate-y-0.5 hover:bg-emerald-100"
                  @click="alert('Open Task')"
                >
                  View Task
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m9 5 7 7-7 7" />
                  </svg>
                </button>
                <button
                  v-if="event.type === 'file'"
                  class="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 shadow-inner transition hover:-translate-y-0.5 hover:bg-blue-100"
                  @click="event.fileUrl && openViewer(event.fileUrl)"
                >
                  View File
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 9h6" />
                    <path d="M5 13h10" />
                    <path d="M5 17h8" />
                    <path d="M15 3v4a1 1 0 0 0 1 1h4" />
                    <path d="M15 3h-8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" />
                  </svg>
                </button>
                <button
                  v-if="event.type === 'message'"
                  class="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-sm font-semibold text-violet-700 shadow-inner transition hover:-translate-y-0.5 hover:bg-violet-100"
                  @click="alert('Open Message')"
                >
                  Open Message
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 5h18" />
                    <path d="M3 9h18" />
                    <path d="M3 13h12" />
                    <path d="M3 17h8" />
                  </svg>
                </button>
                <button
                  v-if="event.type === 'payment'"
                  class="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700 shadow-inner transition hover:-translate-y-0.5 hover:bg-amber-100"
                >
                  View Payment
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 11h14" />
                    <path d="M5 15h6" />
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                  </svg>
                </button>
                <button
                  v-if="event.type === 'status'"
                  class="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700 shadow-inner transition hover:-translate-y-0.5 hover:bg-rose-100"
                >
                  View Related
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m9 5 7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <SettingsDrawer v-if="showSettings" @close="showSettings = false" />
    <ImageViewerModal
      v-if="showViewer"
      :file="{ url: viewerSrc }"
      @close="showViewer = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import ImageViewerModal from "@/prototype/contractor/files/ImageViewerModal.vue";
import SettingsDrawer from "@/components/Settings/SettingsDrawer.vue";
import { messageStore } from "@/prototype/stores/messages";
import { timelineEvents } from "./usePrototypeEvents";

const events = timelineEvents;
const activeFilter = ref<"all" | "task" | "file" | "note" | "message" | "payment" | "status">("all");
const showViewer = ref(false);
const viewerSrc = ref("");
const showSettings = ref(false);

const filterOptions = [
  { value: "all", label: "All" },
  { value: "task", label: "Tasks" },
  { value: "file", label: "Files" },
  { value: "note", label: "Notes" },
  { value: "message", label: "Messages" },
  { value: "payment", label: "Payments" }
] as const;

const typeStyles: Record<string, { dot: string; badge: string; iconBg: string }> = {
  file: { dot: "bg-blue-500", badge: "border-blue-100 bg-blue-50 text-blue-700", iconBg: "bg-blue-50 text-blue-700" },
  task: { dot: "bg-emerald-500", badge: "border-emerald-100 bg-emerald-50 text-emerald-700", iconBg: "bg-emerald-50 text-emerald-700" },
  note: { dot: "bg-amber-500", badge: "border-amber-100 bg-amber-50 text-amber-700", iconBg: "bg-amber-50 text-amber-700" },
  message: { dot: "bg-violet-500", badge: "border-violet-100 bg-violet-50 text-violet-700", iconBg: "bg-violet-50 text-violet-700" },
  payment: { dot: "bg-rose-500", badge: "border-rose-100 bg-rose-50 text-rose-700", iconBg: "bg-rose-50 text-rose-700" },
  status: { dot: "bg-sky-500", badge: "border-sky-100 bg-sky-50 text-sky-700", iconBg: "bg-sky-50 text-sky-700" }
};

const typeLabels: Record<string, string> = {
  file: "File",
  task: "Task",
  note: "Note",
  message: "Message",
  payment: "Payment",
  status: "Status"
};

function openViewer(src?: string) {
  if (!src) return;
  viewerSrc.value = src;
  showViewer.value = true;
}

const enhancedEvents = computed(() => {
  return (events.value.length ? [...events.value] : []).map((event) => {
    if (event.type !== "message") return { ...event, unread: false };

    const matchedThread = messageStore.threads.find(
      (thread) =>
        thread.id === event.threadId ||
        thread.participant.toLowerCase() === (event.from || "").toLowerCase()
    );

    return { ...event, unread: matchedThread?.unread ?? false };
  });
});

const filteredEvents = computed(() => {
  const list = enhancedEvents.value;
  if (activeFilter.value === "all") return list;
  return list.filter((event) => event.type === activeFilter.value);
});

const currentFilterLabel = computed(() => {
  const found = filterOptions.find((item) => item.value === activeFilter.value);
  return found?.label ?? "All";
});
</script>
