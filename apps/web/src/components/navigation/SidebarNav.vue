<template>
  <aside
    :class="[
      'hidden h-screen flex-col border-r border-slate-200 bg-white py-6 shadow-sm transition-all duration-300 lg:flex',
      collapsed ? 'w-20 px-3' : 'w-64 px-4',
    ]"
  >
    <div
      class="flex items-center gap-3 px-2"
      :class="collapsed ? 'justify-center' : ''"
    >
      <div class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
        SQ
      </div>
      <div v-if="!collapsed">
        <p class="text-lg font-semibold text-slate-900">StackQuotes</p>
        <p class="text-xs text-slate-500">Contractor Sales OS</p>
      </div>
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
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import NavItem from "./NavItem.vue";
import { NAV_ITEMS, type NavItemConfig } from "./navItems";

const props = withDefaults(
  defineProps<{
    collapsed?: boolean;
  }>(),
  {
    collapsed: false,
  }
);

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
</script>
