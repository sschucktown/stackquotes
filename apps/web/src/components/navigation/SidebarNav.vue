<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { Menu, ChevronLeft, LogOut } from "lucide-vue-next";
import NavItem from "./NavItem.vue";
import { NAV_ITEMS, type NavItemConfig } from "./navItems";
import logo from "@/assets/logo/stackquotes-logo.svg";
import { useSettingsStore } from "@modules/quickquote/stores/settingsStore";
import { useAuth } from "@/lib/auth";
import { useDemoStore } from "@/stores/demoStore";
import { useTier } from "@/composables/useTier";
import UpgradeModal from "@/components/billing/UpgradeModal.vue";

const isOpen = ref(true);
const router = useRouter();
const route = useRoute();
const settingsStore = useSettingsStore();
const { signOut } = useAuth();
const demoStore = useDemoStore();
const { isPro, inTrial } = useTier();
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

const items = NAV_ITEMS;
const activeName = computed(() => (typeof route.name === "string" ? route.name : null));
const isActive = (item: NavItemConfig) => item.matches(activeName.value);
const canAccessPro = computed(() => isPro.value || inTrial.value);

const navigate = (item: NavItemConfig) => {
  if (item.requiresPro && !canAccessPro.value) {
    upgradeFeature.value = item.label;
    upgradeModalOpen.value = true;
    return;
  }
  if (!isActive(item)) {
    router.push({ name: item.name });
  }
};

const handleLogout = async () => {
  demoStore.deactivate();
  await signOut();
  router.push({ name: "login" });
};
</script>

<template>
  <div class="relative hidden lg:flex">
    <aside
      :class="[
        'flex h-screen flex-col border-r border-slate-200 bg-white/85 py-6 pl-5 pr-4 shadow-sm backdrop-blur transition-all duration-300 lg:flex-shrink-0 lg:flex-grow-0',
        isOpen ? 'w-64' : 'w-0 px-0 overflow-hidden'
      ]"
    >
      <div class="flex items-center gap-3">
        <RouterLink to="/dashboard" class="flex items-center gap-3">
          <img
            :src="logo"
            alt="StackQuotes logo"
            class="h-10 w-10 rounded-md border border-white/60 bg-white/80 p-1.5 shadow-sm"
          />
          <div v-if="isOpen" class="leading-tight">
            <p class="text-base font-semibold text-slate-900">StackQuotes</p>
            <p class="text-xs text-slate-500">{{ companyName }}</p>
          </div>
        </RouterLink>
      </div>

      <p v-if="isOpen" class="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-400">Navigation</p>
      <nav v-if="isOpen" class="mt-4 flex flex-1 flex-col gap-1">
        <NavItem
          v-for="item in items"
          :key="item.name"
          :label="item.label"
          :icon="item.icon"
          :active="isActive(item)"
          variant="desktop"
          @click="navigate(item)"
        />
        <NavItem
          label="Logout"
          :icon="LogOut"
          variant="desktop"
          @click="handleLogout"
        />
      </nav>

      <button
        v-if="isOpen"
        type="button"
        class="mt-auto flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-700"
        @click="isOpen = false"
      >
        <ChevronLeft class="h-4 w-4" />
        Collapse sidebar
      </button>
    </aside>

    <button
      v-if="!isOpen"
      type="button"
      class="absolute left-4 top-4 z-30 hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600 lg:flex"
      title="Open menu"
      @click="isOpen = true"
    >
      <Menu class="h-5 w-5" />
    </button>

    <UpgradeModal :open="upgradeModalOpen" :feature="upgradeFeature" @close="upgradeModalOpen = false" />
  </div>
</template>
