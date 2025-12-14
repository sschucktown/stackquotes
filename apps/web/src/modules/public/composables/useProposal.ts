import { ref, computed } from "vue";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/http";
import type {
  ApiResponse,
  Estimate,
  Proposal,
  ProposalDepositConfig,
} from "@stackquotes/types";

/* -----------------------------
   Types
-------------------------------- */
export type UnifiedType = "estimate" | "proposal";

export interface PublicEstimatePayload {
  estimate: Estimate;
  client: { id: string; name: string; email?: string };
  settings: { logoUrl?: string | null; companyName?: string | null } | null;
  downloadUrl?: string | null;
}

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

export interface UnifiedProposalState {
  kind: UnifiedType | null;
  id: string | null;
  status: string | null;

  // Estimate (QuickQuote)
  estimateToken: string | null;
  estimatePayload: PublicEstimatePayload | null;

  // Proposal
  proposalToken: string | null;
  proposalPayload: PublicProposalPayload | null;
}

/* -----------------------------
   Composable
-------------------------------- */
export function useProposal(identifier: string) {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const state = ref<UnifiedProposalState>({
    kind: null,
    id: null,
    status: null,
    estimateToken: null,
    estimatePayload: null,
    proposalToken: null,
    proposalPayload: null,
  });

  const isEstimate = computed(() => state.value.kind === "estimate");
  const isProposal = computed(() => state.value.kind === "proposal");
  const proposalDisplayPayload = computed(() => state.value.proposalPayload);

  /* -----------------------------
     Load
  -------------------------------- */
  const load = async () => {
    const value = (identifier ?? "").trim();
    if (!value) {
      error.value = "Not found";
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      /* ---------------------------------
         1) Try PUBLIC PROPOSAL (token)
         --------------------------------- */
      const proposalRes = await apiFetch<PublicProposalPayload>(
        `/share/proposal/${encodeURIComponent(value)}`
      );

      if (!proposalRes.error && proposalRes.data) {
        const proposal = proposalRes.data.proposal;

        state.value = {
          kind: "proposal",
          id: proposal.id,
          status: proposal.status ?? null,
          estimateToken: null,
          estimatePayload: null,
          proposalToken: proposal.publicToken ?? value,
          proposalPayload: proposalRes.data,
        };

        return;
      }

      /* ---------------------------------
         2) Try ESTIMATE by internal ID
         --------------------------------- */
      const est = await supabase
        .from("estimates")
        .select(
          "id, status, approval_token, user_id, client_id, project_title"
        )
        .eq("id", value)
        .maybeSingle();

      if (est.data) {
        const token = est.data.approval_token ?? null;

        state.value = {
          kind: "estimate",
          id: est.data.id,
          status: est.data.status ?? null,
          estimateToken: token,
          estimatePayload: null,
          proposalToken: null,
          proposalPayload: null,
        };

        // Load public estimate payload if token exists
        if (token) {
          const estRes = await apiFetch<PublicEstimatePayload>(
            `/share/estimate/${encodeURIComponent(token)}`
          );
          if (!estRes.error) {
            state.value.estimatePayload = estRes.data ?? null;
          }
        }

        return;
      }

      /* ---------------------------------
         Not found
         --------------------------------- */
      error.value = "Not found";
    } catch (e: any) {
      console.error(e);
      error.value = e?.message ?? "Failed to load";
    } finally {
      loading.value = false;
    }
  };

  /* -----------------------------
     Actions
  -------------------------------- */
  const approveEstimate = async (approverName?: string | null) => {
    if (!state.value.estimateToken) {
      return { error: "Missing estimate token" } as ApiResponse<unknown>;
    }

    const res = await apiFetch(
      `/share/estimate/${encodeURIComponent(
        state.value.estimateToken
      )}/approve`,
      {
        method: "POST",
        body: JSON.stringify({ name: approverName ?? null }),
      }
    );

    await load();
    return res;
  };

  return {
    loading,
    error,
    state,
    isEstimate,
    isProposal,
    proposalDisplayPayload,
    load,
    approveEstimate,
  };
}
