<template>
  <section class="space-y-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
    <div class="flex flex-col gap-1">
      <p :class="fontClasses.accent">Investment options</p>
      <h2 :class="fontClasses.heading" class="text-2xl">Packages</h2>
      <p :class="fontClasses.body">Choose the path that aligns to your budget and timeline.</p>
    </div>
    <div class="grid gap-4 md:grid-cols-3">
      <article
        v-for="pkg in packageEntries"
        :key="pkg.key"
        class="flex h-full flex-col rounded-2xl border p-5 shadow-sm transition"
        :class="pkg.key === 'best'
          ? 'bg-white/90 shadow-md'
          : 'bg-white'"
        :style="pkg.key === 'best'
          ? { borderColor: brand.primaryColor, backgroundColor: brand.accentColor }
          : { borderColor: '#e2e8f0' }"
      >
        <div class="flex items-center justify-between">
          <span class="text-sm font-semibold uppercase tracking-wide text-slate-500">{{ pkg.data.label }}</span>
          <span
            v-if="pkg.key === 'best'"
            class="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800"
          >
            Most comprehensive
          </span>
          <span v-else-if="pkg.key === 'better'" class="rounded-full bg-slate-50 px-3 py-1 text-xs text-slate-600">
            Enhanced
          </span>
        </div>
        <div class="mt-4 space-y-2">
          <p class="text-3xl font-semibold text-slate-900">
            {{ formatPrice(pkg.data.price) }}
          </p>
          <p class="text-sm text-slate-600">{{ pkg.data.summary }}</p>
        </div>
        <ul class="mt-4 space-y-2 text-sm text-slate-700">
          <li
            v-for="(bullet, index) in pkg.data.bullets"
            :key="index"
            class="flex items-center gap-2"
          >
            <span class="inline-flex h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: brand.primaryColor }" />
            <span>{{ bullet }}</span>
          </li>
        </ul>
        <div class="mt-auto pt-6">
          <button
            type="button"
            class="w-full rounded-2xl border px-4 py-2 text-sm font-semibold transition"
            :style="pkg.key === 'best'
              ? { backgroundColor: brand.primaryColor, color: '#fff', borderColor: brand.primaryColor }
              : { borderColor: brand.primaryColor, color: brand.primaryColor }"
          >
            Select {{ pkg.data.label }}
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSpv2Store } from "../../stores/useSpv2Store";
import { getFontPresetClasses } from "../../utils/theme";

const store = useSpv2Store();

const brand = computed(() => store.brand);
const fontClasses = computed(() => getFontPresetClasses(brand.value.fontPreset));

const packageEntries = computed(() => [
  { key: "good", data: store.packages.good },
  { key: "better", data: store.packages.better },
  { key: "best", data: store.packages.best },
] as const);

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const formatPrice = (value: number) => formatter.format(value);
</script>
