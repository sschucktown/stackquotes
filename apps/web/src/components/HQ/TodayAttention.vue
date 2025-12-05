<template>
  <section
    class="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm md:p-5 shadow-[0_10px_20px_-16px_rgba(15,23,42,0.45)]"
  >
    <div class="mb-3 flex items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <div class="grid h-9 w-9 place-items-center rounded-full bg-sky-50 text-sky-600">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 3v18" />
            <path d="M5 8h14M5 16h14" />
          </svg>
        </div>
        <div>
          <h2 class="text-lg font-semibold">Today's Attention</h2>
          <p class="text-sm text-slate-500">Quick read alerts to keep you ahead</p>
        </div>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white hover:shadow"
      >
        <span class="text-base leading-none">+</span>
        <span>Add</span>
      </button>
    </div>

    <div class="relative">
      <!-- Mobile/Tablet Fades -->
      <div
        v-show="!isDesktop && showLeftFade"
        class="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white via-white/80 to-transparent transition-opacity duration-200 lg:hidden"
        :class="showLeftFade ? 'opacity-100' : 'opacity-0'"
      />
      <div
        v-show="!isDesktop && showRightFade"
        class="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white via-white/80 to-transparent transition-opacity duration-200 lg:hidden"
        :class="showRightFade ? 'opacity-100' : 'opacity-0'"
      />

      <!-- Desktop Arrows -->
      <button
        v-show="isDesktop && canScrollLeft"
        type="button"
        class="absolute right-12 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 backdrop-blur-sm text-slate-700 shadow-sm transition-opacity duration-300 hover:bg-white lg:flex"
        :class="canScrollLeft ? 'opacity-100' : 'opacity-0'"
        @click="scrollBy(-300)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>
      <button
        v-show="isDesktop && canScrollRight"
        type="button"
        class="absolute right-2 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 backdrop-blur-sm text-slate-700 shadow-sm transition-opacity duration-300 hover:bg-white lg:flex"
        :class="canScrollRight ? 'opacity-100' : 'opacity-0'"
        @click="scrollBy(300)"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="m9 6 6 6-6 6" />
        </svg>
      </button>

      <div
        ref="scrollEl"
        class="flex gap-3 overflow-x-auto pb-1 pr-6 no-scrollbar"
        @scroll="handleScroll"
      >
        <HQAlertCard v-for="alert in alerts" :key="alert.title" :alert="alert" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import HQAlertCard from "./HQAlertCard.vue";

type AlertTone = "info" | "success" | "warning" | "danger";

const alerts = [
  { title: "3 new visit requests", subtitle: "Needs visit", tone: "info" as AlertTone, icon: "info" },
  { title: "Proposal accepted - Maple St Deck", subtitle: "Signed today", tone: "success" as AlertTone, icon: "check" },
  { title: "Payment received - $2,400", subtitle: "Payment received", tone: "success" as AlertTone, icon: "check" },
  { title: "CO awaiting approval - Kitchen Remodel", subtitle: "Client review", tone: "warning" as AlertTone, icon: "flag" },
  { title: "2 unanswered client messages", subtitle: "Follow up", tone: "danger" as AlertTone, icon: "alert" },
];

const scrollEl = ref<HTMLElement | null>(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);
const showLeftFade = ref(false);
const showRightFade = ref(false);
const isDesktop = ref(false);
let resizeObserver: (() => void) | null = null;

const updateScrollState = () => {
  const el = scrollEl.value;
  if (!el) return;
  const { scrollLeft, scrollWidth, clientWidth } = el;
  const atLeft = scrollLeft <= 0;
  const atRight = scrollLeft + clientWidth >= scrollWidth - 1;
  canScrollLeft.value = !atLeft;
  canScrollRight.value = !atRight;
  showLeftFade.value = !isDesktop.value && !atLeft;
  showRightFade.value = !isDesktop.value && !atRight;
};

const handleScroll = () => updateScrollState();

const scrollBy = (left: number) => {
  scrollEl.value?.scrollBy({ left, behavior: "smooth" });
};

const updateBreakpoint = () => {
  isDesktop.value = window.matchMedia("(min-width: 1024px)").matches;
  updateScrollState();
};

onMounted(async () => {
  await nextTick();
  updateBreakpoint();
  scrollEl.value?.addEventListener("scroll", handleScroll, { passive: true });
  const onResize = () => updateBreakpoint();
  window.addEventListener("resize", onResize);
  resizeObserver = () => window.removeEventListener("resize", onResize);
  updateScrollState();
});

onBeforeUnmount(() => {
  scrollEl.value?.removeEventListener("scroll", handleScroll);
  if (resizeObserver) resizeObserver();
});
</script>

<style scoped>
.no-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
