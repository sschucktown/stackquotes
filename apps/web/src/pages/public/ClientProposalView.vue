<template>
  <div class="min-h-screen bg-slate-50 px-4 py-10">
    <div class="mx-auto w-full max-w-4xl">
      <!-- Desktop comments button -->
      <button
        v-if="hasProposalToken"
        type="button"
        class="fixed right-6 top-6 z-40 hidden items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-sm font-semibold text-slate-700 shadow ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-white lg:flex"
        @click="openComments()"
      >
        <span>💬</span>
        <span>Comments</span>
      </button>

      <div v-if="loading" class="flex h-48 items-center justify-center text-slate-500">
        Loading…
      </div>

      <div
        v-else-if="error"
        class="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-600"
      >
        {{ error }}
      </div>

      <div v-else class="space-y-8">
        <!-- Header / Branding -->
        <header class="text-center">
          <img
            v-if="headerLogoUrl"
            :src="headerLogoUrl"
            alt="Company logo"
            class="mx-auto mb-4 h-16 w-auto object-contain"
          />
          <h1 class="text-2xl font-semibold text-slate-900">
            {{ headerTitle }}
          </h1>
          <p v-if="subTitle" class="mt-2 text-sm text-slate-600">{{ subTitle }}</p>
        </header>

        <!-- QuickQuote (Estimate) full view until accepted -->
        <section v-if="isEstimate && !isEstimateAccepted" class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-slate-900">Estimate</h2>
          <div class="mt-2 text-sm text-slate-600" v-if="estimateNotes">{{ estimateNotes }}</div>
          <div class="mt-4 overflow-hidden rounded-lg border border-slate-200" v-if="estimateItems && estimateItems.length">
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
                <tr v-for="item in estimateItems" :key="item.id">
                  <td class="px-4 py-3">
                    <p class="font-medium text-slate-900">{{ item.description }}</p>
                    <p v-if="item.cost" class="text-xs text-slate-500">Cost: {{ currency(item.cost) }}</p>
                  </td>
                  <td class="px-4 py-3 text-right">{{ Number(item.quantity).toFixed(2) }}</td>
                  <td class="px-4 py-3 text-right">{{ currency(item.unitPrice) }}</td>
                  <td class="px-4 py-3 text-right font-semibold text-slate-900">{{ currency(item.total) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="mt-4 flex flex-col gap-2 text-sm text-slate-600 md:items-end">
            <div>Subtotal: {{ currency(estimateSubtotal) }}</div>
            <div>Tax: {{ currency(estimateTax) }}</div>
            <div class="text-base font-semibold text-slate-900">Total Due: {{ currency(estimateTotal) }}</div>
          </div>

          <div class="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-60"
              :disabled="approving || !canApproveEstimate"
              @click="onApproveEstimate"
            >
              <span v-if="approving">Approving…</span>
              <span v-else>Approve QuickQuote</span>
            </button>

            <button
              type="button"
              class="rounded-md px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-60"
              :disabled="!hasProposalToken"
              @click="openComments()"
            >
              Comments
            </button>
          </div>
          <p v-if="approveError" class="mt-2 text-sm text-rose-600">{{ approveError }}</p>
          <p v-if="approveMessage" class="mt-2 text-sm text-emerald-700">{{ approveMessage }}</p>
        </section>

        <!-- QuickQuote summary (collapsed) when accepted -->
        <section
          v-if="isEstimate && isEstimateAccepted"
          class="overflow-hidden rounded-xl border bg-white p-5 shadow-sm transition-all duration-500"
          :class="['border-emerald-300', 'accepted']"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">✓</span>
              <h3 class="text-sm font-semibold text-slate-900">QuickQuote Accepted</h3>
            </div>
            <div class="text-sm text-slate-700">{{ currency(estimateTotal) }}</div>
          </div>
          <p class="mt-2 text-xs text-slate-500">Summary of your accepted QuickQuote is shown above. Your detailed SmartProposal appears below.</p>
        </section>

        <!-- SmartProposal expanded -->
        <section v-if="hasProposalPayload" class="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold text-slate-900">{{ proposalTitle }}</h2>
              <p v-if="proposalDescription" class="mt-1 text-sm text-slate-600">{{ proposalDescription }}</p>
            </div>
            <span
              class="rounded-full px-2 py-1 text-xs font-medium"
              :class="proposalStatusClass"
            >
              {{ proposalStatusLabel }}
            </span>
          </div>

          <div class="mt-2 grid gap-4 md:grid-cols-2">
            <div class="space-y-3">
              <h3 class="text-sm font-semibold text-slate-800">Package Options</h3>
              <div
                v-for="opt in proposalOptions"
                :key="opt.name"
                class="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div>
                  <div class="text-sm font-medium text-slate-900">{{ opt.name }}</div>
                  <div class="text-xs text-slate-600">{{ opt.summary || defaultSummary(opt.name) }}</div>
                </div>
                <div class="text-base font-semibold text-slate-900">{{ currency(opt.subtotal) }}</div>
              </div>
            </div>

            <div class="rounded-lg bg-slate-50 p-4">
              <h3 class="text-xs uppercase tracking-wide text-slate-500">Deposit</h3>
              <div class="mt-2">
                <template v-if="proposalAccepted && depositAmount !== null">
                  <div class="text-2xl font-semibold text-slate-900">{{ currency(depositAmount) }}</div>
                  <p class="mt-1 text-sm text-slate-600">Deposit due to secure your project.</p>
                </template>
                <template v-else>
                  <p class="text-sm text-slate-600">Deposit will be shown upon acceptance.</p>
                </template>
              </div>

              <!-- Stripe PayLink visible only when proposal is accepted -->
              <div v-if="proposalAccepted && paymentLinkUrl" class="mt-4">
                <a
                  :href="paymentLinkUrl"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex items-center rounded-md bg-[#3A7D99] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#31687e]"
                >
                  Pay Deposit
                </a>
              </div>
            </div>
          </div>

          <div class="mt-2">
            <button
              v-if="hasProposalToken"
              type="button"
              class="rounded-md px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
              @click="openComments()"
            >
              View Comments
            </button>
          </div>
        </section>

        <!-- Comments drawer (desktop) -->
        <transition name="slide-x">
          <aside v-if="commentsOpen && isDesktop" class="fixed inset-y-0 right-0 z-50 w-80 bg-white shadow-xl ring-1 ring-slate-200">
            <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h3 class="text-sm font-semibold text-slate-900">Comments</h3>
              <button type="button" class="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100" @click="closeComments()">&times;</button>
            </div>
            <div class="flex h-[calc(100%-48px-56px)] flex-col-reverse overflow-y-auto px-3 py-3">
              <div v-for="c in comments" :key="c.id" class="mb-3 flex" :class="c.authorRole==='contractor' ? 'justify-end' : 'justify-start'">
                <div class="max-w-[85%]">
                  <div class="flex items-center gap-2" :class="c.authorRole==='contractor' ? 'justify-end' : 'justify-start'">
                    <img v-if="c.avatarUrl" :src="c.avatarUrl" alt="avatar" class="h-6 w-6 rounded-full" />
                    <span class="text-xs text-slate-500">{{ c.authorName }} · {{ timeAgo(c.createdAt) }}</span>
                  </div>
                  <div :class="bubbleClass(c)">{{ c.message }}</div>
                </div>
              </div>
            </div>
            <div class="border-t border-slate-200 p-3">
              <div class="flex items-center gap-2">
                <input v-model="draft" type="text" placeholder="Write a comment..." class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#3A7D99] focus:outline-none focus:ring-1 focus:ring-[#3A7D99]" @keydown.enter.prevent="sendComment" />
                <button type="button" class="rounded-md bg-[#3A7D99] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60" :disabled="sending || !draft.trim()" @click="sendComment">Send</button>
              </div>
            </div>
          </aside>
        </transition>

        <!-- Comments bottom sheet (mobile) -->
        <transition name="slide-y">
          <div v-if="commentsOpen && !isDesktop" class="fixed inset-0 z-50 flex items-end bg-black/20">
            <div class="h-[70vh] w-full rounded-t-2xl bg-white shadow-xl ring-1 ring-slate-200">
              <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <h3 class="text-sm font-semibold text-slate-900">Comments</h3>
                <button type="button" class="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-100" @click="closeComments()">&times;</button>
              </div>
              <div class="flex h-[calc(70vh-48px-56px)] flex-col-reverse overflow-y-auto px-3 py-3">
                <div v-for="c in comments" :key="c.id" class="mb-3 flex" :class="c.authorRole==='contractor' ? 'justify-end' : 'justify-start'">
                  <div class="max-w-[85%]">
                    <div class="flex items-center gap-2" :class="c.authorRole==='contractor' ? 'justify-end' : 'justify-start'">
                      <img v-if="c.avatarUrl" :src="c.avatarUrl" alt="avatar" class="h-6 w-6 rounded-full" />
                      <span class="text-xs text-slate-500">{{ c.authorName }} · {{ timeAgo(c.createdAt) }}</span>
                    </div>
                    <div :class="bubbleClass(c)">{{ c.message }}</div>
                  </div>
                </div>
              </div>
              <div class="border-t border-slate-200 p-3">
                <div class="flex items-center gap-2">
                  <input v-model="draft" type="text" placeholder="Write a comment..." class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#3A7D99] focus:outline-none focus:ring-1 focus:ring-[#3A7D99]" @keydown.enter.prevent="sendComment" />
                  <button type="button" class="rounded-md bg-[#3A7D99] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60" :disabled="sending || !draft.trim()" @click="sendComment">Send</button>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useProposal } from "@modules/public/composables/useProposal";
import type { ProposalOption } from "@stackquotes/types";
import { apiFetch } from "@/lib/http";

const route = useRoute();
const id = computed(() => String(route.params.id ?? ""));

const { loading, error, state, isEstimate, isProposal, proposalDisplayPayload, load, approveEstimate } = useProposal(id.value);

onMounted(() => {
  void load();
});

// Header branding and labels
const headerLogoUrl = computed(() => {
  return proposalDisplayPayload.value?.contractor?.logoUrl
    ?? state.value.estimatePayload?.settings?.logoUrl
    ?? null;
});
const headerTitle = computed(() => {
  return proposalDisplayPayload.value?.contractor?.businessName
    ?? state.value.estimatePayload?.settings?.companyName
    ?? "Proposal";
});
const subTitle = computed(() => {
  if (isEstimate.value) {
    return state.value.estimatePayload?.estimate?.projectTitle ? `Review and approve ${state.value.estimatePayload?.estimate?.projectTitle}` : null;
  }
  return proposalDisplayPayload.value?.proposal?.title ? `Review ${proposalDisplayPayload.value?.proposal?.title}` : null;
});

// Estimate helpers
const estimateData = computed(() => state.value.estimatePayload?.estimate ?? null);
const estimateItems = computed(() => estimateData.value?.lineItems ?? []);
const estimateSubtotal = computed(() => estimateData.value?.subtotal ?? 0);
const estimateTax = computed(() => estimateData.value?.tax ?? 0);
const estimateTotal = computed(() => estimateData.value?.total ?? 0);
const estimateNotes = computed(() => estimateData.value?.notes ?? "");
const isEstimateAccepted = computed(() => (state.value.status ?? "") === "accepted");
const canApproveEstimate = computed(() => Boolean(state.value.estimateToken) && (state.value.status ?? "") !== "accepted");

const approving = ref(false);
const approveError = ref<string | null>(null);
const approveMessage = ref<string | null>(null);
const onApproveEstimate = async () => {
  if (!canApproveEstimate.value) return;
  approving.value = true;
  approveError.value = null;
  approveMessage.value = null;
  try {
    const res = await approveEstimate();
    if ((res as any).error) {
      approveError.value = (res as any).error as string;
    } else {
      approveMessage.value = "Thanks! Your QuickQuote has been accepted.";
    }
  } catch (e: any) {
    approveError.value = e?.message ?? "Failed to approve";
  } finally {
    approving.value = false;
  }
};

// SmartProposal helpers
const proposal = computed(() => proposalDisplayPayload.value?.proposal ?? null);
const proposalOptions = computed<ProposalOption[]>(() => proposal.value?.options ?? []);
const proposalAccepted = computed(() => (proposal.value?.status ?? "") === "accepted");
const proposalTitle = computed(() => proposal.value?.title ?? "SmartProposal");
const proposalDescription = computed(() => proposal.value?.description ?? "");
const paymentLinkUrl = computed(() => proposalDisplayPayload.value?.paymentLinkUrl ?? null);
const depositAmount = computed(() => proposalDisplayPayload.value?.deposit?.amount ?? null);
const hasProposalPayload = computed(() => Boolean(proposalDisplayPayload.value));

const proposalStatusLabel = computed(() => {
  const s = (proposal.value?.status ?? "sent").toLowerCase();
  if (s === "accepted") return "Accepted";
  if (s === "paid") return "Paid";
  if (s === "sent") return "Sent";
  return s;
});
const proposalStatusClass = computed(() => {
  const s = (proposal.value?.status ?? "sent").toLowerCase();
  if (s === "accepted") return "bg-emerald-100 text-emerald-700";
  if (s === "paid") return "bg-blue-100 text-blue-700";
  if (s === "sent") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
});

// Comments state (uses proposal public token under the hood)
const proposalToken = computed(() => state.value.proposalToken ?? state.value.linkedProposalToken ?? null);
const hasProposalToken = computed(() => Boolean(proposalToken.value));

type Comment = { id: string; authorName: string; authorRole: 'contractor'|'client'; message: string; createdAt: string; avatarUrl?: string | null };
const commentsOpen = ref(false);
const comments = ref<Comment[]>([]);
const draft = ref("");
const sending = ref(false);
const isDesktop = computed(() => (typeof window !== 'undefined' ? window.innerWidth >= 1024 : true));

const bubbleClass = (c: Comment) =>
  (c.authorRole === 'contractor'
    ? 'mt-1 rounded-xl bg-blue-100 px-3 py-2 text-sm text-slate-800'
    : 'mt-1 rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-800');

const timeAgo = (iso: string) => {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.round(ms / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
};

const openComments = async () => { if (!hasProposalToken.value) return; commentsOpen.value = true; await loadComments(); };
const closeComments = () => { commentsOpen.value = false; };

const commentsEndpoint = computed(() => {
  const token = proposalToken.value;
  return token ? `/share/proposal/${encodeURIComponent(token)}/comments` : null;
});

const loadComments = async () => {
  if (!commentsEndpoint.value) return;
  try {
    const res = await apiFetch<{ data: Comment[] }>(commentsEndpoint.value);
    if ((res as any).error) return;
    const list: Comment[] = (((res as any).data ?? []) as unknown) as Comment[];
    comments.value = list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  } catch {
    // ignore silently
  }
};

const sendComment = async () => {
  if (!commentsEndpoint.value || !draft.value.trim()) return;
  sending.value = true;
  try {
    const res = await apiFetch<{ data: Comment }>(commentsEndpoint.value, {
      method: 'POST',
      body: JSON.stringify({ message: draft.value.trim(), authorRole: 'client' }),
    });
    if (!(res as any).error) {
      draft.value = '';
      await loadComments();
    }
  } finally {
    sending.value = false;
  }
};

// Utils
const currency = (n: number | null | undefined) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(Number(n ?? 0));

const defaultSummary = (name: string) => {
  if (name === "Good") return "Essential scope to get started quickly.";
  if (name === "Best") return "Premium upgrades for a standout experience.";
  return "Balanced deliverables aligned with your goals.";
};
</script>

