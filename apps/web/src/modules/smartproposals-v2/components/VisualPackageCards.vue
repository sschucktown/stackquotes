<template>
  <section class="space-y-4">
    <header class="space-y-1">
      <h2 class="text-base font-semibold uppercase tracking-[0.16em] text-slate-900" :class="props.headingClass">
        Investment options
      </h2>
      <p class="text-sm text-slate-500" :class="props.bodyClass">
        Choose the path that aligns to your budget and timeline.
      </p>
    </header>

    <div class="grid gap-4 md:grid-cols-3" role="radiogroup" aria-label="Package options">
      <VisualPackageCard
        v-for="pkg in packages"
        :key="pkg.id"
        :pkg="pkg"
        :selected="pkg.id === selectedId"
        :disabled="disabled"
        @select="onSelect(pkg.id)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import VisualPackageCard from "./VisualPackageCard.vue";
import type { PackageTierId, VisualPackage } from "../types";

const props = defineProps<{
  packages: VisualPackage[];
  selectedId: PackageTierId | null;
  disabled?: boolean;
  headingClass?: string;
  bodyClass?: string;
}>();

const emit = defineEmits<{ (e: "update:selectedId", value: PackageTierId): void }>();

const onSelect = (id: PackageTierId) => {
  if (props.disabled) return;
  emit("update:selectedId", id);
};
</script>
