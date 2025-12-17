import type { PublicProposal } from "@/modules/public/types/publicProposal";
import { apiFetch } from "@/lib/http";

/* -------------------------------------------------
   Public proposal fetch (TOKEN-BASED)
   Returns the proposal directly (NO payload wrapper)
-------------------------------------------------- */
export const fetchPublicProposal = (token: string) =>
  apiFetch<PublicProposal>(
    `/share/proposal/${encodeURIComponent(token)}`
  );

/* -------------------------------------------------
   Accept proposal option
   Returns updated proposal
-------------------------------------------------- */
export const acceptPublicProposal = (
  token: string,
  optionName: string
) =>
  apiFetch<PublicProposal>(
    `/share/proposal/${encodeURIComponent(token)}/accept`,
    {
      method: "POST",
      body: JSON.stringify({ optionName }),
    }
  );
