<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header class="flex flex-col gap-3 rounded-3xl bg-white/90 p-6 shadow-sm ring-1 ring-slate-100 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">SmartProposals</p>
          <h1 class="text-2xl font-semibold text-slate-900">Proposal Studio</h1>
          <p class="text-sm text-slate-600">Edit pricing, tailor deposit terms, and send branded proposals to clients.</p>
        </div>
        <div class="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
          <span class="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          <span>Accepted QuickQuotes automatically initialize SmartProposals.</span>
        </div>
      </header>

      <UpgradeBanner
        v-if="showUpgradeBanner"
        message="Upgrade to StackQuotes Pro to add Better & Best packages, milestones, analytics, and remove the StackQuotes watermark from proposals."
        @upgrade="openUpgrade('SmartProposals')"
      />

      <div v-if="showLoading" class="flex items-center justify-center rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <span class="text-sm text-slate-500">Loading SmartProposals…</span>
      </div>

      <div v-else-if="!form">
        <div class="flex flex-col items-center justify-center gap-4 rounded-3xl bg-white p-12 text-center shadow-sm ring-1 ring-slate-100">
          <h2 class="text-xl font-semibold text-slate-900">No SmartProposals yet</h2>
          <p class="max-w-md text-sm text-slate-600">
            Accept a QuickQuote to generate a SmartProposal automatically, or use the button below to
            generate one from your latest accepted quote.
          </p>
          <SQButton :loading="proposalStore.generating" @click="generateFromLatestQuote">
            Generate from latest QuickQuote
          </SQButton>
        </div>
      </div>

      <div v-else class="grid gap-6 lg:grid-cols-[320px_1fr]">
        <aside class="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold text-slate-800">Your Proposals</h2>
            <span class="text-xs text-slate-500">{{ proposalStore.items.length }}</span>
          </div>
          <div class="flex flex-col gap-2">
            <button
              v-for="proposal in proposalStore.items"
              :key="proposal.id"
              type="button"
              class="flex flex-col rounded-xl border px-4 py-3 text-left transition"
              :class="proposal.id === proposalStore.selectedId
                ? 'border-[#3A7D99] bg-[#3A7D99]/10 text-[#0f3b4d]'
                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'"
              @click="selectProposal(proposal.id)"
            >
              <span class="text-sm font-semibold">{{ proposal.title || fallbackTitle(proposal) }}</span>
              <span class="text-xs text-slate-500">Status: {{ formatStatus(proposal.status) }}</span>
              <span v-if="proposal.sentAt" class="text-xs text-slate-400">
                Sent {{ formatDate(proposal.sentAt) }}
              </span>
            </button>
          </div>
        </aside>

        <main class="space-y-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <section class="flex flex-col gap-4 border-b border-slate-100 pb-6">
            <div class="flex flex-wrap items-start gap-4 sm:items-center sm:justify-between">
              <div class="flex flex-col gap-2">
                <SQInput v-model="form.title" label="Proposal title" placeholder="Enter proposal title" />
                <p class="text-xs text-slate-500">
                  Client: <span class="font-medium text-slate-700">{{ clientName }}</span>
                </p>
              </div>
              <div class="flex flex-col items-end gap-2">
                <span class="text-xs uppercase tracking-wide text-slate-500">Status</span>
                <span :class="statusChipClass">{{ formatStatus(form.status) }}</span>
              </div>
            </div>
            <SQTextarea
              v-model="form.description"
              label="Project overview"
              placeholder="Add context, scope notes, or milestone highlights for your client"
              rows="3"
            />
          </section>

          <section class="flex flex-col gap-4 border-b border-slate-100 pb-6">
            <h3 class="text-sm font-semibold text-slate-800">Deposit configuration</h3>
            <div class="flex flex-wrap items-end gap-4">
              <div class="flex items-center gap-3">
                <label class="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    v-model="form.deposit.type"
                    type="radio"
                    class="h-4 w-4 border-slate-300 text-[#3A7D99] focus:ring-[#3A7D99]"
                    value="percentage"
                  />
                  Percentage
                </label>
                <label class="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    v-model="form.deposit.type"
                    type="radio"
                    class="h-4 w-4 border-slate-300 text-[#3A7D99] focus:ring-[#3A7D99]"
                    value="fixed"
                  />
                  Fixed amount
                </label>
              </div>
              <SQInput
                v-model.number="form.deposit.value"
                :label="form.deposit.type === 'percentage' ? 'Deposit (%)' : 'Deposit amount ($)'"
                type="number"
                min="0"
                step="0.5"
                class="w-40"
              />
              <div class="flex flex-col text-sm text-slate-600">
                <span class="font-semibold text-slate-800">Client pays {{ formatCurrency(depositAmount) }} at acceptance</span>
                <span class="text-xs text-slate-500">{{ depositReferenceLabel }}</span>
              </div>
            </div>
          </section>

          <section v-for="(option, optionIndex) in form.options" :key="option.id" class="space-y-4 rounded-2xl border border-slate-200 p-4">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 class="text-base font-semibold text-slate-800">{{ option.name }}</h3>
                <SQTextarea
                  v-model="option.summary"
                  :label="`${option.name} summary`"
                  rows="2"
                  placeholder="Describe what's included in this package"
                />
              </div>
              <SQButton size="sm" variant="ghost" @click="addLineItem(optionIndex)">
                Add line item
              </SQButton>
            </div>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-slate-200 text-sm">
                <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th class="px-3 py-2 text-left">Line Item</th>
                    <th class="px-3 py-2 text-right">Qty</th>
                    <th class="px-3 py-2 text-right">Unit Cost</th>
                    <th class="px-3 py-2 text-right">Total</th>
                    <th class="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="(item, itemIndex) in option.lineItems" :key="item.id" class="align-top">
                    <td class="px-3 py-3">
                      <SQInput
                        v-model="item.description"
                        placeholder="Describe the work item"
                      />
                    </td>
                    <td class="px-3 py-3">
                      <SQInput
                        v-model.number="item.quantity"
                        type="number"
                        min="0"
                        step="0.1"
                        class="text-right"
                        @update:model-value="onLineItemChange(optionIndex, itemIndex)"
                      />
                    </td>
                    <td class="px-3 py-3">
                      <SQInput
                        v-model.number="item.unitCost"
                        type="number"
                        min="0"
                        step="0.01"
                        class="text-right"
                        @update:model-value="onLineItemChange(optionIndex, itemIndex)"
                      />
                    </td>
                    <td class="px-3 py-3 text-right font-semibold text-slate-800">
                      {{ formatCurrency(item.total) }}
                    </td>
                    <td class="px-3 py-3 text-right">
                      <button
                        type="button"
                        class="text-xs font-medium text-rose-500 hover:text-rose-600"
                        @click="removeLineItem(optionIndex, itemIndex)"
                        :disabled="option.lineItems.length === 1"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" class="px-3 py-3 text-right text-xs uppercase tracking-wide text-slate-500">
                      Subtotal
                    </td>
                    <td class="px-3 py-3 text-right text-base font-semibold text-slate-900">
                      {{ formatCurrency(option.subtotal) }}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          <div
            v-if="isFree"
            class="flex flex-col gap-3 rounded-2xl border border-blue-200 bg-blue-50/80 p-4 text-sm text-blue-800"
          >
            <p class="font-semibold">Upgrade to add Better &amp; Best packages</p>
            <p>
              Free plans support a single proposal package. Upgrade to StackQuotes Pro to add Good/Better/Best options,
              build milestones, and remove the StackQuotes watermark.
            </p>
            <button
              type="button"
              class="self-start rounded-lg bg-[#2563eb] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1d4ed8]"
              @click="openUpgrade('Multi-option proposals')"
            >
              Unlock multi-option proposals
            </button>
          </div>

          <section class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label class="text-sm font-semibold text-slate-800">Client email subject</label>
            <SQInput v-model="form.subject" placeholder="Proposal email subject" />
            <label class="text-sm font-semibold text-slate-800">Client email message</label>
            <SQTextarea v-model="form.message" rows="3" placeholder="Optional note that appears in the email body" />
          </section>

          <section class="flex flex-wrap items-center justify-between gap-3 pt-4">
            <div class="text-xs text-slate-500">
              Last updated {{ formatDate(currentProposal?.updatedAt ?? currentProposal?.createdAt ?? new Date().toISOString()) }}
            </div>
            <div class="flex flex-wrap gap-3">
              <SQButton
                variant="ghost"
                :loading="proposalStore.saving"
                :disabled="!canSave"
                @click="handleSave"
              >
                Save draft
              </SQButton>
              <SQButton
                :loading="proposalStore.sending"
                :disabled="!canSend"
                class="!bg-[#3A7D99] !text-white hover:!bg-[#4f8faa]"
                @click="handleSend"
              >
                Send to client
              </SQButton>
            </div>
          </section>
        </main>
      </div>

      <div
        v-if="toasts.length"
        class="pointer-events-none fixed right-6 top-6 z-50 flex flex-col gap-2"
      >
        <transition-group name="toast" tag="div">
          <div
            v-for="toast in toasts"
            :key="toast.id"
            class="pointer-events-auto flex min-w-[240px] items-center gap-3 rounded-xl border px-4 py-3 shadow-sm"
            :class="toast.tone === 'success'
              ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
              : 'border-rose-100 bg-rose-50 text-rose-700'"
          >
            <span class="text-sm">{{ toast.message }}</span>
          </div>
        </transition-group>
      </div>

      <UpgradeModal :open="upgradeModalOpen" :feature="upgradeFeature" @close="upgradeModalOpen = false" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import SQButton from "@stackquotes/ui/components/SQButton.vue";
import SQInput from "@stackquotes/ui/components/SQInput.vue";
import SQTextarea from "@stackquotes/ui/components/SQTextarea.vue";
import { useProposalStore } from "@modules/proposals/stores/proposalStore";
import { useEstimateStore } from "@modules/quickquote/stores/estimateStore";
import { useClientStore } from "@modules/quickquote/stores/clientStore";
import { useDemoStore } from "@/stores/demoStore";
import { useTier } from "@/composables/useTier";
import UpgradeBanner from "@/components/billing/UpgradeBanner.vue";
import UpgradeModal from "@/components/billing/UpgradeModal.vue";
import type { Proposal, ProposalDepositConfig, ProposalOption } from "@stackquotes/types";
import type { ProposalSavePayload, ProposalSendPayload } from "@modules/proposals/api/proposals";

interface LineItemForm {
  id: string;
  description: string;
  quantity: number;
  unitCost: number;
  total: number;
}

interface OptionForm {
  id: string;
  name: string;
  summary: string | null;
  multiplier?: number | null;
  lineItems: LineItemForm[];
  subtotal: number;
}

interface ProposalForm {
  id: string | null;
  clientId: string;
  quickquoteId: string | null;
  title: string;
  description: string;
  options: OptionForm[];
  deposit: ProposalDepositConfig;
  subject: string;
  message: string;
  status: string;
}

interface ToastMessage {
  id: number;
  message: string;
  tone: "success" | "error";
}

const proposalStore = useProposalStore();
const estimateStore = useEstimateStore();
const clientStore = useClientStore();
const demoStore = useDemoStore();
const { isPro } = useTier();
const isFree = computed(() => !isPro.value);
const showUpgradeBanner = computed(() => isFree.value);
const upgradeModalOpen = ref(false);
const upgradeFeature = ref<string | undefined>(undefined);
const openUpgrade = (feature?: string) => {
  upgradeFeature.value = feature;
  upgradeModalOpen.value = true;
};

const form = ref<ProposalForm | null>(null);
const toasts = ref<ToastMessage[]>([]);
const initializing = ref(true);
const recommendedSubtotal = computed(() => {
  if (!form.value) return 0;
  const options = form.value.options;
  const preferred = options.find((option) => option.name.toLowerCase() === "better");
  return preferred?.subtotal ?? options[0]?.subtotal ?? 0;
});

const depositAmount = computed(() => {
  if (!form.value) return 0;
  return calculateDepositAmount(form.value.options, form.value.deposit);
});

const depositReferenceLabel = computed(() =>
  isFree.value ? "Based on this package subtotal." : "Based on the Better package subtotal."
);

const clientName = computed(() => {
  if (!form.value) return "";
  const client = clientStore.items.find((item) => item.id === form.value?.clientId);
  return client?.name ?? "Unknown client";
});

const currentProposal = computed<Proposal | null>(() => proposalStore.current);
const showLoading = computed(() => initializing.value || proposalStore.loading);
const statusChipClass = computed(() => {
  const status = form.value?.status ?? "draft";
  const base = "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold";
  switch (status) {
    case "sent":
      return `${base} bg-blue-100 text-blue-700`;
    case "accepted":
      return `${base} bg-emerald-100 text-emerald-700`;
    case "paid":
      return `${base} bg-indigo-100 text-indigo-700`;
    default:
      return `${base} bg-slate-100 text-slate-600`;
  }
});

const canSave = computed(() => Boolean(form.value && form.value.title.trim() && form.value.options.length));
const canSend = computed(() => Boolean(form.value?.id && canSave.value && form.value?.subject.trim()));

const showToast = (message: string, tone: ToastMessage["tone"] = "success") => {
  const id = Date.now() + Math.floor(Math.random() * 1000);
  toasts.value.push({ id, message, tone });
  window.setTimeout(() => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
  }, 4000);
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const formatStatus = (status: string) => {
  const normalised = status?.toLowerCase?.() ?? "draft";
  if (normalised === "sent") return "Sent";
  if (normalised === "accepted") return "Accepted";
  if (normalised === "paid") return "Paid";
  return "Draft";
};

const formatDate = (iso: string) => {
  try {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
      new Date(iso)
    );
  } catch {
    return "recently";
  }
};

const fallbackTitle = (proposal: Proposal) => proposal.title || `Proposal ${proposal.id.slice(0, 6).toUpperCase()}`;

const calculateDepositAmount = (options: OptionForm[] | ProposalOption[], deposit: ProposalDepositConfig): number => {
  if (deposit.type === "fixed") {
    return Math.round(deposit.value * 100) / 100;
  }
  const list = options as ProposalOption[];
  const target = list.find((option) => option.name.toLowerCase() === "better") ?? list[0] ?? null;
  if (!target) return 0;
  return Math.round(target.subtotal * (deposit.value / 100) * 100) / 100;
};

const initialiseForm = (proposal: Proposal) => {
  const mapLineItem = (item: ProposalOption["lineItems"][number]): LineItemForm => ({
    id: item.id ?? crypto.randomUUID(),
    description: item.description,
    quantity: item.quantity,
    unitCost: item.unitCost,
    total: item.total,
  });

  const mapOption = (option: ProposalOption): OptionForm => ({
    id: crypto.randomUUID(),
    name: option.name,
    summary: option.summary ?? "",
    multiplier: option.multiplier ?? null,
    lineItems: option.lineItems.map(mapLineItem),
    subtotal: option.subtotal,
  });

  const depositConfig: ProposalDepositConfig = proposal.depositConfig ?? {
    type: proposal.depositType ?? "percentage",
    value: proposal.depositValue ?? 30,
  };

  let optionForms = proposal.options.map(mapOption);
  if (!optionForms.length) {
    optionForms = [
      {
        id: crypto.randomUUID(),
        name: "Proposal",
        summary: "",
        multiplier: null,
        lineItems: [
          {
            id: crypto.randomUUID(),
            description: "",
            quantity: 1,
            unitCost: 0,
            total: 0,
          },
        ],
        subtotal: 0,
      },
    ];
  }

  if (isFree.value) {
    const primary = optionForms[0];
    primary.name = primary.name || "Proposal";
    optionForms = [primary];
  }

  form.value = {
    id: proposal.id,
    clientId: proposal.clientId,
    quickquoteId: proposal.quickquoteId ?? null,
    title: proposal.title || fallbackTitle(proposal),
    description: proposal.description ?? "",
    options: optionForms,
    deposit: depositConfig,
    subject: `Proposal: ${proposal.title || fallbackTitle(proposal)}`,
    message: "",
    status: proposal.status ?? "draft",
  };
  form.value.options.forEach((option) => recomputeOptionTotals(option));
};

const recomputeOptionTotals = (option: OptionForm) => {
  option.lineItems.forEach((item) => {
    item.total = roundCurrency(item.quantity * item.unitCost);
  });
  option.subtotal = roundCurrency(option.lineItems.reduce((sum, item) => sum + item.total, 0));
};

const roundCurrency = (value: number): number => Math.round(value * 100) / 100;

const selectProposal = (id: string) => {
  proposalStore.setSelected(id);
};

const onLineItemChange = (optionIndex: number, itemIndex: number) => {
  const current = form.value;
  if (!current) return;
  const option = current.options[optionIndex];
  const item = option.lineItems[itemIndex];
  if (!Number.isFinite(item.quantity)) item.quantity = 0;
  if (!Number.isFinite(item.unitCost)) item.unitCost = 0;
  recomputeOptionTotals(option);
};

const addLineItem = (optionIndex: number) => {
  const current = form.value;
  if (!current) return;
  const option = current.options[optionIndex];
  option.lineItems.push({
    id: crypto.randomUUID(),
    description: "",
    quantity: 1,
    unitCost: 0,
    total: 0,
  });
  recomputeOptionTotals(option);
};

const removeLineItem = (optionIndex: number, itemIndex: number) => {
  const current = form.value;
  if (!current) return;
  const option = current.options[optionIndex];
  if (option.lineItems.length === 1) return;
  option.lineItems.splice(itemIndex, 1);
  recomputeOptionTotals(option);
};

const ensureLatestGenerated = async () => {
  const demo = demoStore.active;
  if (!proposalStore.hasData) {
    await estimateStore.load({ status: "accepted" });
  }
  const accepted = estimateStore.items
    .filter((estimate) => estimate.status === "accepted")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  const target = accepted[0];
  if (!target) {
    showToast("No accepted QuickQuotes available to generate from.", "error");
    return;
  }
  await proposalStore.generate(target.id, demo ? target : undefined);
};

const generateFromLatestQuote = async () => {
  try {
    await ensureLatestGenerated();
    if (proposalStore.current) {
      initialiseForm(proposalStore.current);
      showToast("Generated SmartProposal from latest QuickQuote.");
    }
  } catch (error) {
    console.error(error);
    showToast("Unable to generate SmartProposal.", "error");
  }
};

const handleSave = async () => {
  if (!form.value) return;
  try {
    const payload: ProposalSavePayload = {
      id: form.value.id ?? undefined,
      clientId: form.value.clientId,
      quickquoteId: form.value.quickquoteId ?? undefined,
      title: form.value.title.trim(),
      description: form.value.description.trim() || null,
      options: form.value.options.map((option) => ({
        name: option.name,
        summary: option.summary,
        multiplier: option.multiplier ?? null,
        subtotal: option.subtotal,
        lineItems: option.lineItems.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitCost: item.unitCost,
          total: item.total,
        })),
      })),
      deposit: form.value.deposit,
    };
    const saved = await proposalStore.save(payload);
    if (saved) {
      initialiseForm(saved);
      showToast("Draft saved.");
    }
  } catch (error) {
    console.error(error);
    showToast(error instanceof Error ? error.message : "Unable to save draft.", "error");
  }
};

const handleSend = async () => {
  if (!form.value?.id) {
    await handleSave();
    if (!form.value?.id) return;
  }
  try {
    const payload: ProposalSendPayload = {
      id: form.value.id!,
      subject: form.value.subject.trim(),
      message: form.value.message.trim() || undefined,
      deposit: form.value.deposit,
    };
    const sent = await proposalStore.send(payload);
    if (sent) {
      initialiseForm(sent);
      showToast("Proposal sent to client.");
    }
  } catch (error) {
    console.error(error);
    showToast(error instanceof Error ? error.message : "Unable to send proposal.", "error");
  }
};

watch(
  () => proposalStore.current,
  (proposal) => {
    if (proposal) {
      initialiseForm(proposal);
    }
  },
  { immediate: true }
);

watch(
  () => proposalStore.items.length,
  (length) => {
    if (!length) {
      form.value = null;
    }
  }
);

onMounted(async () => {
  await Promise.all([proposalStore.load(), clientStore.load()]);
  if (!proposalStore.current) {
    await ensureLatestGenerated();
  }
  if (proposalStore.current) {
    initialiseForm(proposalStore.current);
  }
  initializing.value = false;
});
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>






