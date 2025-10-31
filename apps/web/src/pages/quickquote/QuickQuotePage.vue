<template>
  <div class="min-h-screen bg-slate-50">
    <div class="mx-auto max-w-3xl px-4 py-6">
      <header class="mb-5">
        <h1 class="text-xl font-semibold text-slate-900">QuickQuote</h1>
        <p class="text-sm text-slate-500">Fast estimate builder for your trade</p>
      </header>

      <div class="mb-4">
        <TradeAutocomplete
          v-model="store.query"
          :results="store.suggestions"
          label="Search / Add Item"
          placeholder="Type to search your trade templates"
          @select="onSelect"
        />
      </div>

      <section v-if="store.suggested.length" class="mb-4">
        <h3 class="mb-2 text-sm font-semibold text-slate-700">Suggested for You</h3>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tpl in store.suggested"
            :key="tpl.id"
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 shadow-sm transition hover:bg-slate-50"
            @click="store.addFromTemplate(tpl)"
          >
            <span class="text-slate-500">＋</span>
            <span>{{ tpl.item_label }}</span>
          </button>
        </div>
      </section>

      <section class="space-y-3">
        <transition-group name="list" tag="div" class="space-y-3">
          <LineItemCard
            v-for="it in store.items"
            :key="it.id"
            v-model="itemModels[it.id]"
            @remove="store.removeItem(it.id)"
          />
        </transition-group>

        <div v-if="!store.items.length" class="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          Start by searching above or choose a suggestion.
        </div>

        <div class="flex justify-between">
          <SQButton variant="ghost" @click="store.addCustom">+ Add Custom Item</SQButton>
          <div class="text-right">
            <div class="text-xs text-slate-500">Subtotal</div>
            <div class="text-base font-semibold text-slate-900">{{ currency(store.subtotal) }}</div>
          </div>
        </div>
      </section>

      <section class="mt-6 flex flex-col gap-3">
        <SQButton
          v-if="canAiAssist"
          variant="secondary"
          :disabled="saving"
          :loading="saving && aiRequested"
          @click="generateGbb"
        >
          ✨ Generate Good / Better / Best Proposal
        </SQButton>
        <div class="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <SQButton
            variant="primary"
            :disabled="!store.items.length || saving"
            :loading="saving && !aiRequested"
            @click="saveAndContinue"
          >
            Save & Continue to SmartProposal
          </SQButton>
        </div>
        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useQuoteStore } from "@modules/quickquote/stores/quoteStore";
import TradeAutocomplete from "@modules/quickquote/components/TradeAutocomplete.vue";
import LineItemCard from "@modules/quickquote/components/LineItemCard.vue";
import { useTier } from "@/composables/useTier";
import { useEstimateStore } from "@modules/quickquote/stores/estimateStore";
import { generateSmartProposal } from "@modules/proposals/api/proposals";

const store = useQuoteStore();
const estimateStore = useEstimateStore();
const router = useRouter();
const { isPro } = useTier();

const itemModels = reactive<Record<string, any>>({});
const saving = ref(false);
const error = ref("");
const aiRequested = ref(false);

onMounted(async () => {
  if (!store.templates.length && !store.loading) {
    await store.loadTemplatesForTrade();
  }
});

watch(
  () => store.items,
  (items) => {
    // Sync v-models for child cards
    for (const it of items) {
      itemModels[it.id] = it;
    }
  },
  { deep: true, immediate: true }
);

const currencyFmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const currency = (n: number) => currencyFmt.format(n || 0);

const canAiAssist = computed(() => isPro.value && store.items.length >= 3);

const onSelect = (tpl: any) => {
  store.addFromTemplate(tpl);
};

const ensureEstimate = async () => {
  // Prompt minimal project title/client selection would be ideal, but to integrate
  // we create a simple draft estimate with placeholder title and require client later.
  // Here, we route user to the standard editor flow if creation fails.
  const title = `QuickQuote ${new Date().toLocaleDateString()}`;
  try {
    // Try to reuse last estimate's client if available; otherwise, throw to route editor.
    const last = estimateStore.items[0] ?? null;
    const clientId = last?.clientId;
    if (!clientId) throw new Error("Missing client");
    const payload = {
      clientId,
      projectTitle: title,
      lineItems: store.toLineItems(),
      notes: "",
    };
    const created = await estimateStore.create(payload);
    if (!created) throw new Error("Failed to create estimate");
    return created.id;
  } catch {
    // Fallback: hand off to editor with prefill via localStorage
    localStorage.setItem(
      "stackquotes:quickquote-prefill",
      JSON.stringify({ title, items: store.toLineItems() })
    );
    await router.push({ name: "quickquote-new" });
    throw new Error("redirected");
  }
};

const saveLineItemsAudit = async (estimateId: string) => {
  try {
    await store.saveLineItemsToQuoteTable(estimateId);
  } catch (e) {
    // Non-fatal: log only
    console.warn("[quickquote] failed to save quote_line_items", e);
  }
};

const saveAndContinue = async () => {
  error.value = "";
  aiRequested.value = false;
  saving.value = true;
  try {
    const id = await ensureEstimate();
    await saveLineItemsAudit(id);
    await router.push({ name: "smart-proposals" });
  } catch (e) {
    if ((e as Error)?.message !== "redirected") {
      error.value = (e as Error)?.message ?? "Unable to continue.";
    }
  } finally {
    saving.value = false;
  }
};

const generateGbb = async () => {
  error.value = "";
  aiRequested.value = true;
  saving.value = true;
  try {
    const id = await ensureEstimate();
    await saveLineItemsAudit(id);
    const resp = await generateSmartProposal(id);
    if (resp.error) throw new Error(resp.error);
    await router.push({ name: "smart-proposals" });
  } catch (e) {
    if ((e as Error)?.message !== "redirected") {
      error.value = (e as Error)?.message ?? "Unable to generate proposal.";
    }
  } finally {
    saving.value = false;
    aiRequested.value = false;
  }
};
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 200ms ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>

