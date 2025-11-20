import { ref, computed } from "vue";
import { supabase } from "@/lib/supabase";
import { apiFetch } from "@/lib/http";
import type { ApiResponse, Estimate, Proposal } from "@stackquotes/types";

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
  config: unknown | null;
}

export interface PublicProposalPayload {
  proposal: Proposal;
  contractor: PublicProposalContractorBranding | null;
  client: { id: string; name: string; email?: string } | null;
  deposit: PublicProposalDepositMeta;
  paymentLinkUrl: string | null;
}

export interface UnifiedProposalState {
  kind: UnifiedType | null;
  id: string | null;
  status: string | null;
  // When the id refers to an estimate (QuickQuote)
  estimateToken: string | null; // public approval token
  estimatePayload: PublicEstimatePayload | null; // loaded via /share/estimate/:token
  // A linked smart proposal (if any)
  linkedProposalId: string | null;
  linkedProposalToken: string | null;
  proposalToken: string | null; // public proposal token (from email or payment redirect)
  proposalPayload: PublicProposalPayload | null; // loaded via /share/proposal/:token
}

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
      // 1) Try to interpret the identifier as a public SmartProposal token first.
      // This is used by email links and payment redirects that carry ?payment=...
      let publicTokenError: string | null = null;
      const publicRes = await apiFetch<PublicProposalPayload>(
        `/share/proposal/${encodeURIComponent(identifier)}`
      );
      if (!publicRes.error && publicRes.data) {
        const payload = publicRes.data;
        const proposal = payload.proposal;
        state.value.kind = "proposal";
        state.value.id = proposal.id;
        state.value.status = (proposal as any).status ?? null;
        state.value.proposalToken = proposal.publicToken ?? identifier;
        state.value.linkedProposalId = proposal.id;
        state.value.linkedProposalToken = proposal.publicToken ?? identifier;
        state.value.proposalPayload = payload;
        return;
      }
      publicTokenError = publicRes.error ?? null;

      // 2) Fallback to the previous ID-based behavior for internal usage or legacy links.
      //    Here the identifier is treated as an internal estimate/proposal ID.
      const internalId = identifier;

      // Try smart_proposals by internal ID
      const sp = await supabase
        .from("smart_proposals")
        .select(
          "id, status, public_token, quickquote_id, accepted_option, payment_link_url, user_id, client_id, title, description"
        )
        .eq("id", internalId)
        .maybeSingle();

      if (sp.data) {
        const proposalId = sp.data.id as string;
        const token = (sp.data as any).public_token as string | null;
        state.value.kind = "proposal";
        state.value.id = proposalId;
        state.value.status = (sp.data as any).status ?? null;
        state.value.proposalToken = token ?? identifier;
        state.value.linkedProposalId = proposalId;
        state.value.linkedProposalToken = token ?? identifier;

        if (token ?? identifier) {
          const res = await apiFetch<PublicProposalPayload>(
            `/share/proposal/${encodeURIComponent(token ?? identifier)}`
          );
          if (!res.error) {
            state.value.proposalPayload = res.data ?? null;
          }
        }
        return;
      }

      // Fallback to estimates by internal ID
      const est = await supabase
        .from("estimates")
        .select(
          "id, status, approval_token, converted_to_proposal, user_id, client_id, project_title, subtotal, tax, total, notes, created_at, updated_at"
        )
        .eq("id", internalId)
        .maybeSingle();

      if (est.data) {
        const estimateId = est.data.id as string;
        const token = (est.data as any).approval_token as string | null;
        state.value.kind = "estimate";
        state.value.id = estimateId;
        state.value.status = (est.data as any).status ?? null;
        state.value.estimateToken = token;

        // Load public estimate payload via API to stay consistent with existing flows
        if (token) {
          const res = await apiFetch<PublicEstimatePayload>(
            `/share/estimate/${encodeURIComponent(token)}`
          );
          if (res.error) {
            // Not fatal; show basic estimate view
            console.warn("[useProposal] failed to load public estimate payload:", res.error);
          } else {
            state.value.estimatePayload = res.data ?? null;
          }
        }

        // See if there is a linked smart proposal already
        const linked = await supabase
          .from("smart_proposals")
          .select("id, public_token, status")
          .eq("quickquote_id", estimateId)
          .maybeSingle();
        if (linked.data) {
          state.value.linkedProposalId = linked.data.id as string;
          state.value.linkedProposalToken = (linked.data as any).public_token as string | null;

          if (state.value.linkedProposalToken) {
            const res2 = await apiFetch<PublicProposalPayload>(
              `/share/proposal/${encodeURIComponent(state.value.linkedProposalToken)}`
            );
            if (!res2.error) {
              state.value.proposalPayload = res2.data ?? null;
            }
          }
        }
        return;
      }

      // If nothing resolved, prefer the more specific public-token error if we have one.
      error.value = publicTokenError ?? "Not found";
    } catch (e: any) {
      console.error(e);
      error.value = e?.message ?? "Failed to load";
    } finally {
      loading.value = false;
    }
  };

  const approveEstimate = async (approverName?: string | null) => {
    if (!state.value.estimateToken) return { error: "Missing estimate token" } as ApiResponse<unknown>;
    const res = await apiFetch(`/share/estimate/${encodeURIComponent(state.value.estimateToken)}/approve`, {
      method: "POST",
      body: JSON.stringify({ name: approverName ?? null }),
    });
    // Reload to reflect acceptance and potential linked smart proposal
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
