<script setup lang="ts">
import { TransitionGroup } from "vue";
import type { Upgrade } from "../optionsData";
import UpgradeToggle from "./UpgradeToggle.vue";

const props = defineProps<{
  upgrades: Upgrade[];
  selectedIds: string[];
}>();

const emit = defineEmits<{
  (e: "toggle", id: string): void;
}>();
</script>

<template>
  <TransitionGroup
    name="upgrade-slide"
    tag="div"
    class="space-y-2"
  >
    <UpgradeToggle
      v-for="upgrade in upgrades"
      :key="upgrade.id"
      :upgrade="upgrade"
      :selected="selectedIds.includes(upgrade.id)"
      @toggle="emit('toggle', upgrade.id)"
    />
  </TransitionGroup>
</template>

<style scoped>
.upgrade-slide-enter-active,
.upgrade-slide-leave-active {
  transition: all 0.18s ease;
}
.upgrade-slide-enter-from,
.upgrade-slide-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
