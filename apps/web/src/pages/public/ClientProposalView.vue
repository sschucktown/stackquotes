<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <!-- Loading -->
    <div v-if="loading" class="text-gray-500">
      Loading proposal…
    </div>

    <!-- Unavailable -->
    <div
      v-else-if="unavailable"
      class="max-w-md w-full bg-white rounded-lg shadow p-6 text-center"
    >
      <h1 class="text-xl font-semibold mb-2">Project Proposal</h1>
      <p class="text-gray-500">This proposal is no longer available.</p>
    </div>

    <!-- Proposal (sent only) -->
    <div
      v-else-if="proposal"
      class="max-w-2xl w-full bg-white rounded-lg shadow p-6"
    >
      <h1 class="text-2xl font-semibold mb-4">
        {{ proposal.title }}
      </h1>

      <p v-if="proposal.description" class="text-gray-600 mb-6">
        {{ proposal.description }}
      </p>

      <div class="space-y-4">
        <div
          v-for="option in proposal.options"
          :key="option.name"
          class="border rounded-lg p-4 flex items-center justify-between"
        >
          <div>
            <h3 class="font-medium">{{ option.name }}</h3>
            <p class="text-sm text-gray-500">
              ${{ option.subtotal.toLocaleString() }}
            </p>
          </div>

          <button
            class="px-4 py-2 rounded bg-black text-white text-sm"
            @click="accept(option.name)"
          >
            Select
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";

/* =====================
   Types
===================== */

type ProposalOption = {
  name: string;
  subtotal: number;
};

type Proposal = {
  id: string;
  title: string;
  description?: string;
  status: "sent" | "accepted";
  publicToken: string;
  options: ProposalOption[];
  depositConfig?: unknown;
};

/* =====================
   State
===================== */

const route = useRoute();
const router = useRouter();

const token = route.params.token as string;

const loading = ref(true);
const unavailable = ref(false);
const proposal = ref<Proposal | null>(null);

/* =====================
   Load Proposal
===================== */

onMounted(async () => {
  if (!token) {
    unavailable.value = true;
    loading.value = false;
    return;
  }

  try {
    const res = await fetch(`/api/share/proposal/${token}`);

    if (!res.ok) {
      unavailable.value = true;
      return;
    }

    const json = await res.json();
    const fetched = json?.data as Proposal | undefined;

    if (!fetched) {
      unavailable.value = true;
      return;
    }

    // 🔁 Accepted proposals skip this page entirely
    if (fetched.status === "accepted") {
      router.replace(`/proposal/${token}/success`);
      return;
    }

    // Only "sent" proposals render here
    if (fetched.status !== "sent") {
      unavailable.value = true;
      return;
    }

    proposal.value = fetched;
  } catch (err) {
    console.error("[ClientProposalView] load failed", err);
    unavailable.value = true;
  } finally {
    loading.value = false;
  }
});

/* =====================
   Accept Proposal
===================== */

async function accept(optionName: string) {
  try {
    const res = await fetch(
      `/api/share/proposal/${token}/accept`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionName }),
      }
    );

    if (!res.ok) {
      alert("Failed to accept proposal");
      return;
    }

    router.push(`/proposal/${token}/success`);
  } catch (err) {
    console.error("[ClientProposalView] accept failed", err);
    alert("Something went wrong");
  }
}
</script>
