<script setup lang="ts">
import { computed, ref } from "vue";

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

const failedImage = ref(false);
const showImage = computed(() => Boolean(props.imageSrc) && !failedImage.value);
const handleImageError = () => {
  failedImage.value = true;
};
</script>

<template>
  <article
    :id="id"
    class="flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 ease-out"
    :class="[
      selected
        ? 'border-2 border-emerald-500 shadow-lg ring-1 ring-emerald-100 scale-[1.02]'
        : 'border-slate-200 hover:-translate-y-[1px] hover:opacity-[0.92] hover:shadow-md',
    ]"
    @click="emit('select')"
  >
    <div class="flex items-start justify-between gap-3 px-5 pt-5">
      <div class="space-y-0.5">
        <p class="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{{ option.label }}</p>
        <p class="text-base font-semibold text-slate-900">{{ option.subtitle }}</p>
      </div>
      <p class="text-2xl font-bold text-slate-900">{{ currency(option.price) }}</p>
    </div>

    <div class="relative mt-4 h-[200px] w-full overflow-hidden rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 shadow-[0_14px_40px_-28px_rgba(15,23,42,0.55)] lg:h-[260px]">
      <img
        v-if="showImage"
        :src="imageSrc"
        :alt="option.label"
        class="h-full w-full object-cover"
        @error="handleImageError"
        loading="lazy"
      />
      <div
        v-else
        class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400"
      >
        <span class="rounded-full border border-slate-200/70 bg-white/60 px-3 py-1 text-xs font-semibold">Preview</span>
      </div>
    </div>

    <div class="flex flex-1 flex-col gap-3 px-5 pb-5 pt-4">
      <div class="space-y-2 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3 shadow-inner">
        <p class="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">Highlights</p>
        <ul class="space-y-1.5 text-sm text-slate-700">
          <li v-for="item in option.highlights || []" :key="item" class="flex items-start gap-2">
            <span class="mt-[6px] h-1.5 w-1.5 rounded-full bg-emerald-500/80"></span>
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>

      <button
        type="button"
        class="mt-auto w-full rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-inner transition-all duration-200 ease-out hover:-translate-y-[1px] hover:bg-emerald-100"
        @click.stop="emit('select')"
      >
        Choose {{ option.label }}
      </button>
    </div>
  </article>
</template>
