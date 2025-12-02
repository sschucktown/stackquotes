<template>
  <div class="space-y-8">
    <!-- Trust Header -->
    <div
      class="flex flex-col gap-4 rounded-3xl bg-white/90 p-6 shadow-sm ring-1 ring-slate-200 md:flex-row md:items-center md:justify-between"
    >
      <div class="flex items-center gap-4">
        <div
          class="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 ring-1 ring-slate-200"
        >
          <img
            v-if="proposal.logoUrl"
            :src="proposal.logoUrl"
            alt="Contractor logo"
            class="h-12 w-12 object-contain"
          />
          <div v-else class="text-sm font-semibold text-slate-600">Logo</div>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Project Address</p>
          <p class="text-lg font-semibold text-slate-900">{{ proposal.address }}</p>
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <Badge variant="outline">LICENSED</Badge>
        <Badge variant="outline">INSURED</Badge>
        <Chip icon="T" :label="proposal.timeline || '2-3 weeks install'" />
        <Chip icon="W" :label="proposal.warranty || '5-year workmanship warranty'" />
      </div>
    </div>

    <!-- Options Grid -->
    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
      <ProposalOptionCard
        v-for="(option, idx) in options"
        :key="option.id"
        :option="option"
        :tier="tierLabel(idx)"
        :theme="themeForTier(idx)"
        :selected="selectedId === option.id"
        @select="emitSelect"
      />
    </div>

    <!-- Next Steps -->
    <NextStepsFooter />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ProposalOptionCard from "./ProposalOptionCard.vue";
import NextStepsFooter from "./NextStepsFooter.vue";
import Badge from "../ui/Badge.vue";
import Chip from "../ui/Chip.vue";

interface Proposal {
  address: string;
  timeline?: string | null;
  warranty?: string | null;
  logoUrl?: string | null;
}

interface ProposalOption {
  id: string;
  title: string;
  features: string[];
  material: string;
  price: string;
  deposit: string;
  badge?: string | null;
  included?: string[];
  excluded?: string[];
  chips?: { icon: string; label: string }[];
}

const props = defineProps<{
  proposal: Proposal;
  options: ProposalOption[];
  selectedOption?: ProposalOption | string | null;
}>();

const emit = defineEmits<{
  (e: "selectOption", optionId: string): void;
}>();

const selectedId = computed(() => {
  if (!props.selectedOption) return null;
  return typeof props.selectedOption === "string" ? props.selectedOption : props.selectedOption.id;
});

const tierLabel = (idx: number) => (idx === 0 ? "Essentials" : idx === 1 ? "Better" : "Best");
const themeForTier = (idx: number) => (idx === 0 ? "good" : idx === 1 ? "better" : "best");

const emitSelect = (optionId: string) => emit("selectOption", optionId);
</script>
