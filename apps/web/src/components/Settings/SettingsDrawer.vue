<template>
  <Teleport to="body">
    <Transition
      appear
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
      @after-leave="$emit('close')"
    >
      <div v-if="isOpen" class="fixed inset-0 z-50 flex">
        <div class="flex-1 bg-black/30 backdrop-blur-sm" @click="requestClose"></div>

        <Transition
          appear
          enter-active-class="transform transition-transform duration-300"
          enter-from-class="translate-x-full"
          enter-to-class="translate-x-0"
          leave-active-class="transform transition-transform duration-250"
          leave-from-class="translate-x-0"
          leave-to-class="translate-x-full"
        >
          <aside
            v-if="isOpen"
            class="w-full sm:w-[360px] max-w-full bg-white h-full shadow-xl overflow-y-auto p-6"
          >
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-lg font-semibold text-slate-900">Settings</h2>
              <button
                type="button"
                class="p-1.5 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition"
                @click="requestClose"
              >
                <span class="sr-only">Close</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <section class="mb-6">
              <div class="flex items-center gap-3">
                <div class="h-12 w-12 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white font-semibold grid place-items-center shadow-sm">
                  {{ profile.initials }}
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-900">{{ profile.name }}</p>
                  <p class="text-sm text-slate-600">{{ profile.email }}</p>
                </div>
              </div>
            </section>

            <section class="mb-6 rounded-xl border border-slate-200 bg-slate-50/60 p-4 shadow-inner">
              <h3 class="text-sm font-semibold text-slate-800">Company Settings</h3>
              <dl class="mt-3 space-y-2 text-sm text-slate-700">
                <div class="flex items-start justify-between gap-3">
                  <dt class="text-slate-500">Company</dt>
                  <dd class="font-medium text-slate-900">{{ company.name }}</dd>
                </div>
                <div class="flex items-start justify-between gap-3">
                  <dt class="text-slate-500">Trades</dt>
                  <dd class="font-medium text-slate-900">{{ company.trades }}</dd>
                </div>
              </dl>
            </section>

            <section class="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 class="text-sm font-semibold text-slate-800">Notifications</h3>
              <div class="mt-3 space-y-3">
                <div
                  v-for="toggle in notificationToggles"
                  :key="toggle.label"
                  class="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5"
                >
                  <div>
                    <p class="text-sm font-semibold text-slate-900">{{ toggle.label }}</p>
                    <p class="text-xs text-slate-500">Prototype only</p>
                  </div>
                  <div class="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 shadow-inner">
                    <span class="absolute left-0.5 top-0.5 inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 translate-x-0" />
                  </div>
                </div>
              </div>
            </section>

            <section class="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 class="text-sm font-semibold text-slate-800">Preferences</h3>
              <dl class="mt-3 space-y-3 text-sm text-slate-700">
                <div class="flex items-center justify-between gap-3">
                  <dt class="text-slate-500">Scheduling Window</dt>
                  <dd class="flex items-center gap-2 font-medium text-slate-900">
                    <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 shadow-inner">
                      {{ preferences.schedulingWindow }}
                    </span>
                    <span class="inline-flex items-center rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Dropdown (mock)
                    </span>
                  </dd>
                </div>
                <div class="flex items-center justify-between gap-3">
                  <dt class="text-slate-500">Payment Method</dt>
                  <dd class="font-medium text-slate-900">{{ preferences.paymentMethod }}</dd>
                </div>
              </dl>
            </section>

            <section class="rounded-xl border border-blue-100 bg-blue-50/80 p-4 shadow-inner">
              <h3 class="text-sm font-semibold text-blue-900">Prototype Toggles</h3>
              <div class="mt-3 space-y-2.5">
                <div
                  v-for="prototypeToggle in prototypeToggles"
                  :key="prototypeToggle"
                  class="flex items-center justify-between rounded-lg bg-white/80 px-3 py-2 shadow-sm ring-1 ring-white/70"
                >
                  <span class="text-sm font-semibold text-slate-900">{{ prototypeToggle }}</span>
                  <div class="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 shadow-inner">
                    <span class="absolute left-0.5 top-0.5 inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 translate-x-0" />
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

const emit = defineEmits<{
  (e: "close"): void;
}>();

const profile = {
  name: "Jordan Deckworks",
  email: "jordan@deckworks.com",
  initials: "JD",
};

const company = {
  name: "Jordan Deckworks",
  trades: "Decks, Fences, Patios",
};

const notificationToggles = [
  { label: "New message notifications" },
  { label: "Payment received notifications" },
  { label: "Job updates" },
];

const preferences = {
  schedulingWindow: "9 AM – 5 PM",
  paymentMethod: "Visa ending in 4242",
};

const prototypeToggles = ["Enable Job Mode Auto-Open", "Enable Live Message Sync (mock)", "Enable Payment Preview Mode"];

const isOpen = ref(true);

function requestClose() {
  isOpen.value = false;
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") {
    requestClose();
  }
}

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
});
</script>
