<template>
  <div
    class="spv2-preview relative h-full rounded-3xl bg-slate-50 p-4"
    :class="previewMode === 'modal' ? 'overflow-y-auto' : 'overflow-hidden'"
    :style="previewStyle"
  >
    <div class="mx-auto flex max-w-3xl flex-col gap-4 pb-8">
      <div
        v-for="section in renderedSections"
        :key="section.id"
        class="transition"
        :class="section.id === selectedSectionId ? activeClass : inactiveClass"
      >
        <component :is="componentByType[section.type]" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import HeroBlock from "./blocks/HeroBlock.vue";
import PackageGridBlock from "./blocks/PackageGridBlock.vue";
import WhyUsBlock from "./blocks/WhyUsBlock.vue";
import PaymentBlock from "./blocks/PaymentBlock.vue";
import FooterBlock from "./blocks/FooterBlock.vue";
import FencingBlock from "./blocks/FencingBlock.vue";
import { useSpv2Store } from "../stores/useSpv2Store";

type Variant = "builder" | "modal";

const props = defineProps<{
  selectedSectionId: string | null;
  variant?: Variant;
}>();

const store = useSpv2Store();

const componentByType = {
  hero: HeroBlock,
  packages: PackageGridBlock,
  "why-us": WhyUsBlock,
  payment: PaymentBlock,
  footer: FooterBlock,
  fencing: FencingBlock,
} as const;

const renderedSections = computed(() => store.sections.filter((section) => !section.hidden));

const previewStyle = computed(() => ({
  "--spv2-primary": store.brand.primaryColor,
  "--spv2-accent": store.brand.accentColor,
}));

const activeClass = "rounded-[32px] bg-white ring-2 ring-[var(--spv2-primary)] shadow-lg";
const inactiveClass = "rounded-[32px] bg-white ring-1 ring-slate-100 shadow-sm";

const previewMode = computed<Variant>(() => props.variant ?? "builder");
</script>

<style scoped>
.spv2-preview {
  background-image: radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.08), transparent 45%),
    radial-gradient(circle at 80% 0%, rgba(14, 165, 233, 0.08), transparent 40%);
}
</style>
