<template>
  <div class="space-y-3">
    <Collapsible title="Included Scope" :accent="accent" default-open>
      <ul class="space-y-2 text-sm text-slate-700">
        <li v-for="item in included" :key="item" class="flex items-start gap-2">
          <span class="mt-1 h-2 w-2 rounded-full" :class="dotClass"></span>
          <span>{{ item }}</span>
        </li>
        <li v-if="!included.length" class="text-slate-500">No included items listed.</li>
      </ul>
    </Collapsible>
    <Collapsible title="Excluded Scope" :accent="accent" :default-open="false">
      <ul class="space-y-2 text-sm text-slate-700">
        <li v-for="item in excluded" :key="item" class="flex items-start gap-2">
          <span class="mt-1 h-2 w-2 rounded-full bg-rose-400"></span>
          <span>{{ item }}</span>
        </li>
        <li v-if="!excluded.length" class="text-slate-500">No exclusions listed.</li>
      </ul>
    </Collapsible>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Collapsible from "../ui/Collapsible.vue";

const props = defineProps<{
  included: string[];
  excluded: string[];
  accent?: "amber" | "blue" | "slate";
}>();

const dotClass = computed(() => {
  if (props.accent === "amber") return "bg-amber-500";
  if (props.accent === "blue") return "bg-blue-500";
  return "bg-slate-400";
});
</script>
