<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";

/* --------------------------------------------------
   Route
-------------------------------------------------- */

const route = useRoute();
const token = computed(() => route.params.token as string);

/* --------------------------------------------------
   State
-------------------------------------------------- */

const loading = ref(true);
const error = ref<string | null>(null);

const proposalTitle = ref<string | null>(null);
const depositAmount = ref<number>(0);
const paymentLinkUrl = ref<string | null>(null);

/* --------------------------------------------------
   Load job + proposal
-------------------------------------------------- */

onMounted(async () => {
  try {
    console.log("[SUCCESS] loading job for token", token.value);

    // 1️⃣ Load proposal (title only)
    const proposalRes = await fetch(`/api/share/proposal/${token.value}`);
    if (!proposalRes.ok) throw new Error("Failed to load proposal");

    const proposalJson = await proposalRes.json();
    proposalTitle.value = proposalJson?.proposal?.title ?? "Your project";

    // 2️⃣ Load job (deposit + pay link)
    const jobRes = await fetch(`/api/share/proposal/${token.value}/job`);
    if (!jobRes.ok) {
      console.warn("[SUCCESS] no job found");
      loading.value = false;
      return;
    }

    const job = await jobRes.json();
    console.log("[SUCCESS] job payload", job);

    depositAmount.value = job.deposit_amount ?? 0;
    paymentLinkUrl.value = job.payment_link_url ?? null;

  } catch (err: any) {
    console.error("[SUCCESS] load failed", err);
    error.value = err.message ?? "Something went wrong";
  } finally {
    loading.value = false;
  }
});

/* --------------------------------------------------
   Computed
-------------------------------------------------- */

const showDepositCTA = computed(
  () => depositAmount.value > 0
);
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-16">
    <div class="mx-auto max-w-2xl text-center">

      <div v-if="loading" class="text-slate-500">
        Finalizing your project…
      </div>

      <div
        v-else-if="error"
        class="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-600"
      >
        {{ error }}
      </div>

      <div
        v-else
        class="rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-100 space-y-6"
      >
        <div class="text-4xl">🎉</div>

        <h1 class="text-2xl font-semibold text-slate-900">
          Your project is approved
        </h1>

        <p class="text-slate-600">
          We’ve received your signed approval and the contractor has been notified.
        </p>

        <div class="rounded-xl bg-slate-50 p-4 text-left">
          <div class="text-sm text-slate-500">Project</div>
          <div class="font-medium text-slate-900">
            {{ proposalTitle }}
          </div>
        </div>

        <!-- ✅ DEPOSIT CTA -->
        <div v-if="showDepositCTA" class="pt-4 space-y-3">
          <p class="text-slate-700 font-medium">
            Deposit due: ${{ depositAmount.toLocaleString() }}
          </p>

          <a
            v-if="paymentLinkUrl"
            :href="paymentLinkUrl"
            class="inline-flex w-full justify-center rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700"
          >
            Pay Deposit
          </a>

          <p v-else class="text-sm text-slate-500">
            The contractor will send your payment link shortly.
          </p>
        </div>

        <p v-else class="text-sm text-slate-500">
          You’re all set. No further action is required.
        </p>
      </div>
    </div>
  </div>
</template>
