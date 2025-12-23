import type { SupabaseClient } from "@supabase/supabase-js";

/* --------------------------------------------------
   Types
-------------------------------------------------- */

type CreateJobArgs = {
  supabase: SupabaseClient;
  proposal: {
    id: string;
    contractor_id: string | null;
    client_id: string | null;
    line_items: any;
    deposit_amount: number | null;
    status?: string;
    job_id?: string | null;
  };
  acceptedOption: string;
  actor?: "system" | "client" | "contractor";
};

type CreateJobResult = {
  job: {
    id: string;
  };
  approvedPrice: number;
};

/* --------------------------------------------------
   Helper
-------------------------------------------------- */

export async function createJobFromProposal(
  args: CreateJobArgs
): Promise<CreateJobResult> {
  const {
    supabase,
    proposal,
    acceptedOption,
  } = args;

  /* -----------------------------
     Guardrails
  ------------------------------ */

  if (!proposal?.id) {
    throw new Error("[JOB] Missing proposal.id");
  }

  if (!acceptedOption) {
    throw new Error("[JOB] Missing accepted option");
  }

  if (
    proposal.status &&
    proposal.status !== "sent" &&
    proposal.status !== "accepted"
  ) {
    throw new Error(
      `[JOB] Invalid proposal status '${proposal.status}' for job creation`
    );
  }

  /* -----------------------------
     Idempotency — job already exists
  ------------------------------ */

  if (proposal.job_id) {
    return {
      job: { id: proposal.job_id },
      approvedPrice: 0, // caller should already have this
    };
  }

  /* -----------------------------
     Resolve approved price
  ------------------------------ */

  let approvedPrice = 0;

  try {
    const payload: any = proposal.line_items;
    const options = Array.isArray(payload?.options) ? payload.options : [];

    const lower = acceptedOption.toLowerCase();

    const matched =
      options.find(
        (o: any) => (o?.name ?? "").toLowerCase() === lower
      ) ||
      options.find(
        (o: any) => (o?.name ?? "").toLowerCase() === "better"
      ) ||
      options[0];

    approvedPrice =
      Number(
        matched?.subtotal ??
        matched?.price ??
        matched?.total ??
        0
      ) || 0;
  } catch {
    approvedPrice = 0;
  }

  if (approvedPrice <= 0) {
    throw new Error("[JOB] Approved price resolved to 0");
  }

  /* -----------------------------
     Insert job
  ------------------------------ */

  const { data: job, error: jobErr } = await supabase
    .from("jobs")
    .insert({
      proposal_id: proposal.id,
      contractor_id: proposal.contractor_id,
      client_id: proposal.client_id,
      approved_option: acceptedOption,
      approved_price: approvedPrice,
      deposit_amount:
        proposal.deposit_amount !== null &&
        proposal.deposit_amount !== undefined
          ? Number(proposal.deposit_amount)
          : null,
      status: "pending",
    })
    .select("id")
    .single();

  if (jobErr || !job) {
    console.error("❌ [JOB] job create failed", jobErr);
    throw new Error("Failed to create job");
  }

  return {
    job,
    approvedPrice,
  };
}
