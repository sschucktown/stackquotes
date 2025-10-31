<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  Home,
  Zap,
  FileText,
  Banknote,
  BarChart3,
  UserCircle2,
  MessageCircle,
} from "lucide-vue-next";

const props = withDefaults(defineProps<{ variant?: 'mobile' | 'desktop' }>(), { variant: 'desktop' });
const emit = defineEmits<{ (e: 'navigate'): void }>();

type Item = { label: string; name: string; icon: any };
const items: Item[] = [
  { label: 'Home', name: 'dashboard-home', icon: Home },
  { label: 'QuickQuotes', name: 'quickquote-dashboard', icon: Zap },
  { label: 'SmartProposals', name: 'smart-proposals', icon: FileText },
  { label: 'Payments', name: 'payments', icon: Banknote },
  { label: 'ProfitPulse', name: 'analytics', icon: BarChart3 },
  { label: 'Profile / Settings', name: 'settings', icon: UserCircle2 },
  { label: 'Chat / Help', name: 'help', icon: MessageCircle },
];

const route = useRoute();
const router = useRouter();
const isActive = (name: string) => route.name === name || (name.startsWith('quickquote') && String(route.name).startsWith('quickquote'));

const go = (name: string) => {
  if (!isActive(name)) router.push({ name });
  emit('navigate');
};

const containerClass = computed(() => [
  'flex h-full flex-col bg-white',
  props.variant === 'desktop' ? 'w-64 border-r border-gray-200' : 'w-72 rounded-tr-2xl shadow-xl',
]);

const itemBase = 'group relative flex items-center gap-3 rounded-md px-3 py-2 text-slate-700 hover:bg-gray-100 transition';
</script>

<template>
  <div :class="containerClass">
    <div class="px-4 py-4">
      <p class="text-sm font-semibold text-slate-900">StackQuotes</p>
      <p class="text-xs text-slate-500">Contractor Sales OS</p>
    </div>
    <nav class="mt-2 flex-1 space-y-1 px-2">
      <button
        v-for="item in items"
        :key="item.name"
        type="button"
        :class="[itemBase, isActive(item.name) ? 'border-l-4 border-[#3A7D99] bg-[#ECF3F6]' : 'border-l-4 border-transparent']"
        @click="go(item.name)"
      >
        <span class="absolute left-0 top-0 h-full w-1 rounded-r" :class="isActive(item.name) ? 'bg-[#3A7D99]' : 'bg-transparent'" />
        <component :is="item.icon" class="h-5 w-5" :class="isActive(item.name) ? 'text-[#3A7D99]' : 'text-slate-400 group-hover:text-slate-600'" />
        <span class="text-sm font-medium" :class="isActive(item.name) ? 'text-slate-900' : 'text-slate-700'">{{ item.label }}</span>
      </button>
    </nav>
  </div>
  
</template>

