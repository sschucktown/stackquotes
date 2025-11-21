<template>
  <div class="space-y-6">
    <section class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div class="flex flex-1 flex-col gap-2">
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500">Proposal name</label>
          <input
            v-model="store.title"
            class="rounded-2xl border border-slate-200 px-4 py-2 text-lg font-semibold text-slate-900 focus:border-slate-400 focus:outline-none"
          />
          <p class="text-xs text-slate-500">Client: {{ store.clientName }}</p>
        </div>
        <div class="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <span class="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <span class="h-2 w-2 rounded-full bg-emerald-400" /> Draft
          </span>
          <div class="flex gap-2">
            <button
              type="button"
              class="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
              @click="handleSave"
            >
              Save draft
            </button>
            <button
              type="button"
              class="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800"
              @click="openPreview"
            >
              Preview client view
            </button>
          </div>
        </div>
      </div>
    </section>

    <section class="grid gap-6 lg:grid-cols-[260px_1fr_320px]">
      <Spv2SidebarNav v-model:selectedSectionId="selectedSectionId" class="min-h-[640px]" />
      <Spv2CanvasPreview :selected-section-id="selectedSectionId" class="min-h-[640px]" />
      <Spv2InspectorPanel :selected-section-id="selectedSectionId" class="min-h-[640px]" />
    </section>

    <Teleport to="body">
      <transition name="fade">
        <div
          v-if="previewOpen"
          class="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4 py-6"
          @click.self="closePreview"
        >
          <div class="relative w-full max-w-5xl rounded-3xl bg-white shadow-2xl">
            <button
              type="button"
              class="absolute right-4 top-4 rounded-full bg-black/10 p-2 text-white"
              @click="closePreview"
            >
              <span class="sr-only">Close</span>
              ✕
            </button>
            <div class="max-h-[85vh] overflow-auto rounded-3xl bg-slate-100 p-4">
              <Spv2CanvasPreview :selected-section-id="selectedSectionId" variant="modal" />
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useSpv2Store } from "../stores/useSpv2Store";
import Spv2SidebarNav from "./Spv2SidebarNav.vue";
import Spv2CanvasPreview from "./Spv2CanvasPreview.vue";
import Spv2InspectorPanel from "./Spv2InspectorPanel.vue";

const store = useSpv2Store();
const selectedSectionId = ref<string | null>("branding");
const previewOpen = ref(false);

const handleSave = () => {
  console.info("[SmartProposals V2] Save draft clicked", {
    title: store.title,
    sections: store.sections.length,
  });
};

const openPreview = () => {
  previewOpen.value = true;
};
const closePreview = () => {
  previewOpen.value = false;
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
