<template>
  <footer class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
    <div class="flex flex-col gap-2 border-b border-slate-100 pb-4">
      <p :class="fontClasses.accent">Questions?</p>
      <h2 :class="fontClasses.heading" class="text-2xl">
        {{ footer.companyName }}
      </h2>
      <p :class="fontClasses.body" class="text-sm">
        License {{ footer.license }} • {{ footer.address }}
      </p>
    </div>
    <div class="mt-4 grid gap-4 text-sm text-slate-700 md:grid-cols-2">
      <div class="space-y-1">
        <p class="text-xs uppercase tracking-wide text-slate-500">Phone</p>
        <p>{{ footer.phone }}</p>
      </div>
      <div class="space-y-1">
        <p class="text-xs uppercase tracking-wide text-slate-500">Email</p>
        <p>{{ footer.email }}</p>
      </div>
    </div>
    <div class="mt-4 text-xs text-slate-500">
      Powered by SmartProposal V2 sandbox. Client preview inherits the same look/feel.
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useSpv2Store } from "../../stores/useSpv2Store";
import { getFontPresetClasses } from "../../utils/theme";

const store = useSpv2Store();
const footer = computed(() => store.companyFooter);
const fontClasses = computed(() => getFontPresetClasses(store.brand.fontPreset));
</script>
