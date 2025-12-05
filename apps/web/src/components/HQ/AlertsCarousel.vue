<template>
  <div class="relative">
    <!-- Left Arrow -->
    <button
      v-show="canScrollLeft"
      type="button"
      class="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 backdrop-blur-sm text-slate-700 shadow-sm transition-opacity duration-300 hover:bg-white"
      :class="canScrollLeft ? 'opacity-100' : 'opacity-0'"
      @click="scrollBy(-280)"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="m15 18-6-6 6-6" />
      </svg>
    </button>

    <!-- Right Arrow -->
    <button
      v-show="canScrollRight"
      type="button"
      class="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/70 backdrop-blur-sm text-slate-700 shadow-sm transition-opacity duration-300 hover:bg-white"
      :class="canScrollRight ? 'opacity-100' : 'opacity-0'"
      @click="scrollBy(280)"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="m9 6 6 6-6 6" />
      </svg>
    </button>

    <!-- Gradients -->
    <div
      v-show="canScrollLeft"
      class="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white via-white/80 to-transparent transition-opacity duration-300"
      :class="canScrollLeft ? 'opacity-100' : 'opacity-0'"
    />
    <div
      v-show="canScrollRight"
      class="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white via-white/80 to-transparent transition-opacity duration-300"
      :class="canScrollRight ? 'opacity-100' : 'opacity-0'"
    />

    <!-- Scroll Container -->
    <div
      ref="scrollEl"
      class="flex gap-3 overflow-x-auto pb-1 pr-6 no-scrollbar"
      @scroll="handleScroll"
    >
      <HQAlertCard v-for="alert in alerts" :key="alert.title" :alert="alert" />
    </div>
  </div>
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

const updateScrollState = () => {
  const el = scrollEl.value;
  if (!el) return;
  const { scrollLeft, scrollWidth, clientWidth } = el;
  canScrollLeft.value = scrollLeft > 0;
  canScrollRight.value = scrollLeft + clientWidth < scrollWidth - 1;
};

const handleScroll = () => {
  updateScrollState();
};

const scrollBy = (left: number) => {
  scrollEl.value?.scrollBy({ left, behavior: "smooth" });
};

onMounted(async () => {
  await nextTick();
  updateScrollState();
  scrollEl.value?.addEventListener("scroll", handleScroll, { passive: true });
});

onBeforeUnmount(() => {
  scrollEl.value?.removeEventListener("scroll", handleScroll);
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
