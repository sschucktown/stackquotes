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
    <div class="flex flex-col gap-3 md:flex-row md:items-end md:gap-4">
      <SQInput
        v-model="form.accentColor"
        label="Accent Color"
        type="color"
        :disabled="form.autoAccent"
      />
      <SQButton type="button" variant="ghost" size="sm" @click="toggleAccentMode">
        {{ form.autoAccent ? 'Use custom accent color' : 'Use automatic accent color' }}
      </SQButton>
    </div>
    <SQSelect v-model="form.estimateTemplate" label="Default Estimate Template">
      <option value="modern">Modern Minimal</option>
      <option value="premium">Premium Bold</option>
      <option value="classic">Classic Contractor</option>
    </SQSelect>
    <SQButton type="submit" :loading="saving">Save Settings</SQButton>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref, watchEffect } from "vue";
import { useSettingsStore } from "@modules/quickquote/stores/settingsStore";

const settingsStore = useSettingsStore();
const saving = ref(false);
const DEFAULT_ACCENT = "#2563eb";

const form = reactive({
  companyName: "",
  logoUrl: "",
  footerText: "",
  defaultTaxRate: 0,
  accentColor: DEFAULT_ACCENT,
  estimateTemplate: "modern",
  autoAccent: true,
});

watchEffect(() => {
  if (settingsStore.data) {
    form.companyName = settingsStore.data.companyName ?? "";
    form.logoUrl = settingsStore.data.logoUrl ?? "";
    form.footerText = settingsStore.data.footerText ?? "";
    form.defaultTaxRate = settingsStore.data.defaultTaxRate ?? 0;
    form.accentColor = settingsStore.data.accentColor ?? DEFAULT_ACCENT;
    form.autoAccent = !settingsStore.data.accentColor;
    form.estimateTemplate = settingsStore.data.estimateTemplate ?? "modern";
  } else {
    form.accentColor = DEFAULT_ACCENT;
    form.autoAccent = true;
    form.estimateTemplate = "modern";
  }
});

const toggleAccentMode = () => {
  form.autoAccent = !form.autoAccent;
  if (!form.autoAccent && !form.accentColor) {
    form.accentColor = DEFAULT_ACCENT;
  }
};

const save = async () => {
  saving.value = true;
  try {
    await settingsStore.update({
      companyName: form.companyName || undefined,
      logoUrl: form.logoUrl || undefined,
      footerText: form.footerText || undefined,
      defaultTaxRate: form.defaultTaxRate,
      accentColor: form.autoAccent ? null : form.accentColor,
      estimateTemplate: form.estimateTemplate,
    });
  } finally {
    saving.value = false;
  }
};
</script>
