<template>
  <aside class="hidden h-screen w-60 flex-col border-r border-slate-200 bg-white px-4 py-6 shadow-sm lg:flex">
    <div class="px-2">
      <p class="text-lg font-semibold text-slate-900">StackQuotes</p>
      <p class="text-xs text-slate-500">Contractor Sales OS</p>
    </div>

    <nav class="mt-8 flex flex-1 flex-col gap-1">
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
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import NavItem from "./NavItem.vue";
import { NAV_ITEMS, type NavItemConfig } from "./navItems";

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
