<template>
  <div class="relative hidden lg:flex">
    <aside
      :class="[
        'flex h-screen flex-col border-r border-slate-200 bg-white py-6 shadow-sm transition-all duration-300 lg:flex-shrink-0 lg:flex-grow-0',
        isOpen ? 'w-60 px-4' : 'w-0 px-0 overflow-hidden'
      ]"
    >
      <div class="flex items-center justify-between px-2">
        <RouterLink to="/dashboard" class="flex items-center gap-3">
          <img
            :src="logo"
            alt="StackQuotes logo"
            class="h-10 w-10 rounded-full object-contain"
          />
          <div v-if="isOpen" class="leading-tight">
            <p class="text-base font-semibold text-slate-900">StackQuotes</p>
            <p class="text-xs text-slate-500">{{ companyName }}</p>
          </div>
        </RouterLink>
        <button
          v-if="isOpen"
          type="button"
          class="hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:text-blue-600 lg:flex"
          :aria-expanded="isOpen"
          title="Collapse sidebar"
          @click="isOpen = false"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>

      <nav v-if="isOpen" class="mt-8 flex flex-1 flex-col gap-1">
        <NavItem
          v-for="item in items"
          :key="item.name"
          :label="item.label"
          :icon="item.icon"
          :active="isActive(item)"
          variant="desktop"
          @click="navigate(item)"
        />
      </nav>
    </aside>

    <button
      v-if="!isOpen"
      type="button"
      class="absolute left-4 top-4 z-30 hidden h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:text-blue-600 lg:flex"
      title="Open menu"
      @click="isOpen = true"
    >
      <Bars3Icon class="h-6 w-6" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { Bars3Icon, XMarkIcon } from "@heroicons/vue/24/outline";
import NavItem from "./NavItem.vue";
import { NAV_ITEMS, type NavItemConfig } from "./navItems";
import logo from "@/assets/logo/stackquotes-logo.svg";
import { useSettingsStore } from "@modules/quickquote/stores/settingsStore";

const isOpen = ref(true);
const router = useRouter();
const route = useRoute();
const settingsStore = useSettingsStore();

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

const navigate = (item: NavItemConfig) => {
  if (!isActive(item)) {
    router.push({ name: item.name });
  }
};
</script>
