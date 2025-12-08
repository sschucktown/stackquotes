<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import OptionCard from "./OptionCard.vue";
import SummarySection from "./SummarySection.vue";
import UpgradeDrawer from "./UpgradeDrawer.vue";
import { useSmartProposalPrototype, type OptionKey } from "@/stores/smartProposalPrototype";
import { useQuickQuotePrototype } from "@/stores/quickQuotePrototype";
import { useContractorHQPrototype } from "@/stores/contractorHQPrototype";
import { useProposalPrototype } from "@/stores/proposalPrototype";

const route = useRoute();
const router = useRouter();
const {
  state,
  applyUpgrade,
  autoGenerateSummary,
  setDepositMode,
  setDepositPercent,
  setDepositFlat,
  depositPreview,
  hydrateFromQuickQuote,
} = useSmartProposalPrototype();
const { exportForProposal } = useQuickQuotePrototype();
const hqStore = useContractorHQPrototype();
const proposalStore = useProposalPrototype();

const isImportingFromQuickQuote = ref(false);
const showImportOverlay = ref(false);
const importStep = ref(1);
const highlightOptions = ref(false);
const showImportBanner = ref(false);
const timers: number[] = [];
const overlayStorageKey = "stackquotes:smartproposal:imported";

const editNotesOpen = ref(false);
const tempNotes = ref(state.visitNotes);

const drawerOpen = ref(false);
const drawerOption = ref<OptionKey | null>(null);

const summaryText = computed(() => state.summary.text);

const openDrawer = (option: OptionKey) => {
  drawerOption.value = option;
  drawerOpen.value = true;
};

const closeDrawer = () => {
  drawerOpen.value = false;
};

const handleToggleUpgrade = (payload: { option: OptionKey; id: string; value: boolean }) => {
  applyUpgrade(payload.option, payload.id, payload.value);
};

const handleSummaryUpdate = (value: string) => {
  state.summary.text = value;
  state.summary.manual = true;
};

const regenerateSummary = () => {
  if (!state.summary.manual) {
    autoGenerateSummary();
  }
};

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const previewClientView = () => {
  router.push({
    path: "/prototype/smartproposal/client",
    query: { option: "better" },
  });
};

const saveDraft = () => {
  handleSaveDraft();
};

const sendProposal = () => {
  console.log("[SmartProposal] send proposal prototype", state);
};

const runImportAnimation = () => {
  isImportingFromQuickQuote.value = true;
  showImportOverlay.value = true;
  importStep.value = 1;
  timers.push(
    window.setTimeout(() => {
      importStep.value = 2;
    }, 550)
  );
  timers.push(
    window.setTimeout(() => {
      importStep.value = 3;
    }, 1150)
  );
  timers.push(
    window.setTimeout(() => {
      showImportOverlay.value = false;
      showImportBanner.value = true;
      highlightOptions.value = true;
      timers.push(
        window.setTimeout(() => {
          highlightOptions.value = false;
        }, 1200)
      );
    }, 1850)
  );
};

onMounted(() => {
  const fromQuickQuote = route.query.from === "quickquote";
  const hasSeenOverlay = (() => {
    try {
      return sessionStorage.getItem(overlayStorageKey) === "1";
    } catch {
      return false;
    }
  })();

  if (fromQuickQuote) {
    const payload = exportForProposal?.();
    hydrateFromQuickQuote?.(payload);
    showImportBanner.value = true;
    if (!hasSeenOverlay) {
      runImportAnimation();
      try {
        sessionStorage.setItem(overlayStorageKey, "1");
      } catch {
        // ignore
      }
    } else {
      highlightOptions.value = true;
      timers.push(
        window.setTimeout(() => {
          highlightOptions.value = false;
        }, 900)
      );
    }
  } else if (state.hasImportedFromQuickQuote) {
    showImportBanner.value = true;
  }
});

onBeforeUnmount(() => {
  timers.forEach((id) => clearTimeout(id));
});

const buildSmartProposalPayload = () => {
  const job = hqStore.getJob(typeof route.query.job === "string" ? route.query.job : undefined);
  const options = {
    good: {
      label: state.options.good.label,
      price: state.options.good.price,
      scope: state.options.good.scope,
    },
    better: {
      label: state.options.better.label,
      price: state.options.better.price,
      scope: state.options.better.scope,
    },
    best: {
      label: state.options.best.label,
      price: state.options.best.price,
      scope: state.options.best.scope,
    },
  };

  return {
    jobId: job?.id ?? "job-maple",
    jobName: job?.name ?? "Maple St Deck",
    lead: state.importMeta?.lead ?? {},
    scope: state.baseScope,
    options,
    totals: {
      low: options.good.price,
      high: options.best.price,
      total: options.better.price,
    },
    deposit: {
      mode: state.deposit.mode,
      amount: depositPreview.value,
    },
  };
};

function handleSaveDraft() {
  const exportData = buildSmartProposalPayload();
  proposalStore.createDraftFromSmartProposal(exportData);
  hqStore.attachProposalDraft(exportData.jobId, proposalStore.draft);
  hqStore.addTimelineEvent(exportData.jobId, "Proposal Draft Created");
  hqStore.addSystemMessage(exportData.jobId, `Your proposal draft for ${exportData.jobName} is ready to send.`);
  hqStore.addHQAlert(`Proposal draft created for ${exportData.jobName}`);
  router.push("/prototype/hq");
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <div class="mx-auto flex max-w-5xl flex-col gap-4 px-4 pb-28 pt-6 sm:px-6 lg:px-8">
      <div class="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-600">
        <span class="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
        <span>Simple Mode is on. Advanced pricing tools are hidden to keep things easy.</span>
      </div>
      <header class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 shadow-inner transition hover:bg-slate-200"
              @click="router.push('/prototype/hq')"
            >
              <span class="text-lg leading-none">&larr;</span>
              <span>Back</span>
            </button>
            <div class="flex flex-col">
              <p class="text-lg font-semibold text-slate-900">SmartProposal Builder</p>
              <p class="text-sm text-slate-500">We set everything up. You keep it simple.</p>
            </div>
          </div>
          <span class="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-inner">
            Prototype only
          </span>
        </div>
      </header>
      <Transition name="fade-slide-down">
        <div
          v-if="showImportBanner"
          class="mb-1 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] text-slate-600 shadow-sm"
        >
          <span class="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          <span>We imported this from your QuickQuote. You don't need to redo anything.</span>
        </div>
      </Transition>

      <section class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-sm font-semibold text-slate-800 uppercase tracking-wide">1. Confirm details</h2>
            <p class="text-xs text-slate-500">We pulled this in from your visit so you don't have to retype anything.</p>
          </div>
          <button
            type="button"
            class="text-xs font-semibold text-blue-600 underline-offset-4 hover:underline"
            @click="
              tempNotes = state.visitNotes;
              editNotesOpen = true;
            "
          >
            Edit notes
          </button>
        </div>
        <div class="mt-3 grid gap-4 sm:grid-cols-2">
          <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm shadow-inner">
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Visit notes</p>
            <p class="text-sm text-slate-800">{{ state.visitNotes }}</p>
          </div>
          <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm shadow-inner">
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Base scope</p>
            <ul class="mt-2 space-y-1 text-sm text-slate-800">
              <li v-for="item in state.baseScope" :key="item" class="flex items-start gap-2">
                <span class="mt-1 h-1.5 w-1.5 rounded-full bg-slate-300"></span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-sm font-semibold text-slate-800 uppercase tracking-wide">2. Review your options</h2>
            <p class="text-xs text-slate-500">Good, Better, Best are auto-built for you. You can tweak, but you don't have to.</p>
          </div>
          <div class="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
            <span class="text-[11px] uppercase tracking-[0.08em] text-slate-500">Preview option</span>
            <div class="flex items-center gap-1">
              <span class="rounded-full px-2 py-0.5 capitalize" :class="['good'].includes('good') ? 'bg-slate-100 text-slate-700' : ''">Good</span>
              <span class="rounded-full px-2 py-0.5 capitalize" :class="['better'].includes('better') ? 'bg-slate-100 text-slate-700' : ''">Better</span>
              <span class="rounded-full px-2 py-0.5 capitalize" :class="['best'].includes('best') ? 'bg-slate-100 text-slate-700' : ''">Best</span>
            </div>
          </div>
        </div>
        <div
          class="mt-4 grid gap-4 rounded-xl lg:grid-cols-3"
          :class="highlightOptions ? 'ring-2 ring-emerald-200 ring-offset-2 ring-offset-slate-50 transition' : ''"
        >
          <OptionCard
            option-key="good"
            :label="state.options.good.label"
            :subtitle="state.options.good.subtitle"
            :price="state.options.good.price"
            :confidence="state.options.good.confidence"
            :scope="state.options.good.scope"
            @customize="openDrawer('good')"
          />
          <OptionCard
            option-key="better"
            :label="state.options.better.label"
            :subtitle="state.options.better.subtitle"
            :price="state.options.better.price"
            :confidence="state.options.better.confidence"
            :scope="state.options.better.scope"
            @customize="openDrawer('better')"
          />
          <OptionCard
            option-key="best"
            :label="state.options.best.label"
            :subtitle="state.options.best.subtitle"
            :price="state.options.best.price"
            :confidence="state.options.best.confidence"
            :scope="state.options.best.scope"
            @customize="openDrawer('best')"
          />
        </div>
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
        <h2 class="text-sm font-semibold text-slate-800 uppercase tracking-wide">3. Client copy</h2>
        <p class="text-xs text-slate-500">This is what your client will read. We'll keep it updated unless you change it.</p>
        <SummarySection
          :summary="summaryText"
          :manual="state.summary.manual"
          @update:summary="handleSummaryUpdate"
          @regenerate="regenerateSummary"
        />
      </section>

      <section class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-sm font-semibold text-slate-800 uppercase tracking-wide">4. Deposit preview</h2>
            <p class="text-xs text-slate-500">Clients only see the final number here. You can adjust the approach anytime.</p>
            <p class="text-sm text-slate-600">
              Client sees {{ state.deposit.mode === "percent" ? state.deposit.percent + "%" : state.deposit.mode === "flat" ? formatCurrency(state.deposit.flat) : "no" }}
              (~{{ formatCurrency(depositPreview) }}) due at approval.
            </p>
            <p class="text-xs text-slate-500">
              You're just picking how you like to structure deposits. Clients will only see the final number.
            </p>
            <p v-if="state.deposit.mode === 'percent'" class="text-xs text-slate-500">
              {{ state.deposit.percent }}% of Better is about {{ formatCurrency(depositPreview) }}.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <select
              v-model="state.deposit.mode"
              class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-slate-300 focus:bg-white"
              @change="setDepositMode(state.deposit.mode)"
            >
              <option value="percent">Percent of option</option>
              <option value="flat">Flat amount</option>
              <option value="none">No deposit</option>
            </select>
            <input
              v-if="state.deposit.mode === 'percent'"
              v-model.number="state.deposit.percent"
              type="number"
              min="0"
              class="w-20 rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-sm text-slate-800 outline-none focus:border-slate-300 focus:bg-white"
              @input="setDepositPercent(state.deposit.percent)"
            />
            <input
              v-else-if="state.deposit.mode === 'flat'"
              v-model.number="state.deposit.flat"
              type="number"
              min="0"
              class="w-28 rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-sm text-slate-800 outline-none focus:border-slate-300 focus:bg-white"
              @input="setDepositFlat(state.deposit.flat)"
            />
          </div>
        </div>
      </section>

      <p class="text-[11px] text-slate-500">
        Everything autosaves. You can't break the math or send anything by accident.
      </p>
    </div>

    <footer class="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-4px_14px_rgba(15,23,42,0.06)] backdrop-blur sm:px-6 lg:px-8">
      <div class="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          @click="saveDraft"
        >
          Save Draft
        </button>
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-full border border-blue-200 bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700"
          @click="previewClientView"
        >
          Preview Client View
        </button>
        <button
          type="button"
          class="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100"
          @click="sendProposal"
        >
          Send Proposal
        </button>
      </div>
      <p class="mt-2 text-center text-[11px] text-slate-500">
        You'll confirm the client and message before anything goes out.
      </p>
    </footer>

    <UpgradeDrawer
      :open="drawerOpen"
      :option-key="drawerOption"
      :option-label="drawerOption ? state.options[drawerOption].label : ''"
      :upgrades="drawerOption ? state.options[drawerOption].upgrades : []"
      :price="drawerOption ? state.options[drawerOption].price : 0"
      @close="closeDrawer"
      @toggle="handleToggleUpgrade"
    />

    <Transition name="fade">
      <div
        v-if="showImportOverlay"
        class="fixed inset-0 z-40 flex items-center justify-center bg-white/80 backdrop-blur"
      >
        <div class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
          <p class="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Building your SmartProposal</p>
          <h2 class="mb-4 text-lg font-semibold text-slate-900">Turning your QuickQuote into a full proposal...</h2>
          <ol class="space-y-3 text-sm text-slate-700">
            <li class="flex items-center gap-2">
              <span class="h-5 w-5 rounded-full" :class="importStep >= 1 ? 'bg-emerald-500' : 'bg-slate-200'"></span>
              <span>Pulling in your QuickQuote numbers</span>
            </li>
            <li class="flex items-center gap-2">
              <span class="h-5 w-5 rounded-full" :class="importStep >= 2 ? 'bg-emerald-500' : 'bg-slate-200'"></span>
              <span>Building Good / Better / Best options</span>
            </li>
            <li class="flex items-center gap-2">
              <span class="h-5 w-5 rounded-full" :class="importStep >= 3 ? 'bg-emerald-500' : 'bg-slate-200'"></span>
              <span>Writing client-friendly summary</span>
            </li>
          </ol>
          <p class="mt-4 text-xs text-slate-500">This is a prototype. We're just simulating the magic.</p>
        </div>
      </div>
    </Transition>

    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="editNotesOpen" class="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 px-4">
        <div class="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Edit visit notes</p>
              <p class="text-sm text-slate-600">Keep it concise for the client.</p>
            </div>
            <button
              type="button"
              class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              @click="editNotesOpen = false"
            >
              Close
            </button>
          </div>
          <textarea
            v-model="tempNotes"
            class="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-300 focus:bg-white"
            rows="4"
          />
          <div class="mt-3 flex justify-end gap-2">
            <button
              type="button"
              class="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              @click="editNotesOpen = false"
            >
              Cancel
            </button>
            <button
              type="button"
              class="rounded-full border border-blue-200 bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
              @click="
                state.visitNotes = tempNotes;
                editNotesOpen = false;
              "
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-slide-down-enter-active,
.fade-slide-down-leave-active {
  transition: all 0.18s ease-out;
}
.fade-slide-down-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}
.fade-slide-down-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.fade-slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.fade-slide-down-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
