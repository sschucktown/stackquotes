<template>
  <div>
    <nav
      class="border-t border-slate-200 bg-white/95 backdrop-blur-sm shadow-lg shadow-slate-900/5 sm:mx-auto sm:w-full sm:max-w-3xl sm:rounded-t-2xl"
    >
      <ul class="flex items-center justify-between px-2 py-2">
        <li
          v-for="item in items"
          :key="item.label"
          class="flex-1"
        >
          <NavItem
            :label="item.label"
            :icon="item.icon"
            :active="isActive(item)"
            variant="mobile"
            @click="navigate(item)"
          />
        </li>
      </ul>
    </nav>

    <UpgradeModal :open="upgradeModalOpen" :feature="upgradeFeature" @close="upgradeModalOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import NavItem from "./NavItem.vue";
import { NAV_ITEMS, type NavItemConfig } from "./navItems";
import UpgradeModal from "@/components/billing/UpgradeModal.vue";
import { useTier } from "@/composables/useTier";

const router = useRouter();
const route = useRoute();

const items = NAV_ITEMS;

const activeName = computed(() => (typeof route.name === "string" ? route.name : null));

const isActive = (item: NavItemConfig) => item.matches(activeName.value);

const { isPro, inTrial } = useTier();
const upgradeModalOpen = ref(false);
const upgradeFeature = ref<string | undefined>(undefined);
const canAccessPro = computed(() => isPro.value || inTrial.value);

const navigate = (item: NavItemConfig) => {
  if (item.requiresPro && item.name !== "smart-proposals" && !canAccessPro.value) {
    upgradeFeature.value = item.label;
    upgradeModalOpen.value = true;
    return;
  }
  if (!isActive(item)) {
    router.push({ name: item.name });
  }
};
</script>
