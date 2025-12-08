<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useContractorHQPrototype } from "@/stores/contractorHQPrototype";

const route = useRoute();
const hq = useContractorHQPrototype();

/* -----------------------------------------------
   1. Decode payload coming from SmartProposal Builder
------------------------------------------------ */
let decoded: any = null;

try {
  if (route.query.payload) {
    decoded = JSON.parse(decodeURIComponent(String(route.query.payload)));
  }
} catch (e) {
  console.warn("Invalid payload:", e);
}

/* -----------------------------------------------
   2. Fallback demo proposal (if URL accessed directly)
------------------------------------------------ */
const fallback = {
  client: { name: "Sarah Thompson" },
  project: "Maple St Deck",
  address: "482 Maple St, Seattle, WA",
  options: {
    good: {
      label: "Good",
      subtitle: "Essential comfort",
      price: 18600,
      highlights: ["Composite surface", "Standard railing"],
      image: "/proposal-demo/deck1.jpg",
    },
    better: {
      label: "Better",
      subtitle: "Premium comfort",
      price: 23800,
      highlights: ["Composite surface", "Aluminum rails"],
      image: "/proposal-demo/deck2.jpg",
    },
    best: {
      label: "Best",
      subtitle: "Luxury + longevity",
      price: 31800,
      highlights: ["Premium composite surface", "Glass railing"],
      image: "/proposal-demo/deck3.jpg",
    },
  },
  depositPercent: 15,
};

/* -----------------------------------------------
   3. Merge payload + fallback
------------------------------------------------ */
const data = decoded?.proposal || fallback;
const selected = ref((decoded?.primary as string) || "better");

/* -----------------------------------------------
   4. Helpers
------------------------------------------------ */
const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const safeImage = (src?: string) =>
  src && typeof src === "string"
    ? src
    : "/img/placeholders/proposal-placeholder.jpg";

const imageLoaded = ref<Record<string, boolean>>({});

const optionList = computed(() => [
  { key: "good", ...data.options.good },
  { key: "better", ...data.options.better },
  { key: "best", ...data.options.best },
]);

const current = computed(() =>
  optionList.value.find((o) => o.key === selected.value)
);

const depositAmount = computed(() =>
  Math.round((current.value.price * (decoded?.proposal?.deposit?.percent ?? 15)) / 100)
);

const markImageLoaded = (key: string) => {
  window.setTimeout(() => {
    imageLoaded.value = { ...imageLoaded.value, [key]: true };
  }, 150);
};

const approveSelection = () => {
  const chosen = current.value;
  if (!chosen) return;

  hq.addTimelineEvent("job-maple", `Client selected: ${chosen.label}`);
  hq.addSystemMessage("job-maple", `Client approved the ${chosen.label} option.`);
  alert(`Approved: ${chosen.label}`);
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <!-- HEADER -->
    <header class="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <p class="text-xs font-semibold tracking-wide text-slate-500 uppercase">
        Proposal for {{ data.client?.name ?? "Client" }}
      </p>
      <h1 class="text-2xl font-bold mt-1">Your project proposal</h1>

      <div class="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex items-center justify-between">
        <div>
          <p class="text-sm font-semibold text-slate-900">{{ data.project }}</p>
          <p class="text-sm text-slate-500">{{ data.address }}</p>
          <p class="text-[11px] text-slate-500 mt-1">
            You'll pay nothing until you pick an option.
          </p>
        </div>

        <span class="rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-semibold border border-blue-200 shadow-inner">
          Prototype Only
        </span>
      </div>
    </header>

    <!-- MAIN LAYOUT -->
    <div class="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-4 gap-6 px-4 pb-12 sm:px-6 lg:px-8">
      
      <!-- OPTION CARDS -->
      <div class="lg:col-span-3 flex flex-col gap-6">

        <transition name="select-fade-scale" v-for="opt in optionList" :key="opt.key">
          <div
            v-if="true"
            class="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden"
            :class="selected === opt.key ? 'ring-2 ring-emerald-400' : ''"
          >
            <div class="flex justify-between items-center px-5 pt-4">
              <div>
                <p class="text-xs uppercase font-semibold text-slate-500">{{ opt.label }}</p>
                <h2 class="font-bold text-xl text-slate-900 leading-tight">{{ opt.subtitle }}</h2>
              </div>
              <p class="text-xl font-bold text-slate-900">
                {{ formatCurrency(opt.price) }}
              </p>
            </div>

            <div class="relative mt-3 h-60 overflow-hidden bg-slate-100">
              <div
                v-if="!imageLoaded[opt.key]"
                class="absolute inset-0 image-shimmer"
                aria-hidden="true"
              ></div>
              <img
                :src="safeImage(opt.image)"
                class="w-full h-60 object-cover transition-all duration-300"
                :class="selected === opt.key ? 'scale-[1.02]' : 'scale-[1]'"
                @load="markImageLoaded(opt.key)"
              />
            </div>

            <div class="p-5 space-y-3">
              <p class="text-xs font-semibold uppercase text-slate-500">Highlights</p>

              <ul class="space-y-1 text-sm text-slate-700">
                <li
                  v-for="h in opt.highlights"
                  :key="h"
                  class="flex items-center gap-2"
                >
                  <span class="text-emerald-500">✓</span>
                  <span>{{ h }}</span>
                </li>
              </ul>

              <button
                class="mt-4 w-full rounded-full border border-emerald-300 bg-emerald-50 py-2 text-emerald-700 font-semibold text-sm hover:bg-emerald-100 transition"
                @click="selected = opt.key"
              >
                Choose {{ opt.label }}
              </button>
            </div>
          </div>
        </transition>

      </div>

      <!-- SUMMARY PANEL -->
      <aside
        class="order-first lg:order-last lg:col-span-1 sticky top-6 h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-md"
      >
        <p class="text-xs uppercase tracking-wide font-semibold text-slate-500">
          Your selection
        </p>

        <h2 class="text-lg font-bold mt-1">{{ current.label }}</h2>
        <p class="text-sm text-slate-600">{{ current.subtitle }}</p>

        <p class="mt-3 text-3xl font-bold text-slate-900">
          {{ formatCurrency(current.price) }}
        </p>

        <div class="mt-4 pb-4 border-b border-slate-200">
          <p class="text-sm font-semibold text-slate-800">Deposit</p>
          <p class="text-sm text-slate-600">
            {{ decoded?.proposal?.deposit?.percent ?? 15 }}% (approx.)
          </p>
          <p class="mt-1 text-emerald-600 font-semibold">
            {{ formatCurrency(depositAmount) }} due at approval
          </p>
        </div>

        <button
          class="w-full mt-5 rounded-full bg-emerald-600 text-white font-semibold py-2 text-sm shadow hover:bg-emerald-700 transition"
          @click="approveSelection"
        >
          Approve this option
        </button>

        <button
          class="w-full mt-3 rounded-full border border-slate-300 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          Ask a question
        </button>

        <p class="mt-3 text-[11px] text-slate-500 leading-snug">
          Nothing is final until you sign. Approving here just tells your contractor which option you like.
        </p>
      </aside>
    </div>
  </div>
</template>

<style scoped>
:root {
  --transition-fast: 150ms ease;
}
.ring-emerald-400 {
  transition: var(--transition-fast);
}
.select-fade-scale-enter-active,
.select-fade-scale-leave-active {
  transition: all 180ms ease;
}
.select-fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.96);
}
.select-fade-scale-enter-to {
  opacity: 1;
  transform: scale(1);
}
.image-shimmer {
  background: linear-gradient(90deg, rgba(226, 232, 240, 0.8) 25%, rgba(241, 245, 249, 1) 50%, rgba(226, 232, 240, 0.8) 75%);
  background-size: 200% 100%;
  animation: shimmer 1s ease infinite;
}
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
