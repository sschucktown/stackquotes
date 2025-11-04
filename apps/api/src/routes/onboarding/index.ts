import { Hono } from "hono";
import { getServiceClient } from "../../lib/supabase.js";

export const onboardingRouter = new Hono();

onboardingRouter.post("/seed-trade-templates", async (c) => {
  const supabase = getServiceClient();
  const body = await c.req.json().catch(() => null) as { user_id?: string; trade?: string } | null;
  const userId = body?.user_id?.trim();

  // Normalize incoming trade to match canonical seed values
  const normalizeTrade = (t: string | undefined | null): string | undefined => {
    if (!t) return undefined;
    const map: Record<string, string> = {
      Plumber: "Plumbing",
      Roofer: "Roofing",
      "Deck Builder": "Deck Building",
      Electrician: "Electrical",
    };
    return map[t] || t;
  };
  const trade = normalizeTrade(body?.trade?.trim());

  if (!userId || !trade) {
    c.status(400);
    return c.json({ error: "user_id and trade are required" });
  }

  // If already seeded, ensure the user actually has projects; if not, allow reseed
  const { data: profile, error: profileError } = await supabase
    .from("contractor_profiles")
    .select("trade_seeded")
    .eq("user_id", userId)
    .maybeSingle();
  if (profileError) throw profileError;
  if (profile?.trade_seeded) {
    const { count, error: countError } = await supabase
      .from("user_projects")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if (countError) throw countError;
    if ((count ?? 0) > 0) {
      return c.json({ ok: true, message: "Already seeded" });
    }
    // else continue to seed
  }

  // Load up to 10 templates for the trade
  const { data: projects, error: projectsError } = await supabase
    .from("trade_projects")
    .select("*")
    .eq("trade", trade)
    .order("created_at", { ascending: true })
    .limit(10);
  if (projectsError) throw projectsError;

  const projectTemplates = projects ?? [];

  if (!projectTemplates.length) {
    await supabase
      .from("contractor_profiles")
      .update({ trade_seeded: true, trade })
      .eq("user_id", userId);
    return c.json({ ok: true, count: 0 });
  }

  // Insert user projects based on templates
  const userProjectPayload = projectTemplates.map((p) => ({
    user_id: userId,
    trade,
    trade_project_id: p.id,
    project_name: p.project_name,
    description: p.description,
    base_price: p.base_price,
  }));

  const { data: inserted, error: insertProjectsError } = await supabase
    .from("user_projects")
    .insert(userProjectPayload, { defaultToNull: true })
    .select("id, trade_project_id, project_name");

  let userProjects: Array<{ id: string; trade_project_id: string | null; project_name: string }> = inserted ?? [];
  const templateIds = projectTemplates.map((p) => p.id);

  if (insertProjectsError) {
    if (insertProjectsError.code === "23505") {
      const { data: existing, error: fetchExistingError } = await supabase
        .from("user_projects")
        .select("id, trade_project_id, project_name")
        .eq("user_id", userId)
        .in("trade_project_id", templateIds);
      if (fetchExistingError) throw fetchExistingError;
      userProjects = existing ?? [];
    } else {
      throw insertProjectsError;
    }
  }

  // Fetch proposal templates for those projects
  const { data: proposalTemplates, error: proposalTemplatesError } = await supabase
    .from("trade_proposals")
    .select("*")
    .in("project_id", templateIds);
  if (proposalTemplatesError) throw proposalTemplatesError;

  const userProposalPayload = (proposalTemplates ?? [])
    .map((tpl) => {
      if (!tpl.project_id) return null;
      const proj = userProjects.find((p) => p.trade_project_id === tpl.project_id);
      if (!proj) return null;
      return {
        user_id: userId,
        user_project_id: proj.id,
        trade,
        project_name: proj.project_name,
        tier: tpl.tier,
        line_items: tpl.line_items ?? [],
        total_price: tpl.total_price,
      };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  if (userProposalPayload.length) {
    const { error: insertProposalsError } = await supabase
      .from("user_proposals")
      .insert(userProposalPayload, { defaultToNull: true });
    if (insertProposalsError && insertProposalsError.code !== "23505") {
      throw insertProposalsError;
    }
  }

  const { error: updateProfileError } = await supabase
    .from("contractor_profiles")
    .update({ trade_seeded: true, trade })
    .eq("user_id", userId);
  if (updateProfileError) throw updateProfileError;

  return c.json({ ok: true, count: projectTemplates.length });
});
