import { ref, computed } from "vue";
import { apiFetch } from "@/lib/http";
import type { Proposal } from "@stackquotes/types";

export function useProposal(publicToken: string) {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const proposal = ref<Proposal | null>(null);

  const load = async () => {
    if (!publicToken) {
      error.value = "Invalid proposal link.";
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const res = await apiFetch<{ proposal: Proposal }>(
        `/share/proposal/${encodeURIComponent(publicToken)}`
      );

      if (res.error || !res.data?.proposal) {
        error.value = "This proposal link is invalid or has expired.";
        return;
      }

      proposal.value = res.data.proposal;
    } catch (e) {
      console.error(e);
      error.value = "Failed to load proposal.";
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    proposal,
    load,
  };
}
