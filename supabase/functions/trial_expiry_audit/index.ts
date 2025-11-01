// Supabase Edge Function: trial_expiry_audit
// Purpose: Daily audit to mark expired trials and emit optional webhook events
// Env (optional): TRIAL_EXPIRY_WEBHOOK_URL

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface UserRow {
  id: string;
  subscription_tier: string | null;
  trial_end: string | null;
}

const isExpired = (trialEnd: string | null): boolean => {
  if (!trialEnd) return false;
  const d = new Date(trialEnd);
  return !Number.isNaN(d.getTime()) && d.getTime() < Date.now();
};

const postWebhook = async (userId: string) => {
  const url = Deno.env.get("TRIAL_EXPIRY_WEBHOOK_URL");
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "trial_expired", userId, at: new Date().toISOString() }),
    });
  } catch (e) {
    console.error("[trial_expiry_audit] webhook failed", e);
  }
};

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const projectUrl = Deno.env.get("SUPABASE_URL");
    if (!key || !projectUrl) {
      return new Response(JSON.stringify({ error: "Missing Supabase credentials" }), { status: 500 });
    }

    const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };

    // Fetch candidates with trial_end in the past and not on paid tiers
    const { data: users } = await fetch(`${projectUrl}/rest/v1/users?select=id,subscription_tier,trial_end`, {
      headers,
    }).then((r) => r.json() as Promise<{ data: UserRow[] } | UserRow[]>);

    const list: UserRow[] = Array.isArray(users) ? users : (users?.data ?? []);
    const toUpdate = list.filter(
      (u) => isExpired(u.trial_end) && !["pro", "crew"].includes((u.subscription_tier ?? "").toLowerCase())
    );

    let updated = 0;
    for (const user of toUpdate) {
      const nextTier = "expired_trial"; // aligns with DB enum addition
      await fetch(`${projectUrl}/rest/v1/users?id=eq.${user.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ subscription_tier: nextTier }),
      });
      updated++;
      await postWebhook(user.id);
    }

    return new Response(JSON.stringify({ ok: true, scanned: list.length, updated }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500 });
  }
});

