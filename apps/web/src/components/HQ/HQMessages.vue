<template>
  <section class="space-y-3">
    <header class="flex items-center justify-between">
      <div>
        <h2 class="text-lg font-semibold text-slate-900">Recent Messages</h2>
        <p class="text-sm text-slate-500">Stay close to clients</p>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 hover:shadow"
      >
        Inbox ->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5">
          <path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </header>
    <div class="space-y-2">
      <article
        v-for="thread in threads"
        :key="thread.name + thread.project"
        class="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:bg-slate-50 hover:shadow-sm"
      >
        <div class="flex items-start gap-3 overflow-hidden">
          <div class="relative">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-100 text-slate-700 text-sm font-semibold animate-avatar-in"
              :style="{ animationDelay: thread.delay || '0ms' }"
            >
              {{ thread.initials }}
            </div>
            <span
              v-if="thread.unread"
              class="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-sky-500 ring-2 ring-white"
            />
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <h3 class="truncate text-sm font-semibold leading-tight text-slate-900">{{ thread.name }}</h3>
              <span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                {{ thread.jobType }}
              </span>
            </div>
            <p class="text-[11px] uppercase tracking-wide text-slate-500">{{ thread.project }}</p>
            <p class="mt-0.5 max-w-[240px] truncate text-sm text-slate-700">{{ thread.preview }}</p>
          </div>
        </div>
        <div class="ml-3 shrink-0 text-xs font-medium text-slate-400 group-hover:text-slate-500">{{ thread.time }}</div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  threads: {
    name: string;
    project: string;
    preview: string;
    time: string;
    initials: string;
    jobType: string;
    unread?: boolean;
    delay?: string;
  }[];
}>();
</script>

<style scoped>
@keyframes avatar-in {
  0% {
    transform: translateY(4px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
.animate-avatar-in {
  animation: avatar-in 0.25s ease-out both;
}
</style>
