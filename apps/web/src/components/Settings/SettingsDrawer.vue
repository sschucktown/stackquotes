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
    >
      <div v-if="isOpen" class="fixed inset-0 z-50 flex">
        <div class="flex-1 bg-black/30 backdrop-blur-sm" @click="closeDrawer"></div>
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
            class="relative h-screen w-full max-w-full bg-white shadow-xl sm:w-[360px] sm:rounded-l-2xl"
          >
            <div class="flex h-full flex-col">
              <!-- Header -->
              <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Profile</p>
                  <h2 class="text-lg font-semibold text-slate-900">Settings</h2>
                </div>
                <button
                  type="button"
                  class="rounded p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                  @click="closeDrawer"
                >
                  <span class="sr-only">Close</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>

              <!-- Scrollable body -->
              <div class="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                <!-- Profile -->
                <section>
                  <div class="flex items-center gap-3">
                    <div class="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-base font-semibold text-white shadow-sm">
                      {{ profile.initials }}
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-slate-900">{{ profile.name }}</p>
                      <p class="text-sm text-slate-600">{{ profile.email }}</p>
                    </div>
                  </div>
                </section>

                <div class="border-t border-slate-200"></div>

                <!-- Company Settings -->
                <section>
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

                <div class="border-t border-slate-200"></div>

                <!-- Notifications -->
                <section>
                  <h3 class="text-sm font-semibold text-slate-800">Notifications</h3>
                  <div class="mt-3 space-y-3">
                    <div class="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                      <div>
                        <p class="text-sm font-medium text-slate-900">New message notifications</p>
                        <p class="text-xs text-slate-500">Prototype only</p>
                      </div>
                      <ToggleSwitch v-model="settings.notifyMessages" />
                    </div>
                    <div class="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                      <div>
                        <p class="text-sm font-medium text-slate-900">Payment received notifications</p>
                        <p class="text-xs text-slate-500">Prototype only</p>
                      </div>
                      <ToggleSwitch v-model="settings.notifyPayments" />
                    </div>
                    <div class="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                      <div>
                        <p class="text-sm font-medium text-slate-900">Job updates</p>
                        <p class="text-xs text-slate-500">Prototype only</p>
                      </div>
                      <ToggleSwitch v-model="settings.notifyJobUpdates" />
                    </div>
                  </div>
                </section>

                <div class="border-t border-slate-200"></div>

                <!-- Preferences -->
                <section class="space-y-3">
                  <h3 class="text-sm font-semibold text-slate-800">Preferences</h3>
                  <div class="flex items-center justify-between gap-3">
                    <div>
                      <p class="text-sm font-medium text-slate-900">Default scheduling window</p>
                      <p class="text-xs text-slate-500">Prototype dropdown</p>
                    </div>
                    <select
                      v-model="settings.schedulingWindow"
                      class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-inner focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      <option>9 AM – 5 PM</option>
                      <option>8 AM – 4 PM</option>
                      <option>10 AM – 6 PM</option>
                    </select>
                  </div>
                  <div class="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                    <div>
                      <p class="text-sm font-medium text-slate-900">Default payment method</p>
                      <p class="text-xs text-slate-500">Visa ending in 4242</p>
                    </div>
                    <span class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-inner">Saved</span>
                  </div>
                </section>

                <div class="border-t border-slate-200"></div>

                <!-- Prototype Toggles -->
                <section class="space-y-3">
                  <h3 class="text-sm font-semibold text-slate-800">Prototype Toggles</h3>
                  <div class="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2.5 shadow-sm">
                    <span class="text-sm font-medium text-slate-900">Enable Job Mode Auto-Open</span>
                    <ToggleSwitch v-model="settings.jobModeAutoOpen" />
                  </div>
                  <div class="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2.5 shadow-sm">
                    <span class="text-sm font-medium text-slate-900">Enable Live Message Sync (mock)</span>
                    <ToggleSwitch v-model="settings.liveMessageSync" />
                  </div>
                  <div class="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2.5 shadow-sm">
                    <span class="text-sm font-medium text-slate-900">Enable Payment Preview Mode</span>
                    <ToggleSwitch v-model="settings.paymentPreview" />
                  </div>
                </section>

                <div class="pb-4"></div>
              </div>
            </div>
          </aside>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { usePrototypeSettings } from "@/prototype/usePrototypeSettings";

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

const settings = usePrototypeSettings();
const isOpen = ref(true);

const ToggleSwitch = defineComponent({
  name: "ToggleSwitch",
  props: {
    modelValue: { type: Boolean, required: true },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    const toggle = () => emit("update:modelValue", !props.modelValue);
    const knob = computed(() => (props.modelValue ? "translate-x-5" : "translate-x-0"));
    const track = computed(() => (props.modelValue ? "bg-blue-500" : "bg-slate-200"));

    return () =>
      h(
        "button",
        {
          type: "button",
          class: "relative inline-flex h-6 w-11 items-center rounded-full shadow-inner transition",
          role: "switch",
          "aria-checked": props.modelValue,
          onClick: toggle,
        },
        [
          h("span", { class: ["absolute inset-0 rounded-full transition-colors", track.value] }),
          h("span", {
            class: [
              "absolute left-0.5 top-0.5 inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
              knob.value,
            ],
          }),
          h("span", { class: "sr-only" }, "Toggle"),
        ]
      );
  },
});

const closeDrawer = () => {
  isOpen.value = false;
  emit("close");
};

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    closeDrawer();
  }
};

watch(
  () => settings.liveMessageSync.value,
  (val) => {
    console.log("[proto] Live message sync toggled:", val);
  }
);

watch(
  () => settings.jobModeAutoOpen.value,
  (val) => {
    console.log("[proto] Job Mode Auto-Open toggled:", val);
  }
);

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
});
</script>
