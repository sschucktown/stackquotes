<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import SignaturePad from "signature_pad";
import { CheckIcon } from "@heroicons/vue/24/outline";
import ProposalCard from "./ProposalCard.vue";
import SummaryPanel from "./SummaryPanel.vue";
import StickyTrimSelector from "./StickyTrimSelector.vue";
import AskQuestionModal from "./AskQuestionModal.vue";
import { useContractorHQPrototype } from "@/stores/contractorHQPrototype";
import { usePrototypePaymentStore } from "@/stores/prototypePaymentStore";

const route = useRoute();
const router = useRouter();
const hq = useContractorHQPrototype();
const paymentStore = usePrototypePaymentStore();
const JOB_ID = "job-maple";
const paymentIds = [JOB_ID, "p-001"];

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

const data = decoded?.proposal || fallback;
const selected = ref<string>((decoded?.primary as string) || "better");

// Proposal id for persistence (if this view is attached to a real proposal)
const proposalId = computed<string | null>(() => {
  const fromQuery = typeof route.query.proposalId === "string" ? route.query.proposalId : null;
  const fromPayload = typeof decoded?.proposal?.id === "string" ? decoded.proposal.id : null;
  return fromQuery ?? fromPayload ?? null;
});

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const safeImage = (src?: string) => (src && typeof src === "string" ? src : "");

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

// Signature + approval flow
const signatureOpen = ref(false);
const successOpen = ref(false);
const signaturePad = ref<SignaturePad | null>(null);
const signatureCanvas = ref<HTMLCanvasElement | null>(null);
const signatureEmpty = ref(true);
let toastTimer: number | null = null;
const questionOpen = ref(false);
const paymentOpen = ref(false);
const paymentProcessing = ref(false);
const paymentSuccess = ref(false);
const questionOptionLabel = computed(() => current.value?.label || "An option");

const showToast = (message: string) => {
  successOpen.value = true;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    successOpen.value = false;
  }, 2200);
  console.info("[SmartProposal] Toast:", message);
};

function openSignature() {
  signatureOpen.value = true;
  nextTick(() => {
    if (signatureCanvas.value) {
      signaturePad.value = new SignaturePad(signatureCanvas.value, {
        backgroundColor: "white",
        penColor: "black",
      });
      signaturePad.value.onBegin = () => {
        signatureEmpty.value = false;
      };
      signaturePad.value.onEnd = () => {
        signatureEmpty.value = signaturePad.value?.isEmpty() ?? true;
      };
    }
  });
}

function clearSignature() {
  signaturePad.value?.clear();
  signatureEmpty.value = true;
}

async function finalizeSignature() {
  if (!signaturePad.value || signaturePad.value.isEmpty()) {
    alert("Please provide a signature.");
    return;
  }

  // Capture signature as data URL
  const signatureData = signaturePad.value.toDataURL("image/png");

  // If we have a real proposal id, persist to backend
  if (proposalId.value) {
    try {
      const res = await fetch("/api/proposals/sign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proposalId: proposalId.value,
          optionKey: selected.value,
          signatureData,
        }),
      });

      if (!res.ok) {
        console.error("[SmartProposal] /api/proposals/sign failed", res.status);
        // Non-blocking: still continue prototype behavior
      } else {
        console.info("[SmartProposal] Signature persisted for proposal", proposalId.value);
      }
    } catch (err) {
      console.error("[SmartProposal] Error calling /api/proposals/sign", err);
      // Non-blocking: still continue prototype behavior
    }
  } else {
    console.info("[SmartProposal] No proposalId found; running in prototype-only mode.");
  }

  // Prototype: still notify HQ store so the rest of the prototype flow works
  hq.addProposalApprovalEvent(JOB_ID, selected.value);

  signatureOpen.value = false;
  signatureEmpty.value = true;
  showToast("Approval captured");

  setTimeout(() => {
    paymentProcessing.value = false;
    paymentSuccess.value = false;
    paymentOpen.value = true;
  }, 600);
}

onBeforeUnmount(() => {
  if (toastTimer) clearTimeout(toastTimer);
});

const handleQuestionClick = () => {
  questionOpen.value = true;
};

const handleQuestionSubmit = (text: string) => {
  if (!text?.trim()) return;
  showToast("Question sent");
};

const proceedToSuccess = (paid: boolean) => {
  paymentOpen.value = false;
  paymentProcessing.value = false;
  paymentSuccess.value = false;
  router.push({
    path: "/prototype/smartproposal/signed",
    query: { option: selected.value, paid: paid ? "1" : "0" },
  });
};

const handlePayLater = () => {
  paymentStore.markPaid(paymentIds, false);
  proceedToSuccess(false);
};

const handlePayNow = () => {
  paymentProcessing.value = true;
  paymentStore.markPaid(paymentIds, true);
  setTimeout(() => {
    paymentProcessing.value = false;
    paymentSuccess.value = true;
    setTimeout(() => proceedToSuccess(true), 800);
  }, 650);
};
</script>

<template>
  <div class="relative min-h-screen bg-slate-50 text-slate-900">
    <StickyTrimSelector
      :show="showTrimSelector"
      :active="selected"
      @select="scrollToTrim"
    />

    <header class="mx-auto max-w-6xl px-6 pb-4 pt-8 lg:px-8">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Proposal for {{ data.client?.name ?? "Client" }}
          </p>
          <h1 class="mt-1 text-2xl font-bold text-slate-900">Pick what feels right</h1>
          <p class="mt-1 text-sm text-slate-600">{{ data.project }} · {{ data.address }}</p>
        </div>
        <div class="flex items-center gap-3">
          <span
            class="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-inner"
          >
            Prototype only
          </span>
          <button
            class="text-xs font-semibold text-blue-600 underline-offset-4 transition-all duration-200 ease-out hover:underline"
            type="button"
            @click="router.push('/prototype/smartproposal/builder')"
          >
            Back to builder
          </button>
        </div>
      </div>
      <div class="mt-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-5">
        <p class="text-sm font-semibold text-slate-900">3 clear options with no pressure</p>
        <p class="text-[13px] text-slate-600">
          Review the scopes below. Approve when you're ready to move forward.
        </p>
      </div>
    </header>

    <div
      class="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-6 pb-14 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-8 lg:px-8"
    >
      <div class="grid gap-5 lg:grid-cols-3">
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
        @question="handleQuestionClick"
      />
    </div>

    <Transition name="fade">
      <div
        v-if="signatureOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm px-4"
      >
        <div class="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-xl">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">Approve &amp; sign</h2>
              <p class="text-sm text-slate-600">Your signature confirms you're ready to move forward.</p>
            </div>
            <button
              class="rounded-full p-1 text-slate-400 transition-all duration-200 ease-out hover:bg-slate-100 hover:text-slate-600"
              @click="signatureOpen = false"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <div class="relative mt-4 overflow-hidden rounded-lg border border-slate-300">
            <canvas ref="signatureCanvas" class="h-48 w-full bg-white"></canvas>
            <div
              v-if="signatureEmpty"
              class="pointer-events-none absolute inset-0 flex items-center justify-center text-sm font-medium text-slate-300"
            >
              Sign here
            </div>
          </div>
          <div class="mt-4 flex items-center justify-between gap-3">
            <button
              class="rounded-lg border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-200 ease-out hover:bg-slate-200"
              @click="clearSignature"
            >
              Clear
            </button>
            <div class="flex gap-2">
              <button
                class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition-all duration-200 ease-out hover:bg-slate-50"
                @click="signatureOpen = false"
              >
                Cancel
              </button>
              <button
                class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 ease-out hover:bg-emerald-700"
                @click="finalizeSignature"
              >
                Finalize Approval
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div
        v-if="paymentOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm px-4"
      >
        <div class="w-full max-w-lg rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-2xl">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Payment</p>
              <h2 class="text-xl font-semibold text-slate-900">Secure your project with a deposit</h2>
              <p class="text-sm text-slate-600">Prototype only. No real charges are processed.</p>
            </div>
            <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Preview</span>
          </div>

          <div class="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Option</p>
                <p class="text-sm font-semibold text-slate-900">{{ current?.label || "Selected option" }}</p>
              </div>
              <p class="text-lg font-bold text-slate-900">{{ formatCurrency(current?.price || 0) }}</p>
            </div>
            <div class="flex items-center justify-between rounded-lg border border-emerald-100 bg-white px-3 py-2">
              <div>
                <p class="text-[11px] font-semibold uppercase tracking-[0.08em] text-emerald-700">Deposit</p>
                <p class="text-sm text-slate-700">{{ depositPercent }}% of total</p>
              </div>
              <p class="text-lg font-semibold text-emerald-700">{{ formatCurrency(depositAmount) }}</p>
            </div>
          </div>

          <div
            v-if="paymentSuccess"
            class="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700"
          >
            <CheckIcon class="h-5 w-5" />
            <span>Payment successful. Redirecting...</span>
          </div>

          <div class="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              class="inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              :disabled="paymentProcessing || paymentSuccess"
              @click="handlePayNow"
            >
              <span v-if="paymentProcessing">Processing...</span>
              <span v-else>Pay deposit now</span>
            </button>
            <button
              type="button"
              class="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              :disabled="paymentProcessing"
              @click="handlePayLater"
            >
              I'll pay later
            </button>
          </div>
          <p class="mt-2 text-[11px] text-slate-500">
            We'll mark the deposit as paid/unpaid inside your project tracker for the prototype views.
          </p>
        </div>
      </div>
    </Transition>

    <Transition name="fade">
      <div
        v-if="successOpen"
        class="fixed inset-x-0 top-4 z-50 mx-auto flex max-w-sm items-center gap-3 rounded-xl border border-emerald-200 bg-white/95 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-lg backdrop-blur"
      >
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckIcon class="h-4 w-4" />
        </div>
        <div class="flex-1">
          <p class="leading-tight">Approval captured</p>
          <p class="text-[12px] font-normal text-emerald-700/80">Redirecting to confirmation...</p>
        </div>
      </div>
    </Transition>

    <AskQuestionModal
      :open="questionOpen"
      :option-label="questionOptionLabel"
      :on-close="() => (questionOpen.value = false)"
      :on-submit="(text: string) => handleQuestionSubmit(text)"
    />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
