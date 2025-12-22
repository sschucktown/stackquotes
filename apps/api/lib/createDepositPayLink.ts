import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Creates (or reuses) a deposit payment link for a job.
 * For now this is a stub that records intent and returns null.
 * Later this will generate a Stripe / PayLink URL.
 */
export async function createDepositPayLink({
  supabase,
  jobId,
  amount,
}: {
  supabase: SupabaseClient;
  jobId: string;
  amount: number;
}): Promise<string | null> {
  if (!amount || amount <= 0) {
    return null;
  }

  // 🔒 Phase 1: no external payment provider yet
  // We simply store that a deposit is required
  const { error } = await supabase
    .from("jobs")
    .update({
      deposit_amount: amount,
    })
    .eq("id", jobId);

  if (error) {
    console.error("[DEPOSIT] failed to record deposit amount", error);
    throw new Error("Failed to record deposit");
  }

  // Future:
  // return generated Stripe / PayLink URL
  return null;
}
