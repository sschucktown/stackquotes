<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import SignaturePad from "signature_pad";
import ProposalCard from "./ProposalCard.vue";
import SummaryPanel from "./SummaryPanel.vue";
import StickyTrimSelector from "./StickyTrimSelector.vue";
import { useContractorHQPrototype } from "@/stores/contractorHQPrototype";

const route = useRoute();
const hq = useContractorHQPrototype();

// Decode payload with fallback
let decoded: any = null;
try {
  if (route.query.payload) decoded = JSON.parse(decodeURIComponent(String(route.query.payload)));
} catch (e) {
  console.warn("Invalid payload:", e);
}

const fallback = {
  client: { name: "Sarah Thompson" },
  project: "Maple St Deck",
  address: "482 Maple St, Seattle, WA",
  options: {
    good: { label: "Good", subtitle: "Essential comfort", price: 18600, highlights: ["Composite surface", "Standard railing"], image: "/proposal-demo/deck1.jpg" },
    better: { label: "Better", subtitle: "Premium comfort", price: 23800, highlights: ["Composite surface", "Aluminum rails"], image: "/proposal-demo/deck2.jpg" },
    best: { label: "Best", subtitle: "Luxury + longevity", price: 31800, highlights: ["Premium composite surface", "Glass railing"], image: "/proposal-demo/deck3.jpg" },
  },
  depositPercent: 15,
};

const data = decoded?.proposal || fallback;
const selected = ref<string>((decoded?.primary as string) || "better");

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const safeImage = (src?: string) => (src && typeof src === "string" ? src : "/img/placeholders/proposal-placeholder.jpg");

const optionList = computed(() => [
  { key: "good", ...data.options.good },
  { key: "better", ...data.options.better },
  { key: "best", ...data.options.best },
]);

const current = computed(() => optionList.value.find((o) => o.key === selected.value));
const depositPercent = computed(() => decoded?.proposal?.deposit?.percent ?? decoded?.proposal?.depositPercent ?? 15);
const depositAmount = computed(() => Math.round((current.value?.price || 0) * (depositPercent.value / 100)));

// Sticky trim selector
const showTrimSelector = ref(false);
const handleScroll = () => {
  showTrimSelector.value = window.scrollY > 180;
};
onMounted(() => {
  window.addEventListener("scroll", handleScroll, { passive: true });
});
onBeforeUnmount(() => window.removeEventListener("scroll", handleScroll));

const scrollToTrim = (key: string) => {
  document.getElementById(`trim-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const chooseOption = (key: string) => {
  selected.value = key;
  scrollToTrim(key);
};

// Signature flow
const signatureOpen = ref(false);
const successOpen = ref(false);
const signaturePad = ref<SignaturePad | null>(null);
const signatureCanvas = ref<HTMLCanvasElement | null>(null);

function openSignature() {
  signatureOpen.value = true;
  nextTick(() => {
    if (signatureCanvas.value) {
      signaturePad.value = new SignaturePad(signatureCanvas.value, { backgroundColor: "white", penColor: "black" });
    }
  });
}
function clearSignature() {
  signaturePad.value?.clear();
}
function finalizeSignature() {
  if (!signaturePad.value || signaturePad.value.isEmpty()) {
    alert("Please provide a signature.");
    return;
  }
  signaturePad.value.toDataURL("image/png"); // prototype only
  hq.addTimelineEvent("job-maple", "Client signed and approved proposal.");
  hq.addSystemMessage("job-maple", "Client signature received. Visit next steps to schedule the job.");
  signatureOpen.value = false;
  successOpen.value = true;
}
</script>

<template>
  <div class="relative min-h-screen bg-slate-50 text-slate-900">
    <StickyTrimSelector
      :show="showTrimSelector"
      :active="selected"
      @select="scrollToTrim"
    />

    <header class="mx-auto max-w-6xl px-4 pb-4 pt-8 sm:px-6 lg:px-8">
      <p class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Proposal for {{ data.client?.name ?? "Client" }}</p>
      <h1 class="mt-1 text-2xl font-bold text-slate-900">Your project proposal</h1>
      <div class="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-5">
        <div>
          <p class="text-sm font-semibold text-slate-900">{{ data.project }}</p>
          <p class="text-sm text-slate-500">{{ data.address }}</p>
          <p class="mt-1 text-[11px] text-slate-500">You'll pay nothing until you pick an option.</p>
        </div>
        <span class="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-inner">Prototype Only</span>
      </div>
    </header>

    <div class="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-8 lg:px-8">
      <div class="grid gap-6 lg:grid-cols-3">
        <ProposalCard
          v-for="opt in optionList"
          :id="`trim-${opt.key}`"
          :key="opt.key"
          :option="opt"
          :selected="selected === opt.key"
          :currency="formatCurrency"
          :image-src="safeImage(opt.image)"
          @select="chooseOption(opt.key)"
        />
      </div>

      <SummaryPanel
        :selected="current"
        :deposit-percent="depositPercent"
        :deposit-amount="depositAmount"
        :currency="formatCurrency"
        @approve="openSignature"
        @question="() => {}"
      />
    </div>

    <Transition name="fade">
      <div v-if="signatureOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur px-4">
        <div class="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
          <h2 class="mb-2 text-lg font-semibold text-slate-900">Sign to Approve</h2>
          <p class="mb-3 text-sm text-slate-600">Your signature confirms you agree to move forward with this option.</p>
          <canvas ref="signatureCanvas" class="h-48 w-full rounded-xl border border-slate-300 bg-white"></canvas>
          <div class="mt-3 flex justify-between">
            <button class="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700" @click="clearSignature">Clear</button>
            <button class="rounded-full bg-emerald-600 px-4 py-1 text-sm font-semibold text-white shadow hover:bg-emerald-700" @click="finalizeSignature">
              Finalize Approval
            </button>
          </div>
          <button class="absolute right-4 top-4 text-slate-400 hover:text-slate-600" @click="signatureOpen = false">✕</button>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div v-if="successOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur px-4 text-center">
        <div class="flex w-full max-w-sm flex-col items-center gap-4">
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-slate-900">You're all set!</h2>
          <p class="text-sm text-slate-600">We've let your contractor know. They'll reach out with next steps.</p>
          <button class="mt-2 rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800" @click="successOpen = false">
            Close
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
