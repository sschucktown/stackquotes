<script setup lang="ts">
import { computed, reactive, ref } from "vue";

type Upgrade = {
  id: string;
  label: string;
  description: string;
  priceDelta: number;
  defaultOn?: boolean;
};

type Option = {
  id: string;
  label: string;
  tagline: string;
  basePrice: number;
  description: string;
  included: string[];
  upgrades: Upgrade[];
};

const proposal = reactive({
  clientName: "Sarah Thompson",
  projectName: "Maple St Deck",
  address: "482 Maple St, Seattle, WA",
  visitTime: "Site visit scheduled - Tomorrow at 3:00 PM",
  options: [
    {
      id: "good",
      label: "Good",
      tagline: "Essential composite deck",
      basePrice: 18400,
      description: "Lean, durable build with core finishes.",
      included: ["12' x 20' composite deck", "Standard railing", "Concrete footings"],
      upgrades: [
        { id: "lighting", label: "Post cap lighting", description: "Warm LED caps on each post.", priceDelta: 1200 },
        { id: "stairs", label: "Extra stair set", description: "Second stair run off the back.", priceDelta: 950 },
      ],
    },
    {
      id: "better",
      label: "Better",
      tagline: "Comfort with nicer finishes",
      basePrice: 22400,
      description: "Balanced look with upgraded rails and fascia.",
      included: ["12' x 20' composite deck", "Aluminum railing", "Skirt boards + fascia"],
      upgrades: [
        { id: "lighting", label: "Perimeter lighting", description: "Low-profile LEDs on perimeter.", priceDelta: 1400, defaultOn: true },
        { id: "stairs", label: "Extra stair set", description: "Second stair run off the back.", priceDelta: 950 },
        { id: "privacy", label: "Privacy screen", description: "6' privacy panel on one side.", priceDelta: 1100 },
      ],
    },
    {
      id: "best",
      label: "Best",
      tagline: "Premium look + low maintenance",
      basePrice: 26800,
      description: "Glass rail, lighting, and premium surface finishes.",
      included: ["14' x 22' premium composite deck", "Glass railing system", "Integrated lighting"],
      upgrades: [
        { id: "pergola", label: "Pergola shade", description: "Aluminum pergola with shade fabric.", priceDelta: 3200, defaultOn: true },
        { id: "heater", label: "Patio heater", description: "Mounted heater near seating area.", priceDelta: 900 },
        { id: "steps", label: "Wrap steps", description: "Wraparound steps on two sides.", priceDelta: 1800, defaultOn: true },
      ],
    },
  ] as Option[],
});

const selectedOptionId = ref<Option["id"]>("better");
const summaryDrawerOpen = ref(false);
const animatingPrice = ref(false);
const selectedUpgradesByOption = reactive<Record<string, Set<string>>>({});

const ensureDefaults = (option: Option) => {
  if (!selectedUpgradesByOption[option.id]) {
    selectedUpgradesByOption[option.id] = new Set();
  }
  option.upgrades.forEach((upgrade) => {
    if (upgrade.defaultOn) selectedUpgradesByOption[option.id].add(upgrade.id);
  });
};

proposal.options.forEach((option) => ensureDefaults(option));

const selectedOption = computed<Option>(() => {
  return proposal.options.find((opt) => opt.id === selectedOptionId.value) || proposal.options[0];
});

const selectedUpgrades = computed<Upgrade[]>(() => {
  const set = selectedUpgradesByOption[selectedOption.value.id] || new Set<string>();
  return selectedOption.value.upgrades.filter((u) => set.has(u.id));
});

const basePrice = computed(() => selectedOption.value.basePrice);

const upgradesTotal = computed(() => selectedUpgrades.value.reduce((sum, item) => sum + (item.priceDelta || 0), 0));

const totalPrice = computed(() => basePrice.value + upgradesTotal.value);

const todayDue = computed(() => Math.round(totalPrice.value * 0.2));
const atCompletion = computed(() => Math.max(0, totalPrice.value - todayDue.value));

const formatCurrency = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const toggleUpgrade = (optionId: string, upgradeId: string) => {
  if (!selectedUpgradesByOption[optionId]) selectedUpgradesByOption[optionId] = new Set();
  const bucket = selectedUpgradesByOption[optionId];
  if (bucket.has(upgradeId)) {
    bucket.delete(upgradeId);
  } else {
    bucket.add(upgradeId);
  }
  animatingPrice.value = true;
  setTimeout(() => (animatingPrice.value = false), 180);
};

const selectOption = (optionId: string) => {
  const option = proposal.options.find((opt) => opt.id === optionId);
  if (!option) return;
  ensureDefaults(option);
  selectedOptionId.value = optionId;
};

const optionTotal = (option: Option) => {
  const set = selectedUpgradesByOption[option.id] || new Set<string>();
  const upgrades = option.upgrades.filter((u) => set.has(u.id));
  return option.basePrice + upgrades.reduce((sum, u) => sum + (u.priceDelta || 0), 0);
};

const isUpgradeSelected = (optionId: string, upgradeId: string) =>
  Boolean(selectedUpgradesByOption[optionId]?.has(upgradeId));
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900">
    <div class="mx-auto flex max-w-6xl flex-col gap-5 px-4 pb-24 pt-6 sm:px-6 lg:px-8 lg:flex-row">
      <div class="flex-1 space-y-4 lg:max-w-xl">
        <header class="space-y-2">
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Proposal for {{ proposal.clientName }}
          </p>
          <h1 class="text-2xl font-semibold text-slate-900">Your {{ proposal.projectName }} Proposal</h1>
          <p class="text-sm text-slate-600">
            Pick the option that fits best. You can always ask a question before approving.
          </p>
        </header>

        <section class="rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-sm sm:px-6 sm:py-5">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Project summary</p>
              <p class="text-sm font-semibold text-slate-900">{{ proposal.projectName }}</p>
              <p class="text-sm text-slate-600">{{ proposal.address }}</p>
            </div>
            <div class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 shadow-inner">
              {{ proposal.visitTime }}
            </div>
          </div>
          <p class="mt-2 text-xs text-slate-500">You'll pay nothing until you pick an option.</p>
        </section>

        <section class="space-y-3">
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold text-slate-800 uppercase tracking-wide">Choose your option</p>
            <span class="text-xs text-slate-500">Good / Better / Best</span>
          </div>
          <div class="flex gap-3 overflow-x-auto pb-1 lg:grid lg:grid-cols-3 lg:overflow-visible">
            <article
              v-for="option in proposal.options"
              :key="option.id"
              class="relative flex min-w-[260px] flex-col gap-3 rounded-2xl border bg-white px-4 py-4 shadow-sm transition-all duration-150 ease-out hover:shadow-md sm:px-5"
              :class="[
                selectedOptionId === option.id
                  ? 'border-emerald-500 ring-2 ring-emerald-200 scale-[1.02]'
                  : 'border-slate-200',
              ]"
              @click="selectOption(option.id)"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="space-y-1">
                  <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{{ option.label }}</p>
                  <p class="text-sm font-semibold text-slate-800">{{ option.tagline }}</p>
                </div>
                <div
                  v-if="selectedOptionId === option.id"
                  class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 shadow-inner"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  Selected
                </div>
              </div>

              <div class="space-y-1">
                <div class="text-2xl font-bold text-slate-900">
                  {{ formatCurrency(optionTotal(option)) }}
                </div>
                <p class="text-xs text-slate-500">
                  From {{ formatCurrency(option.basePrice) }} • {{ option.description }}
                </p>
              </div>

              <div class="space-y-1 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 shadow-inner">
                <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Included</p>
                <ul class="space-y-1 text-sm text-slate-800">
                  <li v-for="item in option.included" :key="item" class="flex items-start gap-2">
                    <span class="mt-1 text-emerald-500">✓</span>
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>

              <div class="space-y-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 shadow-inner">
                <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Upgrades you can toggle</p>
                <div
                  v-for="upgrade in option.upgrades"
                  :key="upgrade.id"
                  class="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition hover:border-emerald-200"
                >
                  <div>
                    <p class="font-semibold text-slate-900">{{ upgrade.label }}</p>
                    <p class="text-xs text-slate-500">{{ upgrade.description }}</p>
                  </div>
                  <div class="flex flex-col items-end gap-1">
                    <span class="text-xs font-semibold text-slate-700">+{{ formatCurrency(upgrade.priceDelta) }}</span>
                    <button
                      type="button"
                      class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shadow-inner transition"
                      :class="isUpgradeSelected(option.id, upgrade.id)
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'"
                      @click.stop="toggleUpgrade(option.id, upgrade.id)"
                    >
                      {{ isUpgradeSelected(option.id, upgrade.id) ? "Added" : "Add" }}
                    </button>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between text-xs text-slate-500">
                <span>You can change this again before you approve.</span>
                <button
                  type="button"
                  class="rounded-full px-3 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50"
                  @click.stop="selectOption(option.id)"
                >
                  Select this option
                </button>
              </div>
            </article>
          </div>
        </section>

        <p class="hidden text-[11px] text-slate-400 lg:block">
          Prototype only. No real payments or approvals are processed here.
        </p>
      </div>

      <!-- Desktop summary -->
      <aside class="hidden w-full max-w-sm space-y-4 lg:block">
        <div class="sticky top-24 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-lg">
          <p class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Your selection</p>
          <div class="mt-2 flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold text-slate-900">{{ selectedOption.label }}</p>
              <p class="text-xs text-slate-500">{{ selectedOption.tagline }}</p>
            </div>
            <Transition name="fade-scale" mode="out-in">
              <div :key="totalPrice" class="text-2xl font-bold" :class="animatingPrice ? 'text-emerald-600' : 'text-slate-900'">
                {{ formatCurrency(totalPrice) }}
              </div>
            </Transition>
          </div>
          <div class="mt-3 space-y-1 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 shadow-inner">
            <div class="flex items-center justify-between text-sm font-semibold text-slate-800">
              <span>Due today (estimate)</span>
              <span>{{ formatCurrency(todayDue) }}</span>
            </div>
            <div class="flex items-center justify-between text-sm text-slate-600">
              <span>At completion</span>
              <span>{{ formatCurrency(atCompletion) }}</span>
            </div>
          </div>
          <div class="mt-3 space-y-2">
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Chosen upgrades</p>
            <ul v-if="selectedUpgrades.length" class="space-y-1 text-sm text-slate-800">
              <li v-for="item in selectedUpgrades" :key="item.id" class="flex items-start gap-2">
                <span class="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span>{{ item.label }}</span>
              </li>
            </ul>
            <p v-else class="text-sm text-slate-500">No upgrades added. You can still choose the base option.</p>
          </div>
          <div class="mt-3 space-y-2">
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Milestones</p>
            <ul class="space-y-2 text-sm">
              <li class="flex items-center gap-2">
                <span class="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span>Choose your option</span>
              </li>
              <li class="flex items-center gap-2 text-slate-600">
                <span class="h-2 w-2 rounded-full bg-slate-300"></span>
                <span>We schedule and build</span>
              </li>
              <li class="flex items-center gap-2 text-slate-600">
                <span class="h-2 w-2 rounded-full bg-slate-300"></span>
                <span>You enjoy + we warranty</span>
              </li>
            </ul>
          </div>
          <div class="mt-4 space-y-2">
            <button
              type="button"
              class="flex w-full items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700"
            >
              Approve this option
            </button>
            <button
              type="button"
              class="flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              Ask a question
            </button>
            <p class="text-[11px] text-slate-500">
              Nothing is final until you sign. Approving here just tells your contractor which option you like.
            </p>
          </div>
        </div>
      </aside>
    </div>

    <!-- Mobile summary drawer trigger -->
    <div class="fixed inset-x-0 bottom-0 z-20 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] backdrop-blur lg:hidden">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{{ selectedOption.label }}</p>
          <p class="text-lg font-semibold text-slate-900">{{ formatCurrency(totalPrice) }}</p>
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

    <!-- Mobile summary drawer -->
    <Transition name="fade">
      <div
        v-if="summaryDrawerOpen"
        class="fixed inset-0 z-30 flex flex-col bg-slate-900/40 backdrop-blur"
        @click.self="summaryDrawerOpen = false"
      >
        <div class="mt-auto rounded-t-3xl border border-slate-200 bg-white p-5 shadow-2xl">
          <div class="mb-3 flex items-center justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Your selection</p>
              <p class="text-sm font-semibold text-slate-900">{{ selectedOption.label }} — {{ selectedOption.tagline }}</p>
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
                {{ formatCurrency(totalPrice) }}
              </div>
            </Transition>
            <div class="text-right text-xs text-slate-500">
              <p>Due today: {{ formatCurrency(todayDue) }}</p>
              <p>At completion: {{ formatCurrency(atCompletion) }}</p>
            </div>
          </div>
          <div class="mt-3 space-y-2">
            <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Chosen upgrades</p>
            <ul v-if="selectedUpgrades.length" class="space-y-1 text-sm text-slate-800">
              <li v-for="item in selectedUpgrades" :key="item.id" class="flex items-start gap-2">
                <span class="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span>{{ item.label }}</span>
              </li>
            </ul>
            <p v-else class="text-sm text-slate-500">No upgrades added. You can still choose the base option.</p>
          </div>
          <div class="mt-4 space-y-2">
            <button
              type="button"
              class="flex w-full items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700"
            >
              Approve this option
            </button>
            <button
              type="button"
              class="flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
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

    <p class="mt-6 pb-20 text-center text-[11px] text-slate-400 lg:hidden">
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
  transform: scale(0.97);
}
.fade-scale-enter-to,
.fade-scale-leave-from {
  opacity: 1;
  transform: scale(1);
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
