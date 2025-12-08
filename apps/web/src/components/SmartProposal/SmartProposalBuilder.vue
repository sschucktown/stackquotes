<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import OptionCard from "./OptionCard.vue";
import SummarySection from "./SummarySection.vue";
import UpgradeDrawer from "./UpgradeDrawer.vue";
import { useSmartProposalPrototype, type OptionKey } from "@/stores/smartProposalPrototype";
import { useQuickQuotePrototype } from "@/stores/quickQuotePrototype";

const router = useRouter();
const {
  state,
  applyUpgrade,
  autoGenerateSummary,
  setDepositMode,
  setDepositPercent,
  setDepositFlat,
  depositPreview,
} = useSmartProposalPrototype();
const { exportForProposal } = useQuickQuotePrototype();

const editNotesOpen = ref(false);
const tempNotes = ref(state.visitNotes);

const drawerOpen = ref(false);
const drawerOption = ref<OptionKey | null>(null);

const summaryText = computed(() => state.summary.text);

const proposal = reactive({
  lead: {
    name: "",
    email: "",
    phone: "",
    location: "",
    job: "",
  },
  scope: [] as string[],
  basePrice: 0,
  addOns: [] as unknown[],
  estimateLow: 0,
  estimateHigh: 0,
  estimateTotal: 0,
  depositMode: "none" as "none" | "flat" | "percent",
  depositConfig: {
    flat: 0,
    percent: 0,
  },
});

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

const quickQuoteRange = computed(() =>
  proposal.estimateLow && proposal.estimateHigh
    ? `${formatCurrency(proposal.estimateLow)} - ${formatCurrency(proposal.estimateHigh)}`
    : ""
);

const previewClientView = () => {
  router.push({
    path: "/prototype/smartproposal/client",
    query: { option: "better" },
  });
};

const saveDraft = () => {
  console.log("[SmartProposal] save draft prototype", state);
};

const sendProposal = () => {
  console.log("[SmartProposal] send proposal prototype", state);
};

onMounted(() => {
  const payload = exportForProposal?.();
  if (!payload) return;

  Object.assign(proposal.lead, {
    name: payload.lead?.name ?? "",
    email: payload.lead?.email ?? "",
    phone: payload.lead?.phone ?? "",
    location: payload.lead?.location ?? "",
    job: payload.lead?.jobType && payload.lead?.subtype ? `${payload.lead.jobType} - ${payload.lead.subtype}` : payload.lead?.jobType,
  });
  proposal.scope = [...(payload.scope || [])];
  proposal.basePrice = payload.basePrice || 0;
  proposal.addOns = payload.addOns || [];
  proposal.estimateLow = payload.lowEstimate || 0;
  proposal.estimateHigh = payload.highEstimate || 0;
  proposal.estimateTotal = payload.totalPrice || 0;
  proposal.depositMode = payload.depositMode || "none";
  proposal.depositConfig.flat = payload.flatDeposit || 0;
  proposal.depositConfig.percent = payload.percentDeposit || 0;

  if (proposal.scope.length) {
    state.baseScope = [...proposal.scope];
    (["good", "better", "best"] as OptionKey[]).forEach((key) => autoGenerateScopeSnapshot(key));
  }

  (["good", "better", "best"] as OptionKey[]).forEach((key) => {
    state.options[key].upgrades.forEach((upgrade) => {
      upgrade.active = false;
    });
  });

  if (proposal.estimateLow) {
    state.options.good.basePrice = proposal.estimateLow;
    state.options.good.price = proposal.estimateLow;
  }
  if (proposal.estimateTotal) {
    state.options.better.basePrice = proposal.estimateTotal;
    state.options.better.price = proposal.estimateTotal;
  }
  if (proposal.estimateHigh) {
    state.options.best.basePrice = proposal.estimateHigh;
    state.options.best.price = proposal.estimateHigh;
  }

  setDepositMode(proposal.depositMode as typeof state.deposit.mode);
  if (proposal.depositMode === "flat") {
    setDepositFlat(proposal.depositConfig.flat);
  } else if (proposal.depositMode === "percent") {
    setDepositPercent(proposal.depositConfig.percent);
  }
});
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

      <section class="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="text-sm font-semibold text-slate-800 uppercase tracking-wide">1. Confirm details</h2>
            <p class="text-xs text-slate-500">We pulled this in from your visit so you don’t have to retype anything.</p>
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
            <p class="text-xs text-slate-500">Good, Better, Best are auto-built for you. You can tweak, but you don’t have to.</p>
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
        <div class="mt-4 grid gap-4 lg:grid-cols-3">
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
        <p class="text-xs text-slate-500">This is what your client will read. We’ll keep it updated unless you change it.</p>
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
              You’re just picking how you like to structure deposits. Clients will only see the final number.
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
        Everything autosaves. You can’t break the math or send anything by accident.
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
        You’ll confirm the client and message before anything goes out.
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
