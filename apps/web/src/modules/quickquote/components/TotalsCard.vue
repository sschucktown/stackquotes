<template>
  <section
    class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 flex flex-col gap-4"
  >
    <div>
      <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Summary
      </p>
      <h2 class="mt-1 text-sm font-semibold text-slate-900">Totals</h2>
    </div>

    <dl class="space-y-2 text-sm">
      <div class="flex items-center justify-between">
        <dt class="text-slate-500">Subtotal</dt>
        <dd class="font-medium text-slate-900">
          {{ currency(subtotal) }}
        </dd>
      </div>
      <div class="flex items-center justify-between">
        <dt class="text-slate-500">Tax</dt>
        <dd class="font-medium text-slate-900">
          {{ currency(tax) }}
        </dd>
      </div>
      <div class="flex items-center justify-between border-t border-slate-200 pt-2">
        <dt class="text-slate-700">Total</dt>
        <dd class="text-base font-semibold text-slate-900">
          {{ currency(total) }}
        </dd>
      </div>
    </dl>

    <div class="mt-2 flex flex-col gap-2">
      <SQButton
        type="button"
        class="w-full rounded-full"
        :disabled="!canSend || sending"
        :loading="sending"
        @click="onSend"
      >
        Send QuickQuote
      </SQButton>
      <SQButton
        type="button"
        variant="ghost"
        class="w-full rounded-full text-sm"
        :disabled="!canSave || saving"
        :loading="saving"
        @click="onSave"
      >
        Save Draft
      </SQButton>
    </div>

    <p v-if="error" class="text-sm text-red-500">
      {{ error }}
    </p>

    <p
      v-if="lastSentTo"
      class="text-xs text-emerald-700"
    >
      QuickQuote sent to {{ lastSentTo }}.
      <span v-if="approvalUrl">
        Share link:
        <a
          :href="approvalUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="text-[#3A7D99] underline"
        >
          Open
        </a>
      </span>
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import SQButton from "@stackquotes/ui/components/SQButton.vue";
import { useQuickQuoteStore } from "@modules/quickquote/stores/useQuickQuoteStore";

const store = useQuickQuoteStore();

const subtotal = computed(() => store.subtotal);
const tax = computed(() => store.tax);
const total = computed(() => store.total);

const saving = computed(() => store.saving);
const sending = computed(() => store.sending);
const canSave = computed(() => store.canSave);
const canSend = computed(() => store.canSend);
const error = computed(() => store.error);
const lastSentTo = computed(() => store.lastSentTo);
const approvalUrl = computed(() => store.lastApprovalUrl);

const currency = (value: number) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  return formatter.format(value || 0);
};

const onSave = async () => {
  try {
    await store.saveDraft();
  } catch {
  }
};

const onSend = async () => {
  try {
    await store.sendToClient();
  } catch {
  }
};
</script>

