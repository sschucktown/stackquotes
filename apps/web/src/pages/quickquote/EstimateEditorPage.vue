<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="text-2xl font-semibold text-slate-900">
            {{ isNew ? "Create Estimate" : currentEstimate?.projectTitle }}
          </h1>
          <p class="text-sm text-slate-500">
            Draft, duplicate, preview, and send professional estimates.
          </p>
        </div>
        <div class="flex gap-2">
          <SQButton variant="ghost" @click="goBack">Back</SQButton>
          <SQButton variant="ghost" :disabled="isNew || !currentEstimate" @click="previewPdf">Preview PDF</SQButton>
        </div>
      </div>

      <EstimateForm
        :model-value="currentEstimate"
        :submitting="saving"
        :submit-label="isNew ? 'Create Estimate' : 'Save Changes'"
        :default-tax-rate="defaultTaxRate"
        @submit="save"
      />

      <section v-if="!isNew && currentEstimate" class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-slate-900">Send Estimate</h2>
        <p class="text-sm text-slate-500">Share via email directly from QuickQuote.</p>
        <form class="mt-4 grid gap-4 md:grid-cols-2" @submit.prevent="sendEmail">
          <SQInput v-model="emailForm.to" type="email" label="Recipient" required />
          <SQInput v-model="emailForm.subject" label="Subject" required />
          <SQSelect v-model="emailForm.template" label="Template">
            <option value="modern">Modern Minimal</option>
            <option value="premium">Premium Bold</option>
            <option value="classic">Classic Contractor</option>
          </SQSelect>
          <div class="md:col-span-2">
            <SQTextarea v-model="emailForm.message" label="Message" rows="4" required />
          </div>
          <div class="md:col-span-2 flex justify-end">
            <SQButton type="submit" :loading="emailSending">Send Email</SQButton>
          </div>
        </form>
        <p v-if="emailError" class="mt-2 text-sm text-red-500">{{ emailError }}</p>
        <p v-if="emailSuccess" class="mt-2 text-sm text-emerald-600">Email sent successfully.</p>
      </section>

      <PDFPreviewModal
        :open="showPdf"
        :pdf-url="estimateStore.activePdfUrl"
        @close="closePdf"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import EstimateForm from "@modules/quickquote/components/EstimateForm.vue";
import PDFPreviewModal from "@modules/quickquote/components/PDFPreviewModal.vue";
import { useEstimateStore } from "@modules/quickquote/stores/estimateStore";
import { useClientStore } from "@modules/quickquote/stores/clientStore";
import { useSettingsStore } from "@modules/quickquote/stores/settingsStore";
import type { EstimateFormPayload } from "@modules/quickquote/composables/useEstimateForm";

const props = defineProps<{ id: string }>();
const router = useRouter();
const estimateStore = useEstimateStore();
const clientStore = useClientStore();
const settingsStore = useSettingsStore();

const saving = ref(false);
const showPdf = ref(false);
const emailSending = ref(false);
const emailSuccess = ref(false);
const emailError = ref("");
const templateInitialized = ref(false);

const emailForm = reactive({
  to: "",
  subject: "",
  message: "Hi there,\n\nPlease review the attached estimate and let me know if you have any questions.\n",
  template: "modern",
});

const isNew = computed(() => props.id === "new");

onMounted(() => {
  if (!estimateStore.items.length) {
    estimateStore.load();
  }
  if (!clientStore.items.length) {
    clientStore.load();
  }
  if (!settingsStore.data && !settingsStore.loading) {
    settingsStore.load();
  }
});

const currentEstimate = computed(() => {
  if (isNew.value) return null;
  return estimateStore.getById(props.id);
});

const currentClient = computed(() => {
  if (!currentEstimate.value) return null;
  return clientStore.items.find((client) => client.id === currentEstimate.value?.clientId) ?? null;
});

const defaultTaxRate = computed(() => settingsStore.data?.defaultTaxRate);

watch(
  currentEstimate,
  (estimate) => {
    if (estimate) {
      emailForm.subject = `Estimate - ${estimate.projectTitle}`;
      const clientName = currentClient.value?.name ?? "there";
      emailForm.message = `Hi ${clientName},\n\nPlease review your estimate totaling $${estimate.total.toFixed(2)}.`;
    }
  },
  { immediate: true }
);

watch(currentClient, (client) => {
  if (client?.email) {
    emailForm.to = client.email;
  }
});

watch(
  () => settingsStore.data?.estimateTemplate,
  (template) => {
    if (template && !templateInitialized.value) {
      emailForm.template = template;
      templateInitialized.value = true;
    }
  },
  { immediate: true }
);

watch(
  () => emailForm.template,
  () => {
    if (!templateInitialized.value) {
      templateInitialized.value = true;
    }
  }
);

const save = async (payload: EstimateFormPayload) => {
  saving.value = true;
  try {
    if (isNew.value) {
      const result = await estimateStore.create({
        clientId: payload.clientId,
        projectTitle: payload.projectTitle,
        lineItems: payload.lineItems,
        notes: payload.notes,
        taxRate: payload.taxRate,
      });
      if (result) {
        router.replace(`/quickquote/estimates/${result.id}`);
      }
    } else if (currentEstimate.value) {
      await estimateStore.update(currentEstimate.value.id, {
        clientId: payload.clientId,
        projectTitle: payload.projectTitle,
        lineItems: payload.lineItems,
        notes: payload.notes,
        taxRate: payload.taxRate,
      });
    }
  } finally {
    saving.value = false;
  }
};

const previewPdf = async () => {
  if (!currentEstimate.value) return;
  await estimateStore.createPdf(currentEstimate.value.id);
  showPdf.value = true;
};

const closePdf = () => {
  showPdf.value = false;
  estimateStore.activePdfUrl = null;
};

const sendEmail = async () => {
  if (!currentEstimate.value) return;
  emailSending.value = true;
  emailSuccess.value = false;
  emailError.value = "";
  try {
    const pdf = await estimateStore.createPdf(currentEstimate.value.id);
    await estimateStore.emailEstimate({
      estimateId: currentEstimate.value.id,
      to: emailForm.to,
      subject: emailForm.subject,
      message: emailForm.message,
      downloadUrl: pdf?.downloadUrl ?? undefined,
      template: emailForm.template,
    });
    emailSuccess.value = true;
  } catch (error) {
    emailError.value = (error as Error).message;
  } finally {
    emailSending.value = false;
  }
};

const goBack = () => {
  router.back();
};
</script>
