import { ref, computed } from "vue";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/http";
import type { ApiResponse, Estimate, Proposal, ProposalDepositConfig } from "@stackquotes/types";

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

  estimateToken: string | null;
  estimatePayload: PublicEstimatePayload | null;

  linkedProposalId: string | null;
  linkedProposalToken: string | null;

  proposalToken: string | null;
  proposalPayload: PublicProposalPayload | null;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function useProposal(idOrToken: string) {
  const loading = ref(false);
  const error = ref<string | null>(null);

  const state = ref<UnifiedProposalState>({
    kind: null,
    id: null,
    status: null,

    estimateToken: null,
    estimatePayload: null,

    linkedProposalId: null,
    linkedProposalToken: null,

    proposalToken: null,
    proposalPayload: null,
  });

  const isEstimate = computed(() => state.value.kind === "estimate");
  const isProposal = computed(() => state.value.kind === "proposal");
  const proposalDisplayPayload = computed(() => state.value.proposalPayload);

  const load = async () => {
    const identifier = (idOrToken ?? "").toString().trim();
    if (!identifier) {
      error.value = "Not found";
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const isUuid = UUID_REGEX.test(identifier);

      /* -------------------------------------------------
         1) UUID PATH — internal proposal ID FIRST
         ------------------------------------------------- */
      if (isUuid) {
        const sp = await supabase
          .from("smart_proposals")
          .select(
            "id, status, public_token, quickquote_id, accepted_option, payment_link_url, user_id, client_id, title, description"
          )
          .eq("id", identifier)
          .maybeSingle();

        if (sp.data) {
          const proposalId = sp.data.id as string;
          const token = (sp.data as any).public_token as string | null;

          state.value.kind = "proposal";
          state.value.id = proposalId;
          state.value.status = (sp.data as any).status ?? null;
          state.value.proposalToken = token;
          state.value.linkedProposalId = proposalId;
          state.value.linkedProposalToken = token;

          if (token) {
            const res = await apiFetch<PublicProposalPayload>(
              `/share/proposal/${encodeURIComponent(token)}`
            );
            if (!res.error) {
              state.value.proposalPayload = res.data ?? null;
              return;
            }
          }
        }
      }

      /* -------------------------------------------------
         2) TOKEN PATH — public proposal links
         ------------------------------------------------- */
      const publicRes = await apiFetch<PublicProposalPayload>(
        `/share/proposal/${encodeURIComponent(identifier)}`
      );

      if (!publicRes.error && publicRes.data) {
        const proposal = publicRes.data.proposal;

        state.value.kind = "proposal";
        state.value.id = proposal.id;
        state.value.status = (proposal as any).status ?? null;
        state.value.proposalToken = proposal.publicToken ?? identifier;
        state.value.linkedProposalId = proposal.id;
        state.value.linkedProposalToken = proposal.publicToken ?? identifier;
        state.value.proposalPayload = publicRes.data;
        return;
      }

      /* -------------------------------------------------
         3) ESTIMATE FALLBACK — legacy / QuickQuote
         ------------------------------------------------- */
      const est = await supabase
        .from("estimates")
        .select(
          "id, status, approval_token, converted_to_proposal, user_id, client_id, project_title, subtotal, tax, total, notes"
        )
        .eq("id", identifier)
        .maybeSingle();

      if (est.data) {
        const estimateId = est.data.id as string;
        const token = (est.data as any).approval_token as string | null;

        state.value.kind = "estimate";
        state.value.id = estimateId;
        state.value.status = (est.data as any).status ?? null;
        state.value.estimateToken = token;

        if (token) {
          const res = await apiFetch<PublicEstimatePayload>(
            `/share/estimate/${encodeURIComponent(token)}`
          );
          if (!res.error) {
            state.value.estimatePayload = res.data ?? null;
          }
        }

        const linked = await supabase
          .from("smart_proposals")
          .select("id, public_token, status")
          .eq("quickquote_id", estimateId)
          .maybeSingle();

        if (linked.data) {
          state.value.linkedProposalId = linked.data.id as string;
          state.value.linkedProposalToken =
            (linked.data as any).public_token as string | null;

          if (state.value.linkedProposalToken) {
            const res2 = await apiFetch<PublicProposalPayload>(
              `/share/proposal/${encodeURIComponent(
                state.value.linkedProposalToken
              )}`
            );
            if (!res2.error) {
              state.value.proposalPayload = res2.data ?? null;
            }
          }
        }

        return;
      }

      error.value = "Not found";
    } catch (e: any) {
      console.error(e);
      error.value = e?.message ?? "Failed to load";
    } finally {
      loading.value = false;
    }
  };

  const approveEstimate = async (approverName?: string | null) => {
    if (!state.value.estimateToken) {
      return { error: "Missing estimate token" } as ApiResponse<unknown>;
    }

    const res = await apiFetch(
      `/share/estimate/${encodeURIComponent(state.value.estimateToken)}/approve`,
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
