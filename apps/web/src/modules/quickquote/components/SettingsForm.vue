<template>
  <form class="space-y-4" @submit.prevent="save">
    <SQInput v-model="form.companyName" label="Company Name" placeholder="StackQuotes LLC" />
    <SQInput v-model="form.logoUrl" label="Logo URL" placeholder="https://" />
    <SQTextarea v-model="form.footerText" label="Footer" placeholder="Thanks for your business!" />
    <SQInput
      v-model.number="form.defaultTaxRate"
      label="Default Tax Rate"
      type="number"
      min="0"
      max="1"
      step="0.01"
    />
    <SQButton type="submit" :loading="saving">Save Settings</SQButton>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref, watchEffect } from "vue";
import { useSettingsStore } from "@modules/quickquote/stores/settingsStore";

const settingsStore = useSettingsStore();
const saving = ref(false);
const form = reactive({
  companyName: "",
  logoUrl: "",
  footerText: "",
  defaultTaxRate: 0,
});

watchEffect(() => {
  if (settingsStore.data) {
    form.companyName = settingsStore.data.companyName ?? "";
    form.logoUrl = settingsStore.data.logoUrl ?? "";
    form.footerText = settingsStore.data.footerText ?? "";
    form.defaultTaxRate = settingsStore.data.defaultTaxRate ?? 0;
  }
});

const save = async () => {
  saving.value = true;
  try {
    await settingsStore.update({ ...form });
  } finally {
    saving.value = false;
  }
};
</script>
