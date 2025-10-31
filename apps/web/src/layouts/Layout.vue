<template>
  <div class="min-h-screen bg-[#F8F9FA] text-[#1A1A1A]">
    <!-- Header -->
    <header class="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-6 lg:hidden">
      <button
        type="button"
        class="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-700 hover:bg-gray-100"
        aria-label="Open menu"
        @click="toggle()"
      >
        <Menu class="h-6 w-6" />
      </button>
      <slot name="header-center" />
      <div class="w-10" />
    </header>

    <!-- Desktop fixed sidebar -->
    <aside class="fixed left-0 top-0 z-20 hidden h-screen w-64 border-r border-gray-200 bg-white lg:block">
      <SidebarMenu variant="desktop" @navigate="onNav" />
    </aside>

    <!-- Mobile overlay + slide-out sidebar -->
    <transition name="fade">
      <div
        v-if="showSidebar"
        class="fixed inset-0 z-40 bg-black/30 lg:hidden"
        @click.self="close()"
      />
    </transition>
    <transition name="slide-x">
      <aside
        v-if="showSidebar"
        class="fixed left-0 top-0 z-50 h-screen w-72 rounded-tr-2xl bg-white shadow-xl ring-1 ring-black/5 transition will-change-transform lg:hidden"
      >
        <SidebarMenu variant="mobile" @navigate="onNav" />
      </aside>
    </transition>

    <!-- Main content area -->
    <main class="min-h-screen lg:pl-64">
      <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <RouterView />
      </div>
    </main>

    <!-- Keep FAB above overlays (z-50) -->
    <UniversalFab />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from "vue";
import { RouterView } from "vue-router";
import { Menu } from "lucide-vue-next";
import SidebarMenu from "@/components/navigation/SidebarMenu.vue";
import UniversalFab from "@/components/navigation/UniversalFab.vue";

const showSidebar = ref(false);

const toggle = () => { showSidebar.value = !showSidebar.value; };
const close = () => { showSidebar.value = false; };
const onNav = () => { close(); };

const setBodyScroll = (lock: boolean) => {
  try {
    document.body.style.overflow = lock ? 'hidden' : '';
  } catch {}
};

watch(showSidebar, (open) => setBodyScroll(open));
onBeforeUnmount(() => setBodyScroll(false));
</script>

<style scoped>
.slide-x-enter-active,
.slide-x-leave-active { transition: transform 180ms ease, opacity 180ms ease; }
.slide-x-enter-from { transform: translateX(-100%); opacity: 0.9; }
.slide-x-enter-to { transform: translateX(0); opacity: 1; }
.slide-x-leave-from { transform: translateX(0); opacity: 1; }
.slide-x-leave-to { transform: translateX(-100%); opacity: 0.9; }

.fade-enter-active,
.fade-leave-active { transition: opacity 150ms ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>
