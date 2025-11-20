<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <QuoteHeader />
      <div
        class="mt-6 grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1.5fr)_minmax(0,260px)]"
      >
        <ClientInfoForm />
        <LineItemTable />
        <TotalsCard />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import QuoteHeader from "@modules/quickquote/components/QuoteHeader.vue";
import ClientInfoForm from "@modules/quickquote/components/ClientInfoForm.vue";
import LineItemTable from "@modules/quickquote/components/LineItemTable.vue";
import TotalsCard from "@modules/quickquote/components/TotalsCard.vue";
import { useQuickQuoteStore } from "@modules/quickquote/stores/useQuickQuoteStore";

const store = useQuickQuoteStore();

onMounted(() => {
  if (!store.current) {
    store.createNewQuote();
  }
});
</script>

<style scoped>
</style>
