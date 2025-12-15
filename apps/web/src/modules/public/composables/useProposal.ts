import { ref, computed } from "vue";
import { apiFetch } from "@/lib/http.ts";
import type {
  Proposal,
  ProposalDepositConfig,
} from "@stackquotes/types";

/* ----------------------------------
   Types
---------------------------------- */

export interface PublicProposalContractorBranding {
  businessName: string | null;
  accentColor: string | null;
  logoUrl: string | null;
  email?: string | null;
}

export interface PublicProposalDepositMeta {
  amount: number | null;
  config: ProposalDepositConfig | null;
}

export interface PublicProposalPayload {
  proposal: Proposal;
  contractor: PublicProposalContractorBranding | null;
  client: { id: string; name: string; email?: string } | null;
  deposit: PublicProposalDepositMeta;
  paymentLinkUrl: string | null;
  plan?: {
    tier: string;
    allowMultiOptions: boolean;
    wowPortalEnabled: boolean;
    inTrial?: boolean;
  } | null;
}

export interface ProposalState {
  proposalId: string | null;
  proposalToken: string | null;
  status: string | null;
  payload: PublicProposalPayload | null;
}

/* ----------------------------------
   Composable
---------------------------------- */

export function useProposal(publicToken: string) {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const state = ref<ProposalState>({
    proposalId: null,
    proposalToken: null,
    status: null,
    payload: null,
  });

  const isLoaded = computed(() => Boolean(state.value.payload));
  const proposalDisplayPayload = computed(() => state.value.payload);

  /* ----------------------------------
     Load proposal (PUBLIC TOKEN ONLY)
  ---------------------------------- */
  const load = async () => {
    const token = publicToken?.trim();

    if (!token) {
      error.value = "Invalid proposal link.";
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const res = await apiFetch<PublicProposalPayload>(
        `/share/proposal/${encodeURIComponent(token)}`
      );

      if (res.error || !res.data) {
        error.value = "This proposal link is invalid or has expired.";
        return;
      }

      const proposal = res.data.proposal;

      state.value.proposalId = proposal.id;
      state.value.proposalToken = proposal.publicToken ?? token;
      state.value.status = proposal.status ?? null;
      state.value.payload = res.data;

      // 🔥 IMPORTANT: ensure stale error is cleared
      error.value = null;
    } catch (err) {
      console.error("[useProposal] Failed to load proposal:", err);
      error.value = "Failed to load proposal.";
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    error,
    state,
    isLoaded,
    proposalDisplayPayload,
    load,
  };
}
