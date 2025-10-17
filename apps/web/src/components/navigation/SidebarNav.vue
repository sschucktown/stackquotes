<template>
  <aside
    :class="[
      'hidden h-screen flex-col border-r border-slate-200 bg-white py-6 shadow-sm transition-all duration-300 lg:flex',
      collapsed ? 'w-20' : 'w-60',
    ]"
  >
    <div class="flex items-center justify-between px-4" :class="collapsed ? 'px-2' : 'px-4'">
      <RouterLink to="/dashboard" class="flex items-center gap-3">
        <img
          :src="logo"
          alt="StackQuotes logo"
          class="h-10 w-10 rounded-full object-contain"
        />
        <div v-if="!collapsed" class="leading-tight">
          <p class="text-base font-semibold text-slate-900">StackQuotes</p>
          <p class="text-xs text-slate-500">Contractor Sales OS</p>
        </div>
      </RouterLink>
      <button
        type="button"
        class="hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-blue-200 hover:text-blue-600 lg:flex"
        :aria-expanded="!collapsed"
        :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        @click="collapsed = !collapsed"
      >
        <component
          :is="collapsed ? IconChevronRight : IconChevronLeft"
          class="h-5 w-5"
        />
      </button>
    </div>

    <nav class="mt-8 flex flex-1 flex-col gap-1">
      <NavItem
        v-for="item in items"
        :key="item.name"
        :label="item.label"
        :icon="item.icon"
        :active="isActive(item)"
        variant="desktop"
        :collapsed="collapsed"
        @click="navigate(item)"
      />
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from "@heroicons/vue/24/outline";
import NavItem from "./NavItem.vue";
import { NAV_ITEMS, type NavItemConfig } from "./navItems";
import logo from "@/assets/logo/stackquotes-logo.svg";

const collapsed = ref(false);
const router = useRouter();
const route = useRoute();

const items = NAV_ITEMS;
const activeName = computed(() => (typeof route.name === "string" ? route.name : null));
const isActive = (item: NavItemConfig) => item.matches(activeName.value);

const navigate = (item: NavItemConfig) => {
  if (!isActive(item)) {
    router.push({ name: item.name });
  }
};

const IconChevronLeft = ChevronDoubleLeftIcon;
const IconChevronRight = ChevronDoubleRightIcon;
</script>
