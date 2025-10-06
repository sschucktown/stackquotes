<template>
  <div class="min-h-screen bg-slate-50 px-4 py-12">
    <div class="mx-auto w-full max-w-3xl">
      <div v-if="loading" class="flex h-48 items-center justify-center text-slate-500">
        Loading estimate…
      </div>

      <div
        v-else-if="error"
        class="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-600"
      >
        {{ error }}
      </div>

      <div v-else-if="estimate && client" class="space-y-6">
        <header class="text-center">
          <img
            v-if="settings?.logoUrl"
            :src="settings.logoUrl"
            alt="Company logo"
            class="mx-auto mb-4 h-16 w-auto object-contain"
          />
          <h1 class="text-2xl font-semibold text-slate-900">
            {{ settings?.companyName ?? "Estimate Approval" }}
          </h1>
          <p class="mt-2 text-sm text-slate-600">
            Review and approve estimate <strong>{{ estimate.projectTitle }}</strong>
            for {{ client.name }}.
          </p>
        </header>

        <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-slate-900">Estimate Summary</h2>
          <dl class="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <dt class="text-xs uppercase tracking-wide text-slate-500">Recipient</dt>
              <dd class="text-sm text-slate-800">{{ client.name }}</dd>
              <dd v-if="client.email" class="text-sm text-slate-500">{{ client.email }}</dd>
            </div>
            <div>
              <dt class="text-xs uppercase tracking-wide text-slate-500">Project</dt>
              <dd class="text-sm text-slate-800">{{ estimate.projectTitle }}</dd>
              <dd class="text-sm text-slate-500">
                Created {{ new Date(estimate.createdAt).toLocaleDateString() }}
              </dd>
            </div>
            <div>
              <dt class="text-xs uppercase tracking-wide text-slate-500">Status</dt>
              <dd class="text-sm capitalize text-slate-800">{{ estimate.status }}</dd>
              <dd v-if="approvalTimestamp" class="text-xs text-emerald-600">
                Approved {{ approvalTimestamp }}
              </dd>
            </div>
            <div>
              <dt class="text-xs uppercase tracking-wide text-slate-500">Total</dt>
              <dd class="text-lg font-semibold text-slate-900">
                {{ currency(estimate.total) }}
              </dd>
            </div>
          </dl>
        </section>

        <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-slate-900">Line Items</h2>
          <div class="mt-4 overflow-hidden rounded-lg border border-slate-200">
            <table class="min-w-full divide-y divide-slate-200">
              <thead class="bg-slate-50">
                <tr class="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th class="px-4 py-3">Description</th>
                  <th class="px-4 py-3 text-right">Qty</th>
                  <th class="px-4 py-3 text-right">Unit</th>
                  <th class="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 bg-white text-sm text-slate-700">
                <tr v-for="item in estimate.lineItems" :key="item.id">
                  <td class="px-4 py-3">
                    <p class="font-medium text-slate-900">{{ item.description }}</p>
                    <p v-if="item.cost" class="text-xs text-slate-500">
                      Cost: {{ currency(item.cost) }}
                    </p>
                  </td>
                  <td class="px-4 py-3 text-right">{{ item.quantity.toFixed(2) }}</td>
                  <td class="px-4 py-3 text-right">{{ currency(item.unitPrice) }}</td>
                  <td class="px-4 py-3 text-right font-semibold text-slate-900">
                    {{ currency(item.total) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="mt-4 flex flex-col gap-2 text-sm text-slate-600 md:items-end">
            <div>Subtotal: {{ currency(estimate.subtotal) }}</div>
            <div>Tax: {{ currency(estimate.tax) }}</div>
            <div class="text-base font-semibold text-slate-900">
              Total Due: {{ currency(estimate.total) }}
            </div>
          </div>
          <p v-if="estimate.notes" class="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            {{ estimate.notes }}
          </p>
        </section>

        <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-slate-900">Approve This Estimate</h2>
          <p v-if="approved" class="mt-2 text-sm text-emerald-600">
            Thank you! Your approval has been recorded
            <span v-if="approvalTimestamp">({{ approvalTimestamp }})</span>.
          </p>
          <p v-else class="mt-2 text-sm text-slate-600">
            Confirm your approval to notify {{ settings?.companyName ?? "the contractor" }}.
          </p>

          <div class="mt-4 space-y-4">
            <div class="flex flex-wrap items-center gap-3">
              <a
                v-if="downloadUrl"
                :href="downloadUrl"
                target="_blank"
                rel="noopener"
                class="text-sm font-medium text-blue-600 underline"
              >
                Download PDF
              </a>
              <span v-else class="text-sm text-slate-500">
                PDF generation pending. Refresh this page after a moment.
              </span>
            </div>

            <form v-if="!approved" class="space-y-4" @submit.prevent="onApprove">
              <SQInput v-model="approverName" label="Your name" placeholder="Full name" required />
              <div class="flex flex-wrap items-center gap-3">
                <SQButton type="submit" :loading="approving">Approve Estimate</SQButton>
                <p v-if="approveError" class="text-sm text-red-500">{{ approveError }}</p>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { Client, Estimate, UserSettings } from "@stackquotes/types";
import { fetchSharedEstimate, approveSharedEstimate } from "@modules/public/api/estimates";

const props = defineProps<{
  token: string;
}>();

const loading = ref(true);
const error = ref("");
const estimate = ref<Estimate | null>(null);
const client = ref<Client | null>(null);
const settings = ref<UserSettings | null>(null);
const downloadUrl = ref<string | null>(null);
const approverName = ref("");
const approving = ref(false);
const approveError = ref("");

const approved = computed(
  () => estimate.value?.status === "accepted" || Boolean(estimate.value?.approvedAt)
);

const approvalTimestamp = computed(() => {
  if (!estimate.value?.approvedAt) return null;
  const date = new Date(estimate.value.approvedAt);
  return Number.isNaN(date.getTime()) ? estimate.value.approvedAt : date.toLocaleString();
});

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const currency = (value: number | null | undefined) =>
  currencyFormatter.format(Number.isFinite(Number(value)) ? Number(value) : 0);

async function loadData() {
  loading.value = true;
  error.value = "";
  try {
    const response = await fetchSharedEstimate(props.token);
    if (response.error) {
      error.value = response.error;
      return;
    }
    if (!response.data) {
      error.value = "Unable to load this estimate. Please contact your contractor.";
      return;
    }
    if (!response.data.estimate || !response.data.client) {
      error.value = "This estimate link is no longer valid.";
      return;
    }
    estimate.value = response.data.estimate;
    client.value = response.data.client;
    settings.value = response.data.settings ?? null;
    downloadUrl.value = response.data.downloadUrl ?? null;
    if (!approverName.value && response.data.client?.name) {
      approverName.value = response.data.client.name;
    }
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Unexpected error loading this estimate.";
  } finally {
    loading.value = false;
  }
}

async function onApprove() {
  if (!estimate.value) return;
  approving.value = true;
  approveError.value = "";
  try {
    const payload = approverName.value.trim().length
      ? { name: approverName.value.trim() }
      : {};
    const response = await approveSharedEstimate(props.token, payload);
    if (response.error) {
      approveError.value = response.error;
      return;
    }
    if (response.data) {
      estimate.value = response.data;
    }
  } catch (err) {
    approveError.value =
      err instanceof Error ? err.message : "Unexpected error approving the estimate.";
  } finally {
    approving.value = false;
  }
}

onMounted(() => {
  void loadData();
});
</script>
