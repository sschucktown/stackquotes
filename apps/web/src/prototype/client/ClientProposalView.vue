<script setup lang="ts">
import { computed, reactive, ref, watch, onBeforeUnmount, onMounted } from "vue";
import OptionCard from "./components/OptionCard.vue";
import SidebarSelection from "./components/SidebarSelection.vue";
import StickyHeader from "./components/StickyHeader.vue";
import { optionsData, type ProposalOption, type Upgrade } from "./optionsData";

const selectedOptionId = ref<ProposalOption["id"]>("better");
const selectedUpgradesByOption = reactive<Record<string, Set<string>>>({});
const summaryDrawerOpen = ref(false);
const animatingPrice = ref(false);
const summaryRef = ref<HTMLElement | null>(null);
const showStickyHeader = ref(false);
const summaryGlow = ref(false);

const ensureDefaults = (option: ProposalOption) => {
  if (!selectedUpgradesByOption[option.id]) {
    selectedUpgradesByOption[option.id] = new Set();
  }
  option.upgrades.forEach((upgrade) => {
    if (upgrade.defaultOn) selectedUpgradesByOption[option.id].add(upgrade.id);
  });
};

optionsData.forEach((opt) => ensureDefaults(opt));

const selectedOption = computed<ProposalOption>(() => {
  return optionsData.find((opt) => opt.id === selectedOptionId.value) || optionsData[0];
});

const selectedUpgrades = computed<Upgrade[]>(() => {
  const set = selectedUpgradesByOption[selectedOption.value.id] || new Set<string>();
  return selectedOption.value.upgrades.filter((u) => set.has(u.id));
});

const optionTotal = (option: ProposalOption) => {
  const set = selectedUpgradesByOption[option.id] || new Set<string>();
  const upgrades = option.upgrades.filter((u) => set.has(u.id));
  return option.basePrice + upgrades.reduce((sum, u) => sum + (u.priceDelta || 0), 0);
};

const totalPrice = computed(() => optionTotal(selectedOption.value));
const todayDue = computed(() => Math.round(totalPrice.value * 0.2));
const atCompletion = computed(() => Math.max(0, totalPrice.value - todayDue.value));

watch(
  () => totalPrice.value,
  () => {
    animatingPrice.value = true;
    setTimeout(() => (animatingPrice.value = false), 180);
  }
);

const selectOption = (id: string) => {
  const target = optionsData.find((opt) => opt.id === id);
  if (!target) return;
  ensureDefaults(target);
  selectedOptionId.value = id;
  focusSummary();
};

const toggleUpgrade = (optionId: string, upgradeId: string) => {
  if (!selectedUpgradesByOption[optionId]) selectedUpgradesByOption[optionId] = new Set();
  const bucket = selectedUpgradesByOption[optionId];
  if (bucket.has(upgradeId)) bucket.delete(upgradeId);
  else bucket.add(upgradeId);
  animatingPrice.value = true;
  setTimeout(() => (animatingPrice.value = false), 180);
};

const approve = () => {
  console.log("[SmartProposal Client] Approve option", {
    option: selectedOption.value.label,
    total: totalPrice.value,
    upgrades: selectedUpgrades.value.map((u) => u.label),
  });
};

const askQuestion = () => {
  console.log("[SmartProposal Client] Ask question", {
    option: selectedOption.value.label,
  });
};

const selectedIds = computed(() => Array.from(selectedUpgradesByOption[selectedOption.value.id] || []));

const scrollHandler = () => {
  if (typeof window === "undefined") return;
  showStickyHeader.value = window.scrollY > 280;
};

onMounted(() => {
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", scrollHandler, { passive: true });
  }
});

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("scroll", scrollHandler);
  }
});

const focusSummary = () => {
  summaryGlow.value = true;
  if (summaryRef.value) {
    summaryRef.value.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  setTimeout(() => (summaryGlow.value = false), 600);
};
</script>

<template>
  <div class="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
    <StickyHeader
      :show="showStickyHeader"
      :option-label="selectedOption.label"
      :price="totalPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })"
      @approve="approve"
    />
    <div class="mx-auto w-full max-w-screen-2xl px-4 pb-32 pt-8 sm:px-6 lg:px-8 xl:px-10">
      <!-- Tesla-style responsive layout:
           - xl+: cards + fixed-width summary sidebar
           - lg (1024-1279): 2-column cards, summary below + mini sticky footer
           - <lg: stacked cards + mobile summary drawer -->
      <div class="grid gap-6 lg:gap-8 xl:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
        <div class="space-y-5">
          <header
            class="space-y-3 rounded-3xl border border-slate-200/70 bg-white/80 px-5 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur"
          >
            <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Proposal for Sarah Thompson</p>
            <h1 class="text-2xl font-semibold text-slate-900">Your Maple St Deck Proposal</h1>
            <p class="text-sm text-slate-600">Pick the option that fits best. You can always ask a question before approving.</p>
            <div class="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-600">
              <span class="rounded-full border border-slate-200 bg-slate-100 px-3 py-1">Tesla-style client portal</span>
              <span class="rounded-full border border-emerald-200/70 bg-emerald-50 px-3 py-1 text-emerald-700">Zero-pressure approval</span>
              <span class="rounded-full border border-blue-200/70 bg-blue-50 px-3 py-1 text-blue-700">Site visit: Tomorrow at 3:00 PM</span>
            </div>
          </header>

          <section class="rounded-3xl border border-slate-200 bg-white/90 px-5 py-5 shadow-[0_10px_35px_rgba(15,23,42,0.08)] sm:px-6 sm:py-6">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Project summary</p>
                <p class="text-sm font-semibold text-slate-900">Maple St Deck</p>
                <p class="text-sm text-slate-600">482 Maple St, Seattle, WA</p>
              </div>
              <div class="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                <span class="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-blue-700 shadow-inner">
                  Site visit scheduled - Tomorrow at 3:00 PM
                </span>
                <span class="rounded-full border border-slate-200 bg-white px-3 py-1 shadow-inner">Transparent pricing</span>
              </div>
            </div>
            <p class="mt-2 text-xs text-slate-500">You'll pay nothing until you pick an option.</p>
          </section>

          <section class="space-y-3">
            <div class="flex items-center justify-between">
              <p class="text-sm font-semibold text-slate-800 uppercase tracking-wide">Choose your option</p>
              <span class="text-xs text-slate-500">Good / Better / Best</span>
            </div>
            <div class="grid gap-6 lg:gap-8 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
              <OptionCard
                v-for="option in optionsData"
                :key="option.id"
                :option="option"
                :selected="selectedOptionId === option.id"
                :total-price="optionTotal(option)"
                :selected-upgrades="Array.from(selectedUpgradesByOption[option.id] || [])"
                @select="selectOption"
                @toggle-upgrade="(id) => toggleUpgrade(option.id, id)"
              />
            </div>
          </section>

          <!-- Inline summary for Desktop M (1024-1279) -->
          <div class="hidden lg:block xl:hidden">
            <SidebarSelection
              :option="selectedOption"
              :upgrades="selectedUpgrades"
              :total-price="totalPrice"
              :today-due="todayDue"
              :at-completion="atCompletion"
              :highlight="summaryGlow"
              @approve="approve"
              @question="askQuestion"
            />
          </div>

          <p class="hidden text-[11px] text-slate-400 lg:block">
            Prototype only. No real payments or approvals are processed here.
          </p>
        </div>

        <aside ref="summaryRef" class="hidden w-full min-w-[300px] max-w-[320px] xl:sticky xl:top-8 xl:block 2xl:max-w-[340px]">
          <SidebarSelection
            :option="selectedOption"
            :upgrades="selectedUpgrades"
            :total-price="totalPrice"
            :today-due="todayDue"
            :at-completion="atCompletion"
            :highlight="summaryGlow"
            @approve="approve"
            @question="askQuestion"
          />
        </aside>
      </div>
    </div>

    <!-- Mobile summary bar -->
    <div class="fixed inset-x-0 bottom-0 z-20 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] backdrop-blur lg:hidden">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{{ selectedOption.label }}</p>
          <p class="text-lg font-semibold text-slate-900">{{ totalPrice.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) }}</p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700"
          @click="summaryDrawerOpen = true"
        >
          Review & Approve
        </button>
      </div>
    </div>

    <!-- Desktop M (lg) mini summary bar -->
    <div
      class="fixed inset-x-0 bottom-0 z-20 hidden bg-white/95 px-5 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] backdrop-blur lg:flex xl:hidden"
    >
      <div class="flex w-full items-center justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{{ selectedOption.label }}</p>
          <p class="text-lg font-semibold text-slate-900">{{ totalPrice.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) }}</p>
        </div>
        <div class="flex items-center gap-3 text-xs text-slate-500">
          <div class="text-right">
            <p>Due today: {{ todayDue.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) }}</p>
            <p>At completion: {{ atCompletion.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) }}</p>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700"
            @click="approve"
          >
            Approve
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile summary drawer -->
    <Transition name="fade">
      <div
        v-if="summaryDrawerOpen"
        class="fixed inset-0 z-30 flex flex-col bg-slate-900/40 backdrop-blur lg:hidden"
        @click.self="summaryDrawerOpen = false"
      >
        <div class="mt-auto rounded-t-3xl border border-slate-200 bg-white p-5 shadow-2xl">
          <div class="mb-3 flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Your selection</p>
              <p class="text-sm font-semibold text-slate-900">{{ selectedOption.label }} - {{ selectedOption.tagline }}</p>
            </div>
            <button
              type="button"
              class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
              @click="summaryDrawerOpen = false"
            >
              Close
            </button>
          </div>
          <div class="flex items-center justify-between">
            <Transition name="fade-scale" mode="out-in">
              <div :key="totalPrice" class="text-2xl font-bold" :class="animatingPrice ? 'text-emerald-600' : 'text-slate-900'">
                {{ totalPrice.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) }}
              </div>
            </Transition>
            <div class="text-right text-xs text-slate-500">
              <p>Due today: {{ todayDue.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) }}</p>
              <p>At completion: {{ atCompletion.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) }}</p>
            </div>
          </div>
          <div class="mt-3 space-y-2">
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Chosen upgrades</p>
            <div v-if="selectedIds.length" class="flex flex-wrap gap-2">
              <span
                v-for="id in selectedIds"
                :key="id"
                class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-inner"
              >
                {{ selectedOption.upgrades.find((u) => u.id === id)?.label }}
              </span>
            </div>
            <p v-else class="text-sm text-slate-500">No upgrades added. You can still choose the base option.</p>
          </div>
          <div class="mt-4 space-y-2">
            <button
              type="button"
              class="flex w-full items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700"
              @click="approve"
            >
              Approve this option
            </button>
            <button
              type="button"
              class="flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
              @click="askQuestion"
            >
              Ask a question
            </button>
            <p class="text-[11px] text-slate-500">
              Nothing is final until you sign. Approving here just tells your contractor which option you like.
            </p>
          </div>
        </div>
      </div>
    </Transition>

    <p class="mt-6 pb-16 text-center text-[11px] text-slate-400 lg:hidden">
      Prototype only. No real payments or approvals are processed here.
    </p>
  </div>
</template>

<style scoped>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.18s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
