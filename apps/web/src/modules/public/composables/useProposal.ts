import { ref } from "vue";
import { fetchPublicProposal } from "@/modules/public/api/proposal";
import type { PublicProposal } from "@/modules/public/types/publicProposal";

export function useProposal() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  // ✅ This is the proposal itself
  const proposalDisplayPayload = ref<PublicProposal | null>(null);

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

      if (res.error || !res.data) {
        error.value = "This proposal link is invalid or has expired.";
        proposalDisplayPayload.value = null;
        return;
      }

      // ✅ res.data IS the PublicProposal
      proposalDisplayPayload.value = res.data;
    } catch (e) {
      console.error("[useProposal] load failed:", e);
      error.value = "Failed to load proposal.";
      proposalDisplayPayload.value = null;
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
