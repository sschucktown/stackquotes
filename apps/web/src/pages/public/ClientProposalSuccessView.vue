<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const token = route.params.token as string;

const loading = ref(true);
const error = ref<string | null>(null);

const jobId = ref<string | null>(null);
const depositAmount = ref<number>(0);
const paymentLinkUrl = ref<string | null>(null);

onMounted(async () => {
  console.log("[SUCCESS] mounted");
  console.log("[SUCCESS] token:", token);

  try {
    const res = await fetch(`/api/share/proposal/${token}/job`);
    console.log("[SUCCESS] job fetch status:", res.status);

    if (!res.ok) {
      throw new Error("Failed to load job");
    }

    const data = await res.json();
    console.log("[SUCCESS] job payload:", data);

    jobId.value = data.job_id;
    depositAmount.value = data.deposit_amount ?? 0;
    paymentLinkUrl.value = data.payment_link_url ?? null;
  } catch (err: any) {
    console.error("[SUCCESS] job fetch error", err);
    error.value = err.message ?? "Unknown error";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="max-w-lg mx-auto py-16 px-4">
    <div class="bg-white rounded-xl shadow p-8 text-center">
      <div class="text-4xl mb-4">🎉</div>

      <h1 class="text-2xl font-semibold mb-2">
        Your project is approved
      </h1>

      <p class="text-gray-600 mb-6">
        We’ve received your signed approval and the contractor has been notified.
      </p>

      <div v-if="loading" class="text-gray-500">
        Loading payment details…
      </div>

      <div v-else-if="error" class="text-red-600">
        {{ error }}
      </div>

      <!-- ✅ DEPOSIT CTA -->
      <div v-else-if="depositAmount > 0" class="mt-6">
        <p class="text-sm text-gray-600 mb-3">
          Deposit required: <strong>${{ depositAmount }}</strong>
        </p>

        <a
          v-if="paymentLinkUrl"
          :href="paymentLinkUrl"
          class="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
        >
          Pay Deposit
        </a>

        <p v-else class="text-gray-500 text-sm">
          Payment link will be sent shortly.
        </p>
      </div>

      <div v-else class="text-gray-500 mt-4">
        No deposit required. You’re all set.
      </div>
    </div>
  </div>
</template>
