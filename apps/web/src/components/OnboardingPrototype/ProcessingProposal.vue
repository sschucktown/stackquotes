<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50">
    <div class="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-10 sm:py-12">
      <header class="text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Processing</p>
        <h1 class="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">We’re rebuilding your proposal</h1>
        <p class="text-sm text-slate-600">This is a quick animation, then we’ll guess your trade.</p>
      </header>

      <section class="overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl backdrop-blur sm:p-8">
        <div class="space-y-6">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">File</p>
              <p class="text-sm font-semibold text-slate-900">
                {{ displayFileName }}
              </p>
            </div>
            <div class="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              <span class="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>
              <span>Parsing mock data</span>
            </div>
          </div>

          <div class="h-3 w-full rounded-full bg-slate-100">
            <div
              class="h-full rounded-full bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 transition-all duration-500 ease-out"
              :style="{ width: progressWidth }"
            ></div>
          </div>

          <div class="relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <transition name="fade" mode="out-in">
              <p :key="activeMessage" class="text-base font-semibold text-slate-900">
                {{ activeMessage }}
              </p>
            </transition>
            <p class="text-sm text-slate-600">We’ll jump ahead automatically.</p>

            <div class="mt-4 flex flex-wrap items-center gap-2">
              <span
                v-for="(message, idx) in messages"
                :key="message"
                class="h-2.5 w-2.5 rounded-full transition"
                :class="idx <= currentIndex ? 'bg-sky-500 shadow-sm shadow-sky-200' : 'bg-slate-200'"
              ></span>
            </div>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-inner">
            <p class="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">What we’re finding</p>
            <ul class="mt-3 space-y-2">
              <transition-group name="slide-fade" tag="div">
                <li
                  v-for="finding in visibleFindings"
                  :key="finding"
                  class="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm"
                >
                  <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">✓</span>
                  <span>{{ finding }}</span>
                </li>
              </transition-group>
            </ul>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useOnboardingPrototypeStore } from "@/stores/onboardingPrototype";

const router = useRouter();
const store = useOnboardingPrototypeStore();

const messages = [
  "Reading proposal…",
  "Extracting details…",
  "Identifying your trade…",
  "Building your proposal template…",
  "Setting up your profile…",
];

const currentIndex = ref(0);
const intervalId = ref<number | undefined>(undefined);
const timeoutId = ref<number | undefined>(undefined);
const findingsIntervalId = ref<number | undefined>(undefined);

const activeMessage = computed(() => messages[currentIndex.value]);
const progressWidth = computed(() => `${Math.min(((currentIndex.value + 1) / messages.length) * 100, 100)}%`);
const displayFileName = computed(() => store.uploadedFileName || "Old_Proposal.pdf");

const findings = [
  "Found 3 pricing items",
  "Detected trade: Deck Builder",
  "Found payment terms",
  "Extracted business location",
  "Rebuilding your proposal…",
];
const visibleFindings = ref<string[]>([]);

onMounted(() => {
  intervalId.value = window.setInterval(() => {
    currentIndex.value = Math.min(currentIndex.value + 1, messages.length - 1);
  }, 1000);

  findingsIntervalId.value = window.setInterval(() => {
    const next = findings[visibleFindings.value.length];
    if (next) {
      visibleFindings.value = [...visibleFindings.value, next];
    }
    if (visibleFindings.value.length === findings.length) {
      if (findingsIntervalId.value) clearInterval(findingsIntervalId.value);
    }
  }, 700);

  timeoutId.value = window.setTimeout(() => {
    router.push("/onboarding/trade-detection");
  }, 4800);
});

onBeforeUnmount(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value);
  }
  if (timeoutId.value) {
    clearTimeout(timeoutId.value);
  }
  if (findingsIntervalId.value) {
    clearInterval(findingsIntervalId.value);
  }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.slide-fade-enter-active {
  transition: all 0.2s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.slide-fade-leave-active {
  transition: all 0.15s ease;
}
.slide-fade-leave-to {
  opacity: 0;
}
</style>
