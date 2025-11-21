<template>
  <aside class="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
    <div class="mb-4 px-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
      Proposal builder
    </div>
    <nav class="flex flex-col gap-2">
      <button
        type="button"
        class="flex items-center justify-between rounded-2xl px-3 py-2 text-left text-sm transition"
        :class="itemClass('branding')"
        @click="selectBranding"
      >
        <div>
          <p class="font-semibold text-slate-900">Branding & theme</p>
          <p class="text-xs text-slate-500">Colors, fonts, logo</p>
        </div>
        <span class="text-xs text-slate-400">⌘B</span>
      </button>
      <div class="h-px bg-slate-100" />
      <div
        v-for="section in sections"
        :key="section.id"
        class="rounded-2xl border border-transparent"
        :class="{ 'border-slate-200 bg-slate-50/80': section.hidden }"
      >
        <button
          type="button"
          class="flex w-full items-center justify-between px-3 py-2 text-left transition"
          :class="itemClass(section.id)"
          @click="selectSection(section.id)"
        >
          <div>
            <p class="font-semibold text-slate-900">{{ section.title || formatType(section.type) }}</p>
            <p class="text-xs text-slate-500 capitalize">{{ section.type }}</p>
          </div>
          <span
            v-if="section.hidden"
            class="text-xs font-semibold uppercase tracking-wide text-slate-400"
          >
            Hidden
          </span>
        </button>
        <div class="flex items-center justify-between px-3 pb-3 text-xs text-slate-500">
          <div class="flex gap-1">
            <button type="button" class="rounded-full p-1 hover:bg-slate-100" @click="store.moveSectionUp(section.id)">
              <ChevronUp class="h-4 w-4" />
            </button>
            <button
              type="button"
              class="rounded-full p-1 hover:bg-slate-100"
              @click="store.moveSectionDown(section.id)"
            >
              <ChevronDown class="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs transition hover:bg-slate-100"
            @click="store.toggleSectionHidden(section.id)"
          >
            <EyeOff v-if="section.hidden" class="h-3.5 w-3.5" />
            <Eye v-else class="h-3.5 w-3.5" />
            <span>{{ section.hidden ? "Show" : "Hide" }}</span>
          </button>
        </div>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-vue-next";
import { useSpv2Store } from "../stores/useSpv2Store";

const props = defineProps<{ selectedSectionId: string | null }>();
const emit = defineEmits<{ (e: "update:selectedSectionId", value: string | null): void }>();

const store = useSpv2Store();
const sections = computed(() => store.sections);

const selectSection = (id: string) => emit("update:selectedSectionId", id);
const selectBranding = () => emit("update:selectedSectionId", "branding");

const itemClass = (id: string) =>
  props.selectedSectionId === id
    ? "bg-slate-900 text-white shadow-inner shadow-slate-900/10"
    : "text-slate-700 hover:bg-slate-100";

const formatType = (type: string) =>
  type
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
</script>
