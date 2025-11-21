<template>
  <section class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
    <div class="flex flex-col gap-1">
      <p :class="fontClasses.accent">Investment & timing</p>
      <h2 :class="fontClasses.heading" class="text-2xl">Deposit & payment terms</h2>
    </div>
    <div class="mt-4 grid gap-4 md:grid-cols-2">
      <div class="rounded-2xl border border-slate-200 p-4">
        <p class="text-sm font-semibold text-slate-500">Deposit</p>
        <p class="mt-2 text-3xl font-semibold text-slate-900">
          {{ depositSummary }}
        </p>
        <p class="mt-2 text-sm text-slate-600">
          Secures your project date and allows us to begin ordering custom materials.
        </p>
      </div>
      <div class="rounded-2xl border border-slate-200 p-4">
        <p class="text-sm font-semibold text-slate-500">Notes</p>
        <p class="mt-2 text-sm text-slate-600">
          {{ paymentTerms.notes }}
        </p>
      </div>
    </div>
    <div class="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
      <span class="font-semibold text-slate-900">Timeline:</span>
      We schedule projects 2-3 weeks in advance. Early deposit = priority slot.
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSpv2Store } from "../../stores/useSpv2Store";
import { getFontPresetClasses } from "../../utils/theme";

const store = useSpv2Store();
const paymentTerms = computed(() => store.paymentTerms);
const fontClasses = computed(() => getFontPresetClasses(store.brand.fontPreset));

const depositSummary = computed(() => {
  const terms = paymentTerms.value;
  if (terms.depositType === "percent") {
    return `${terms.depositValue}% deposit`;
  }
  return `$${terms.depositValue.toLocaleString()} deposit`;
});
</script>
