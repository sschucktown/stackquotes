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

      <!-- Current status badge between subtitle and form -->
      <div v-if="!isNew && currentEstimate" class="flex items-center gap-2">
        <span class="text-xs uppercase tracking-wide text-slate-500">Current Status</span>
        <span
          :class="[
            currentStatusClass,
            'rounded-full px-2 py-1 text-xs font-medium transition-colors',
          ]"
        >
          {{ currentStatusLabel }}
        </span>
      </div>

      <EstimateForm
        :model-value="currentEstimate"
        :submitting="saving"
        :submit-label="isNew ? 'Create Estimate' : 'Save Changes'"
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

      <section
        v-if="!isNew && currentEstimate"
        class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">Status Actions</h2>
            <p class="text-sm text-slate-500">
              Record the latest decision after reviewing the estimate with your client.
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs uppercase tracking-wide text-slate-500">Current Status</span>
            <span
              :class="[
                currentStatusClass,
                'rounded-full px-2 py-1 text-xs font-medium transition-colors',
              ]"
            >
              {{ currentStatusLabel }}
            </span>
          </div>
        </div>
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <SQButton
            type="button"
            variant="primary"
            :disabled="statusUpdating || isAccepted"
            :loading="statusUpdating && pendingStatus === 'accept'"
            class="!bg-emerald-500 hover:!bg-emerald-600 focus-visible:!ring-emerald-500/60"
            @click="markAccepted"
          >
            Mark as Accepted
          </SQButton>
          <SQButton
            type="button"
            variant="danger"
            :disabled="statusUpdating || isDeclined"
            :loading="statusUpdating && pendingStatus === 'decline'"
            @click="markDeclined"
          >
            Mark as Declined
          </SQButton>
        </div>
        <p class="mt-3 text-xs text-slate-500">
          Status changes update the dashboard pipeline instantly.
        </p>
        <p v-if="statusError" class="mt-2 text-sm text-red-500">{{ statusError }}</p>
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
import type { EstimateTemplateKey } from "@stackquotes/types";
import type { EstimateFormPayload } from "@modules/quickquote/composables/useEstimateForm";
import { statusClass as statusClassName, statusLabel as statusLabelName } from "@modules/quickquote/utils/status";

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
const statusUpdating = ref(false);
const pendingStatus = ref<"accept" | "decline" | null>(null);
const statusError = ref("");

const replyPrompt =
  "When you're ready to move forward, simply reply to this email and we'll put together a detailed proposal with a few options to choose from.";
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const formatCurrency = (value: number) => currencyFormatter.format(value);
const buildEmailMessage = (name: string, total: number) =>
  `Hi ${name},\n\nPlease review your estimate totaling ${formatCurrency(total)}.\n\n${replyPrompt}\n`;

const emailForm = reactive<{
  to: string;
  subject: string;
  message: string;
  template: EstimateTemplateKey;
}>({
  to: "",
  subject: "",
  message: buildEmailMessage("there", 0),
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

// tax rate removed
const currentStatusClass = computed(() =>
  currentEstimate.value ? statusClassName(currentEstimate.value.status) : "bg-slate-200 text-slate-700"
);
const currentStatusLabel = computed(() =>
  currentEstimate.value ? statusLabelName(currentEstimate.value.status) : ""
);
const isAccepted = computed(() => currentEstimate.value?.status === "accepted");
const isDeclined = computed(() => currentEstimate.value?.status === "declined");

watch(
  currentEstimate,
  (estimate) => {
    if (estimate) {
      emailForm.subject = `Estimate - ${estimate.projectTitle}`;
      const clientName = currentClient.value?.name ?? "there";
      emailForm.message = buildEmailMessage(clientName, estimate.total);
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
        // ensure no tax applied
        taxRate: 0,
      });
      if (result) {
        router.replace(`/quickquotes/${result.id}`);
      }
    } else if (currentEstimate.value) {
      await estimateStore.update(currentEstimate.value.id, {
        clientId: payload.clientId,
        projectTitle: payload.projectTitle,
        lineItems: payload.lineItems,
        notes: payload.notes,
        // ensure no tax applied
        taxRate: 0,
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

const markAccepted = async () => {
  if (!currentEstimate.value || isAccepted.value) return;
  statusUpdating.value = true;
  pendingStatus.value = "accept";
  statusError.value = "";
  try {
    await estimateStore.markAccepted(currentEstimate.value.id);
  } catch (error) {
    statusError.value =
      error instanceof Error ? error.message : "Failed to update the estimate status.";
  } finally {
    statusUpdating.value = false;
    pendingStatus.value = null;
  }
};

const markDeclined = async () => {
  if (!currentEstimate.value || isDeclined.value) return;
  statusUpdating.value = true;
  pendingStatus.value = "decline";
  statusError.value = "";
  try {
    await estimateStore.markDeclined(currentEstimate.value.id);
  } catch (error) {
    statusError.value =
      error instanceof Error ? error.message : "Failed to update the estimate status.";
  } finally {
    statusUpdating.value = false;
    pendingStatus.value = null;
  }
};

const goBack = () => {
  router.back();
};
</script>
