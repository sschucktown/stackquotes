<script setup lang="ts">
import type { QuickQuoteTemplate } from "@/stores/quickQuotePrototype";
import { CheckCircleIcon } from "@heroicons/vue/24/outline";

const props = defineProps<{
  open: boolean;
  templates: QuickQuoteTemplate[];
  selectedId?: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "select", templateId: string): void;
}>();
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur"
  >
    <div class="w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl">
      <div class="mb-4 flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-slate-900">Choose a Template</h3>
          <p class="text-sm text-slate-500">Prefill pricing, scope, and add-ons instantly.</p>
        </div>
        <button
          type="button"
          class="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          @click="emit('close')"
        >
          Close
        </button>
      </div>

      <div class="grid gap-3 sm:grid-cols-2">
        <button
          v-for="template in templates"
          :key="template.id"
          type="button"
          class="flex h-full flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
          :class="template.id === selectedId ? 'border-emerald-300 bg-emerald-50' : ''"
          @click="emit('select', template.id)"
        >
          <div class="flex items-start justify-between gap-2">
            <div>
              <h4 class="text-base font-semibold text-slate-900">{{ template.title }}</h4>
              <p class="text-sm text-slate-600">{{ template.description }}</p>
            </div>
            <CheckCircleIcon
              class="h-5 w-5"
              :class="template.id === selectedId ? 'text-emerald-600' : 'text-slate-300'"
            />
          </div>
          <ul class="space-y-1 text-sm text-slate-700">
            <li v-for="item in template.scope" :key="item" class="flex items-start gap-2">
              <span class="mt-1 h-1.5 w-1.5 rounded-full bg-slate-300"></span>
              <span>{{ item }}</span>
            </li>
          </ul>
          <div class="mt-auto flex items-center justify-between">
            <span
              class="rounded-full px-3 py-1 text-xs font-semibold shadow-inner"
              :class="{
                'border border-emerald-200 bg-emerald-50 text-emerald-700': template.complexity === 'Low',
                'border border-amber-200 bg-amber-50 text-amber-700': template.complexity === 'Medium',
                'border border-rose-200 bg-rose-50 text-rose-700': template.complexity === 'High',
              }"
            >
              Complexity: {{ template.complexity }}
            </span>
            <span class="text-sm font-semibold text-slate-900">
              {{ template.basePrice.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) }}
            </span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
