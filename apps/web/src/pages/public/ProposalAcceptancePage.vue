<template>
<div class="mx-auto w-full max-w-4xl">
      <!-- Desktop comments button -->
      <button
        type="button"
        class="fixed right-6 top-6 z-40 hidden items-center gap-2 rounded-full bg-white/95 px-3 py-2 text-sm font-semibold text-slate-700 shadow ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:bg-white lg:flex"
        @click="openComments()"
      >
        <span>&#128172;</span>
        <span>Comments</span>
      </button>
      <div v-if="loading" class="flex h-48 items-center justify-center text-slate-500">
        Preparing proposal.
      </div>

      <div
        v-else-if="error"
        class="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-600"
      >
        {{ error }}
      </div>

      <div v-else-if="proposal" class="space-y-8">
        <!-- Mobile FAB for comments -->
        <button
          type="button"
          class="fixed bottom-24 right-6 z-40 inline-flex items-center justify-center rounded-full bg-white/95 p-3 text-lg shadow ring-1 ring-slate-200 transition hover:-translate-y-0.5 lg:hidden"
          @click="openComments()"
        >
          &#128172;
        </button>
        <header class="text-center">
          <img
            v-if="contractor?.logoUrl"
            :src="contractor?.logoUrl"
            alt="Company logo"
            class="mx-auto mb-4 h-16 w-auto object-contain"
          />
          <h1 class="text-2xl font-semibold text-slate-900">
            {{ contractor?.businessName ?? "SmartProposal" }}
          </h1>
          <p class="mt-2 text-sm text-slate-600">
            Review and approve
            <strong>{{ proposal!.title }}</strong>
            for {{ clientName }}.
          </p>
          <p v-if="proposal!.acceptedOption" class="mt-2 text-xs text-slate-500">
            Previously selected: <strong>{{ proposal!.acceptedOption }}</strong>. You can change your
            selection below.
          </p>
        </header>

        <section class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div class="grid gap-6 md:grid-cols-2">
            <div>
              <h2 class="text-sm font-semibold text-slate-800">Project Summary</h2>
              <p class="mt-2 text-sm text-slate-600" v-if="proposal!.description">
                {{ proposal!.description }}
              </p>
              <p class="mt-2 text-xs text-slate-500">
                QuickQuote reference:
                <span class="font-medium text-slate-700">
                  {{ proposal!.quickquoteId ? proposal!.quickquoteId.slice(0, 8).toUpperCase() : "N/A" }}
                </span>
              </p>
            </div>
            <div class="rounded-lg bg-slate-50 p-4">
              <h3 class="text-xs uppercase tracking-wide text-slate-500">Deposit</h3>
              <p
                v-if="selectedDepositAmount !== null"
                class="mt-2 text-2xl font-semibold text-slate-900"
              >
                {{ formatCurrency(selectedDepositAmount) }}
              </p>
              <p v-else class="mt-2 text-sm text-slate-600">
                Select a package to see the deposit amount.
              </p>
              <p class="mt-1 text-sm text-slate-600">
                {{ depositMessage }}
              </p>
            </div>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-lg font-semibold text-slate-900">Package Options</h2>
          <div
            v-for="option in proposal!.options"
            :key="option.name"
            :class="optionCardClass(option.name)"
            role="button"
            tabindex="0"
            @click="selectOption(option.name)"
            @keydown.enter.prevent="selectOption(option.name)"
            @keydown.space.prevent="selectOption(option.name)"
          >
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div class="flex items-start gap-3">
                <input
                  type="radio"
                  name="proposal-option"
                  class="mt-1 h-4 w-4 border-slate-300 text-[#3A7D99] focus:ring-[#3A7D99]"
                  :checked="selectedOptionName === option.name"
                  @change.stop="selectOption(option.name)"
                />
                <div>
                  <h3 class="text-base font-semibold text-slate-900">{{ option.name }}</h3>
                  <p class="text-sm text-slate-600">
                    {{ option.summary || defaultSummary(option.name) }}
                  </p>
                </div>
              </div>
              <span class="text-xl font-semibold text-slate-900">
                {{ formatCurrency(option.subtotal) }}
              </span>
            </div>
            <ul class="mt-4 space-y-2 text-sm text-slate-600">
              <li
                v-for="item in option.lineItems"
                :key="item.description"
                class="flex items-center justify-between break-inside-avoid"
              >
                <span>{{ item.description }}</span>
                <span class="text-slate-500">{{ formatCurrency(item.total) }}</span>
              </li>
            </ul>
          </div>
        </section>

        <section class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-slate-900">Ready to move forward?</h2>
          <p class="text-sm text-slate-600">
            Choose how you'd like to move forward. Pay the deposit today or explore flexible
            financing with Wisetack (soft credit check, no impact to your score). Questions? Contact
            <a
              v-if="contractor?.email"
              class="font-medium text-[#3A7D99]"
              :href="`mailto:${contractor.email}`"
            >
              {{ contractor.email }}
            </a>
            <span v-else class="font-medium text-slate-700">your contractor</span>.
          </p>
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-lg bg-[#3A7D99] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2f6d87] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3A7D99] disabled:cursor-not-allowed disabled:bg-slate-400"
                :disabled="!selectedOption || accepting"
                @click="onAccept"
              >
                <span v-if="accepting">Processing...</span>
                <span v-else-if="selectedDepositAmount !== null && selectedDepositAmount > 0">
                  Accept &amp; Pay Deposit
                </span>
                <span v-else>Accept Proposal</span>
              </button>
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-lg border border-[#0EA5E9]/50 bg-white px-5 py-3 text-sm font-semibold text-[#0EA5E9] shadow-sm transition hover:border-[#0EA5E9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0EA5E9] disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="!selectedOption || financing"
                @click="onFinanceWithWisetack"
              >
                <span v-if="financing">Launching…</span>
                <span v-else>Finance with Wisetack</span>
              </button>
            </div>
            <a
              v-if="paymentLinkUrl && !accepting"
              :href="paymentLinkUrl"
              target="_blank"
              rel="noopener"
              class="text-sm font-medium text-[#3A7D99] underline"
            >
              Already have a payment link? Open it here.
            </a>
          </div>
          <div class="space-y-1 pt-1">
            <p v-if="acceptError" class="text-sm text-rose-600">{{ acceptError }}</p>
            <p v-if="financingError" class="text-sm text-rose-600">{{ financingError }}</p>
            <p v-else-if="financingMessage" class="text-sm text-emerald-600">
              {{ financingMessage }}
            </p>
            <span v-if="!selectedOption" class="block text-xs text-slate-500">
              Choose a package to enable acceptance and financing actions.
            </span>
          </div>
        </section>
      </div>
    </div>
  </div>

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
              <span class="text-xs text-slate-500">{{ c.authorName }} � {{ timeAgo(c.createdAt) }}</span>
            </div>
            <div :class="bubbleClass(c)">{{ c.message }}</div>
          </div>
        </div>
      </div>
      <div class="border-t border-slate-200 p-3">
        <div class="flex items-center gap-2">
          <input v-model="draft" type="text" placeholder="Write a comment�" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#3A7D99] focus:outline-none focus:ring-1 focus:ring-[#3A7D99]" @keydown.enter.prevent="sendComment" />
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
                <span class="text-xs text-slate-500">{{ c.authorName }} � {{ timeAgo(c.createdAt) }}</span>
              </div>
              <div :class="bubbleClass(c)">{{ c.message }}</div>
            </div>
          </div>
        </div>
        <div class="border-t border-slate-200 p-3">
          <div class="flex items-center gap-2">
            <input v-model="draft" type="text" placeholder="Write a comment�" class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-[#3A7D99] focus:outline-none focus:ring-1 focus:ring-[#3A7D99]" @keydown.enter.prevent="sendComment" />
            <button type="button" class="rounded-md bg-[#3A7D99] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60" :disabled="sending || !draft.trim()" @click="sendComment">Send</button>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import type { PublicProposalPayload } from "@modules/public/api/proposal";
import { acceptPublicProposal, fetchPublicProposal } from "@modules/public/api/proposal";
import { apiFetch } from "@/lib/http";
import { launchWisetackFinancing } from "@/lib/wisetack";

const route = useRoute();
const loading = ref(true);
const error = ref<string | null>(null);
const proposalData = ref<PublicProposalPayload | null>(null);

const accepting = ref(false);
const acceptError = ref<string | null>(null);
const financing = ref(false);
const financingError = ref<string | null>(null);
const financingMessage = ref<string | null>(null);
const selectedOptionName = ref<string | null>(null);

const proposal = computed(() => proposalData.value?.proposal ?? null);
const contractor = computed(() => proposalData.value?.contractor ?? null);
const client = computed(() => proposalData.value?.client ?? null);
const clientName = computed(() => client.value?.name ?? "Client");
const paymentLinkUrl = computed(() => proposalData.value?.paymentLinkUrl ?? null);
const depositConfig = computed(() => proposalData.value?.deposit?.config ?? null);

const options = computed(() => proposal.value?.options ?? []);
const selectedOption = computed(() => {
  if (!selectedOptionName.value) return null;
  return options.value.find((option) => option.name === selectedOptionName.value) ?? null;
});

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const roundCurrency = (value: number) => Math.round(value * 100) / 100;

const selectedDepositAmount = computed<number | null>(() => {
  const config = depositConfig.value;
  if (!config) {
    return null;
  }
  if (!selectedOption.value) {
    return null;
  }
  if (config.type === "fixed") {
    return roundCurrency(Math.max(config.value, 0));
  }
  const subtotal = selectedOption.value.subtotal ?? 0;
  return roundCurrency(Math.max(subtotal * (config.value / 100), 0));
});

const depositMessage = computed(() => {
  const config = depositConfig.value;
  if (!config) {
    return "No deposit is required to accept this proposal.";
  }
  if (!selectedOption.value) {
    return "Select a package to see how much deposit is due.";
  }
  if (config.type === "percentage") {
    return `${config.value}% of the ${selectedOption.value.name} package subtotal.`;
  }
  return "Fixed deposit amount collected at acceptance.";
});

const selectOption = (name: string) => {
  selectedOptionName.value = name;
  acceptError.value = null;
};

const optionCardClass = (name: string) =>
  [
    "rounded-xl border border-slate-200 bg-white p-6 shadow-sm break-inside-avoid transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3A7D99]",
    selectedOptionName.value === name ? "border-[#3A7D99] ring-2 ring-[#3A7D99]" : "hover:border-[#3A7D99]",
  ].join(" ");

const onAccept = async () => {
  if (!selectedOption.value) {
    acceptError.value = "Please choose a package to continue.";
    return;
  }
  accepting.value = true;
  acceptError.value = null;
  try {
    const token = route.params.token as string;
    const response = await acceptPublicProposal(token, selectedOption.value.name);
    if (response.error) {
      acceptError.value = response.error;
      return;
    }
    if (!response.data) {
      acceptError.value = "Unexpected response from the server.";
      return;
    }
    const updated = response.data.data;
    const meta = (response.data.meta ?? {}) as {
      depositAmount?: number | null;
      paymentLinkUrl?: string | null;
    };
    const current = proposalData.value;
    const acceptedDepositAmount = meta.depositAmount ?? updated.depositAmount ?? null;
    proposalData.value = {
      contractor: current?.contractor ?? null,
      client: current?.client ?? null,
      deposit: {
        config: updated.depositConfig ?? depositConfig.value ?? null,
        amount: acceptedDepositAmount,
      },
      paymentLinkUrl: meta.paymentLinkUrl ?? updated.paymentLinkUrl ?? null,
      proposal: updated,
    };
    selectedOptionName.value = updated.acceptedOption ?? selectedOption.value.name;
    const redirectUrl = meta.paymentLinkUrl ?? updated.paymentLinkUrl ?? null;
    if (acceptedDepositAmount && acceptedDepositAmount > 0 && !redirectUrl) {
      acceptError.value =
        "Deposit link is unavailable. Please contact your contractor to continue.";
    } else if (redirectUrl) {
              window.open(redirectUrl, "_self");
            }
          } catch (err) {
    console.error(err);
    acceptError.value = "Unable to accept this proposal. Please try again.";
  } finally {
    accepting.value = false;
  }
};

const onFinanceWithWisetack = async () => {
  if (!selectedOption.value || !proposal.value) {
    financingError.value = "Select a package to explore financing options.";
    return;
  }
  const amountCents = Math.max(Math.round((selectedOption.value.subtotal ?? 0) * 100), 0);
  if (!amountCents) {
    financingError.value = "Financing is unavailable for packages without pricing.";
    return;
  }
  financing.value = true;
  financingError.value = null;
  financingMessage.value = null;
  try {
    await launchWisetackFinancing({
      contractorId: proposal.value.userId,
      proposalId: proposal.value.id,
      amountCents,
      customerName: clientName.value ?? undefined,
      customerEmail: client.value?.email ?? undefined,
    });
    financingMessage.value =
      "A Wisetack financing window has opened in a new tab. Complete the quick application to continue.";
    await apiFetch("/wisetack/telemetry", {
      method: "POST",
      body: JSON.stringify({
        contractor_id: proposal.value.userId,
        proposal_id: proposal.value.id,
        kind: "application_completed",
        amount_cents: amountCents,
        metadata: { trigger: "public_proposal" },
      }),
    });
  } catch (error) {
    console.error(error);
    financingError.value = "Unable to launch Wisetack at the moment. Please try again.";
  } finally {
    financing.value = false;
  }
};

const defaultSummary = (name: string) => {
  if (name === "Good") return "Essential scope to get started quickly.";
  if (name === "Best") return "Premium upgrades for a standout experience.";
  return "Balanced deliverables aligned with your goals.";
};

const load = async () => {
  loading.value = true;
  error.value = null;
  proposalData.value = null;
  try {
    const token = route.params.token as string;
    const response = await fetchPublicProposal(token);
    if (response.error) {
      error.value = response.error;
    } else {
      proposalData.value = response.data ?? null;
      if (!proposalData.value) {
        error.value = "This proposal link is no longer available.";
      } else {
        selectedOptionName.value = proposalData.value.proposal.acceptedOption ?? null;
      }
    }
  } catch (err) {
    console.error(err);
    error.value = "Unable to load this proposal.";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  void load();
  if (route.query.payment === 'success') {
    void load();
  }
});

// Comments state and helpers
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

const openComments = async () => { commentsOpen.value = true; await loadComments(); };
const closeComments = () => { commentsOpen.value = false; };

const commentsEndpoint = computed(() => {
  const token = String(route.params.token ?? route.params.id ?? "");
  return `/share/proposal/${encodeURIComponent(token)}/comments`;
});

const loadComments = async () => {
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
  const text = draft.value.trim();
  if (!text) return;
  sending.value = true;
  const optimistic: Comment = {
    id: `temp_${Date.now()}`,
    authorName: clientName.value || 'You',
    authorRole: 'client',
    message: text,
    createdAt: new Date().toISOString(),
  };
  comments.value = [...comments.value, optimistic];
  draft.value = "";
  try {
    const res = await apiFetch<{ data: Comment }>(commentsEndpoint.value, { method: 'POST', body: JSON.stringify({ message: text }) });
    if ((res as any).data) {
      const idx = comments.value.findIndex(c => c.id === optimistic.id);
      if (idx !== -1) comments.value.splice(idx, 1, ((res as any).data as unknown) as Comment);
    }
  } catch {
    comments.value = comments.value.filter(c => c.id !== optimistic.id);
  } finally {
    sending.value = false;
  }
};</script>



<style scoped>
.slide-x-enter-active,
.slide-x-leave-active { transition: transform 200ms ease, opacity 200ms ease; }
.slide-x-enter-from { transform: translateX(100%); opacity: 0.9; }
.slide-x-enter-to { transform: translateX(0); opacity: 1; }
.slide-x-leave-from { transform: translateX(0); opacity: 1; }
.slide-x-leave-to { transform: translateX(100%); opacity: 0.9; }

.slide-y-enter-active,
.slide-y-leave-active { transition: transform 220ms ease, opacity 200ms ease; }
.slide-y-enter-from { transform: translateY(100%); opacity: 0; }
.slide-y-enter-to { transform: translateY(0); opacity: 1; }
.slide-y-leave-from { transform: translateY(0); opacity: 1; }
.slide-y-leave-to { transform: translateY(100%); opacity: 0; }
</style>
