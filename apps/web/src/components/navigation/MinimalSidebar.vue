<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import {
  HomeIcon,
  DocumentDuplicateIcon,
  ClipboardDocumentCheckIcon,
  BanknotesIcon,
  ChartBarIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
} from "@heroicons/vue/24/outline";
import logo from "@/assets/logo/stackquotes-logo.svg";
import { useSettingsStore } from "@modules/quickquote/stores/settingsStore";
import { useTier } from "@/composables/useTier";
import UpgradeModal from "@/components/billing/UpgradeModal.vue";

type Item = {
  label: string;
  name: string;
  icon: any;
  requiresPro?: boolean;
};

const router = useRouter();
const route = useRoute();
const settingsStore = useSettingsStore();
const { isPro, inTrial } = useTier();
const canAccessPro = computed(() => isPro.value || inTrial.value);
const upgradeModalOpen = ref(false);
const upgradeFeature = ref<string | undefined>(undefined);

onMounted(() => {
  if (!settingsStore.data && !settingsStore.loading) {
    void settingsStore.load();
  }
});

const companyName = computed(
  () => settingsStore.data?.companyName?.trim() || "Contractor Sales OS"
);

const items = computed<Item[]>(() => [
  { label: "Home", name: "dashboard-home", icon: HomeIcon },
  { label: "QuickQuotes", name: "quickquote-dashboard", icon: DocumentDuplicateIcon },
  { label: "SmartProposals", name: "smart-proposals", icon: ClipboardDocumentCheckIcon, requiresPro: true },
  { label: "Payments", name: "payments", icon: BanknotesIcon },
  { label: "ProfitPulse", name: "analytics", icon: ChartBarIcon, requiresPro: true },
  { label: "Profile / Settings", name: "settings", icon: UserCircleIcon },
  { label: "Chat / Help", name: "help", icon: ChatBubbleLeftRightIcon },
]);

const isActive = (name: string) => route.name === name;

const navigate = (item: Item) => {
  if (item.requiresPro && !canAccessPro.value) {
    upgradeFeature.value = item.label;
    upgradeModalOpen.value = true;
    return;
  }
  if (!isActive(item.name)) {
    router.push({ name: item.name });
  }
};

const expanded = ref(false); // mobile expand state

const toggle = () => {
  expanded.value = !expanded.value;
};
</script>

<template>
  <aside
    class="fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-200 bg-white"
    :class="[
      // collapsed on mobile, expanded on lg
      expanded ? 'w-60' : 'w-16',
      'lg:w-60'
    ]"
  >
    <div class="flex items-center gap-3 px-3 py-4 lg:px-4">
      <button
        type="button"
        class="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-50 lg:hidden"
        aria-label="Toggle sidebar"
        @click="toggle"
      >
        <Bars3Icon class="h-5 w-5" />
      </button>
      <RouterLink to="/dashboard" class="flex items-center gap-3">
        <img :src="logo" alt="StackQuotes logo" class="h-9 w-9 rounded-md border border-white/60 bg-white p-1.5 shadow-sm" />
        <div class="hidden leading-tight lg:block">
          <p class="text-sm font-semibold text-slate-900">StackQuotes</p>
          <p class="text-xs text-slate-500">{{ companyName }}</p>
        </div>
        <div v-if="expanded" class="block leading-tight lg:hidden">
          <p class="text-sm font-semibold text-slate-900">StackQuotes</p>
          <p class="text-xs text-slate-500">{{ companyName }}</p>
        </div>
      </RouterLink>
    </div>

    <nav class="mt-2 flex-1 space-y-1">
      <button
        v-for="item in items"
        :key="item.name"
        type="button"
        class="group relative flex w-full items-center rounded-md px-3 py-2 text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
        :class="[
          expanded ? 'gap-3' : 'justify-center lg:justify-start lg:gap-3',
          isActive(item.name) ? 'bg-brand-50 text-brand-700' : ''
        ]"
        @click="navigate(item)">
        <span
          class="absolute left-0 top-0 h-full w-1 rounded-r"
          :class="isActive(item.name) ? 'bg-brand-600' : 'bg-transparent'"
        />
        <component :is="item.icon" class="h-6 w-6" :class="isActive(item.name) ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'" />
        <span class="hidden text-sm font-medium lg:inline">{{ item.label }}</span>
        <span v-if="expanded" class="text-sm font-medium lg:hidden">{{ item.label }}</span>
      </button>
    </nav>

    <div class="mt-auto p-3">
      <p class="hidden text-xs text-slate-400 lg:block">Balance ambition with patience.</p>
      <p v-if="expanded" class="text-xs text-slate-400 lg:hidden">Balance ambition with patience.</p>
    </div>

    <UpgradeModal :open="upgradeModalOpen" :feature="upgradeFeature" @close="upgradeModalOpen = false" />
  </aside>
</template>

<style scoped>
/* Simple breakpoint helper for v-if conditions in template via $screen */
</style>
