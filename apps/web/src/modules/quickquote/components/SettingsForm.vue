<template>
  <form class="space-y-4" @submit.prevent="save">
    <SQInput v-model="form.companyName" label="Company Name" placeholder="StackQuotes LLC" />
    <SQInput v-model="form.logoUrl" label="Logo URL" placeholder="https://" />
    <div class="space-y-2">
      <label class="text-sm font-medium text-slate-700">Upload Logo</label>
      <input type="file" accept="image/*" @change="onLogoFileChange" />
      <p v-if="logoError" class="text-xs text-red-500">{{ logoError }}</p>
      <p v-else-if="logoUploading" class="text-xs text-slate-500">Uploading...</p>
      <img v-if="form.logoUrl" :src="form.logoUrl" alt="Logo preview" class="h-16 w-auto rounded border border-slate-200" />
    </div>
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
import type { EstimateTemplateKey } from "@stackquotes/types";
import { useSettingsStore } from "@modules/quickquote/stores/settingsStore";

const settingsStore = useSettingsStore();
const saving = ref(false);
const logoUploading = ref(false);
const logoError = ref("");
const DEFAULT_ACCENT = "#2563eb";

const form = reactive<{
  companyName: string;
  logoUrl: string;
  footerText: string;
  defaultTaxRate: number;
  accentColor: string;
  estimateTemplate: EstimateTemplateKey;
  autoAccent: boolean;
}>({
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

const onLogoFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  logoError.value = "";
  logoUploading.value = true;
  try {
    const data = await settingsStore.uploadLogo(file);
    if (data?.logoUrl) {
      form.logoUrl = data.logoUrl;
      form.autoAccent = !data.accentColor;
      if (data.accentColor) {
        form.accentColor = data.accentColor;
      }
    }
  } catch (error) {
    logoError.value = (error as Error).message;
  } finally {
    logoUploading.value = false;
    if (target) {
      target.value = "";
    }
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
