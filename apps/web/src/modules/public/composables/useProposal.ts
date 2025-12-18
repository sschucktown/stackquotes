import { ref } from "vue";
import { fetchPublicProposal } from "@/modules/public/api/proposal";

export function useProposal() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  // IMPORTANT: this is the FULL payload, not just the proposal
  const proposalDisplayPayload = ref<any | null>(null);

  const load = async (token: string) => {
    if (!token) {
      error.value = "Invalid proposal link.";
      proposalDisplayPayload.value = null;
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const res = await fetchPublicProposal(token);

      if (!res || !res.data) {
        error.value = "This proposal link is invalid or has expired.";
        proposalDisplayPayload.value = null;
        return;
      }

      // 🔑 STORE THE FULL PAYLOAD
      proposalDisplayPayload.value = res.data;
    } catch (e) {
      console.error("[useProposal] load failed:", e);
      error.value = "Failed to load proposal.";
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    proposalDisplayPayload,
    load,
  };
}
