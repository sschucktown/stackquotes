<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { PlusIcon, BoltIcon, DocumentTextIcon, BanknotesIcon, ChatBubbleLeftRightIcon } from "@heroicons/vue/24/outline";

const router = useRouter();
const open = ref(false);
const lastActionKey = "sq:lastAction";
const lastAction = ref<string | null>(null);

onMounted(() => {
  try {
    lastAction.value = localStorage.getItem(lastActionKey);
  } catch {}
});

const actions = [
  { id: "quickquote", label: "QuickQuote", icon: BoltIcon, run: () => router.push({ name: "quickquote-new" }) },
  { id: "smartproposal", label: "SmartProposal", icon: DocumentTextIcon, run: () => router.push({ name: "smart-proposals" }) },
  { id: "payment", label: "Payment", icon: BanknotesIcon, run: () => router.push({ name: "payments" }) },
  { id: "help", label: "Chat / Help", icon: ChatBubbleLeftRightIcon, run: () => router.push({ name: "help" }) },
];

const trigger = (id: string, run: () => void) => {
  try { localStorage.setItem(lastActionKey, id); } catch {}
  run();
  open.value = false;
};

const onMainClick = () => {
  open.value = !open.value;
};
</script>

<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
    <transition name="fab-fade">
      <div v-if="open" class="flex flex-col items-end gap-2">
        <button
          v-for="a in actions"
          :key="a.id"
          type="button"
          class="group flex items-center gap-3 rounded-full bg-white/95 px-3 py-2 text-sm font-medium text-slate-700 shadow-lg ring-1 ring-slate-200 backdrop-blur transition hover:-translate-y-0.5 hover:shadow-xl"
          @click="trigger(a.id, a.run)"
        >
          <span class="hidden rounded-full bg-brand-50 px-2 py-1 text-xs text-brand-700 md:inline">{{ a.label }}</span>
          <component :is="a.icon" class="h-6 w-6 text-brand-600" />
        </button>
      </div>
    </transition>

    <button
      type="button"
      class="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-white shadow-xl shadow-brand-600/40 transition hover:scale-105 hover:bg-brand-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white md:h-16 md:w-16"
      aria-label="Actions"
      @click="onMainClick"
    >
      <PlusIcon class="h-8 w-8" />
    </button>
  </div>
  
</template>

<style scoped>
.fab-fade-enter-active,
.fab-fade-leave-active { transition: all 0.15s ease; }
.fab-fade-enter-from,
.fab-fade-leave-to { opacity: 0; transform: translateY(6px); }
</style>

