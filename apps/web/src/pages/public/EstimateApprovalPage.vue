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
              <dd class="mt-1 text-sm">
                <span
                  :class="[statusBadgeClass, 'rounded-full px-2 py-1 text-xs font-medium transition-colors']"
                >
                  {{ statusBadgeLabel }}
                </span>
              </dd>
            </div>
            <div>
              <dt class="text-xs uppercase tracking-wide text-slate-500">Total</dt>
              <dd class="text-lg font-semibold text-slate-900">
                {{ currency(displayTotals.total) }}
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
            <div>Subtotal: {{ currency(displayTotals.subtotal) }}</div>
            <div>Tax: {{ currency(displayTotals.tax) }}</div>
            <div class="text-base font-semibold text-slate-900">
              Total Due: {{ currency(displayTotals.total) }}
            </div>
          </div>
          <p v-if="estimate.notes" class="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            {{ estimate.notes }}
          </p>
        </section>

        <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">Next Steps</h2>
              <p class="mt-1 text-sm text-slate-600">
                Approve or decline this estimate. Your contractor will be notified.
              </p>
            </div>
            <span :class="[statusBadgeClass, 'rounded-full px-2 py-1 text-xs font-medium']">{{ statusBadgeLabel }}</span>
          </div>
          <div class="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-60"
              :disabled="actionBusy || isAccepted"
              @click="onApprove"
            >
              <span v-if="actionBusy && pending==='approve'">Approving…</span>
              <span v-else>Approve</span>
            </button>
            <button
              type="button"
              class="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-rose-700 disabled:opacity-60"
              :disabled="actionBusy || isDeclined"
              @click="onDecline"
            >
              <span v-if="actionBusy && pending==='decline'">Declining…</span>
              <span v-else>Decline</span>
            </button>
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
          <p v-if="actionError" class="mt-2 text-sm text-rose-600">{{ actionError }}</p>
          <p v-if="actionMessage" class="mt-2 text-sm text-emerald-700">{{ actionMessage }}</p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { Client, Estimate, UserSettings } from "@stackquotes/types";
import { fetchSharedEstimate, approveSharedEstimate, declineSharedEstimate } from "@modules/public/api/estimates";
import { statusClass, statusLabel } from "@modules/quickquote/utils/status";

const props = defineProps<{
  token: string;
}>();

const loading = ref(true);
const error = ref("");
const estimate = ref<Estimate | null>(null);
const client = ref<Client | null>(null);
const settings = ref<UserSettings | null>(null);
const downloadUrl = ref<string | null>(null);
const statusBadgeClass = computed(() =>
  estimate.value ? statusClass(estimate.value.status) : "bg-slate-200 text-slate-700"
);
const statusBadgeLabel = computed(() =>
  estimate.value ? statusLabel(estimate.value.status) : ""
);

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const currency = (value: number | null | undefined) =>
  currencyFormatter.format(Number.isFinite(Number(value)) ? Number(value) : 0);

// Robust totals for display; prefers computed sum if DB subtotal is zero
const displayTotals = computed(() => {
  const e = estimate.value;
  if (!e) return { subtotal: 0, tax: 0, total: 0 };
  const sumLineItems = () =>
    (e.lineItems ?? []).reduce((sum, item) => sum + Number(item.total ?? (Number(item.quantity ?? 0) * Number(item.unitPrice ?? 0))), 0);
  const computedSubtotal = sumLineItems();
  const dbSubtotal = Number(e.subtotal ?? 0);
  const subtotal = computedSubtotal > 0 ? computedSubtotal : dbSubtotal;
  const dbTax = Number(e.tax ?? 0);
  const dbTotal = Number(e.total ?? 0);
  const computedTotal = subtotal + (dbTax > 0 ? dbTax : Math.max(0, dbTotal - dbSubtotal));
  const total = computedTotal > 0 ? computedTotal : Math.max(dbTotal, subtotal);
  const tax = total - subtotal >= 0 ? total - subtotal : 0;
  return { subtotal, tax, total };
});

// Approve/Decline actions
const isAccepted = computed(() => estimate.value?.status === 'accepted');
const isDeclined = computed(() => estimate.value?.status === 'declined');
const actionBusy = ref(false);
const pending = ref<"approve" | "decline" | null>(null);
const actionError = ref("");
const actionMessage = ref("");

const onApprove = async () => {
  if (!props.token || isAccepted.value) return;
  actionBusy.value = true; pending.value = 'approve'; actionError.value = ""; actionMessage.value = "";
  try {
    const res = await approveSharedEstimate(props.token);
    if ((res as any).error) throw new Error((res as any).error);
    await loadData();
    actionMessage.value = "Thanks! You've approved this estimate.";
  } catch (e: any) {
    actionError.value = e?.message ?? 'Failed to approve.';
  } finally {
    actionBusy.value = false; pending.value = null;
  }
};

const onDecline = async () => {
  if (!props.token || isDeclined.value) return;
  actionBusy.value = true; pending.value = 'decline'; actionError.value = ""; actionMessage.value = "";
  try {
    const res = await declineSharedEstimate(props.token);
    if ((res as any).error) throw new Error((res as any).error);
    await loadData();
    actionMessage.value = "You've declined this estimate.";
  } catch (e: any) {
    actionError.value = e?.message ?? 'Failed to decline.';
  } finally {
    actionBusy.value = false; pending.value = null;
  }
};

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
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Unexpected error loading this estimate.";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void loadData();
});
</script>
