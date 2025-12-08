<script setup lang="ts">
const props = defineProps<{
  id?: string;
  option: {
    key: string;
    label: string;
    subtitle?: string;
    price: number;
    highlights?: string[];
  };
  selected: boolean;
  currency: (value: number) => string;
  imageSrc: string;
}>();

const emit = defineEmits<{
  (e: "select"): void;
}>();
</script>

<template>
  <article
    :id="id"
    class="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-[1px] hover:shadow-lg"
    :class="selected ? 'ring-2 ring-emerald-400' : ''"
  >
    <div class="flex items-start justify-between gap-3 px-4 pt-4 sm:px-5">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{{ option.label }}</p>
        <p class="text-lg font-semibold text-slate-900">{{ option.subtitle }}</p>
      </div>
      <p class="text-2xl font-bold text-slate-900">{{ currency(option.price) }}</p>
    </div>

    <div class="mt-3 h-56 w-full overflow-hidden bg-slate-100">
      <img :src="imageSrc" :alt="option.label" class="h-full w-full object-cover" />
    </div>

    <div class="flex flex-1 flex-col gap-3 px-4 py-4 sm:px-5">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">Highlights</p>
        <ul class="mt-2 space-y-1 text-sm text-slate-700">
          <li v-for="item in option.highlights || []" :key="item" class="flex items-start gap-2">
            <span class="mt-1 h-1.5 w-1.5 rounded-full bg-slate-300"></span>
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>

      <button
        type="button"
        class="mt-auto w-full rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-inner transition hover:bg-emerald-100"
        @click="emit('select')"
      >
        Choose {{ option.label }}
      </button>
    </div>
  </article>
</template>
