<template>
  <nav
    class="border-t border-slate-200 bg-white/95 backdrop-blur-sm shadow-lg shadow-slate-900/5 sm:mx-auto sm:w-full sm:max-w-3xl sm:rounded-t-2xl"
  >
    <ul class="flex items-center justify-between px-2 py-2">
      <li
        v-for="item in items"
        :key="item.label"
        class="flex-1"
      >
        <button
          type="button"
          class="flex w-full flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
          :class="isActive(item) ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'"
          @click="navigate(item)"
        >
          <component
            :is="item.icon"
            class="h-5 w-5"
            :class="isActive(item) ? 'stroke-blue-600' : 'stroke-slate-400'"
          />
          <span>{{ item.label }}</span>
        </button>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { computed, type Component } from "vue";
import { useRoute, useRouter } from "vue-router";
import { HomeIcon, DocumentDuplicateIcon, ChartBarIcon, Squares2X2Icon } from "@heroicons/vue/24/outline";

const router = useRouter();
const route = useRoute();

interface NavItem {
  label: string;
  name: string;
  icon: Component;
  matches: (routeName: string | null) => boolean;
}

const items: NavItem[] = [
  {
    label: "Home",
    name: "dashboard-home",
    icon: HomeIcon,
    matches: (name) => name === "dashboard-home",
  },
  {
    label: "Quotes",
    name: "quickquote-dashboard",
    icon: DocumentDuplicateIcon,
    matches: (name) => name?.startsWith("quickquote-") ?? false,
  },
  {
    label: "Proposals",
    name: "smart-proposals",
    icon: Squares2X2Icon,
    matches: (name) => name === "smart-proposals",
  },
  {
    label: "Analytics",
    name: "analytics",
    icon: ChartBarIcon,
    matches: (name) => name === "analytics",
  },
];

const activeName = computed(() => (typeof route.name === "string" ? route.name : null));

const isActive = (item: NavItem) => item.matches(activeName.value);

const navigate = (item: NavItem) => {
  if (!isActive(item)) {
    router.push({ name: item.name });
  }
};
</script>
