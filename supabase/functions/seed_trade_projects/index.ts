import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.3";

type Json = Record<string, unknown> | Json[] | string | number | boolean | null;

interface TradeProject {
  id: string;
  trade: string;
  project_name: string;
  description: string | null;
  base_price: number | null;
}

interface TradeProposalTemplate {
  id: string;
  project_id: string | null;
  tier: string;
  line_items: Json;
  total_price: number | null;
}

interface UserProject {
  id: string;
  trade_project_id: string | null;
  project_name: string;
}

const METHOD_NOT_ALLOWED = new Response("Method Not Allowed", { status: 405 });

const getSupabaseClient = (): SupabaseClient => {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase environment variables.");
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
};

serve(async (req) => {
  if (req.method !== "POST") {
    return METHOD_NOT_ALLOWED;
  }

  try {
    const body = await req.json().catch(() => null) as { user_id?: string; trade?: string } | null;
    const userId = body?.user_id?.trim();
    const trade = body?.trade?.trim();

    if (!userId || !trade) {
      return new Response(JSON.stringify({ error: "user_id and trade are required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = getSupabaseClient();

    const { data: profile, error: profileError } = await supabase
      .from("contractor_profiles")
      .select("trade_seeded")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError) {
      throw profileError;
    }

    if (profile?.trade_seeded) {
      return new Response(JSON.stringify({ status: "already-seeded" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data: projects, error: projectsError } = await supabase
      .from("trade_projects")
      .select("*")
      .eq("trade", trade)
      .order("created_at", { ascending: true })
      .limit(10);

    if (projectsError) {
      throw projectsError;
    }

    const projectTemplates: TradeProject[] = projects ?? [];

    if (!projectTemplates.length) {
      await supabase
        .from("contractor_profiles")
        .update({ trade_seeded: true, trade })
        .eq("user_id", userId);

      return new Response(JSON.stringify({ status: "ok", count: 0 }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userProjectPayload = projectTemplates.map((project) => ({
      user_id: userId,
      trade,
      trade_project_id: project.id,
      project_name: project.project_name,
      description: project.description,
      base_price: project.base_price,
    }));

    const { data: insertedProjects, error: insertProjectsError } = await supabase
      .from("user_projects")
      .insert(userProjectPayload, { defaultToNull: true })
      .select("id, trade_project_id, project_name");

    let userProjects: UserProject[] = insertedProjects ?? [];

    const templateIds = projectTemplates.map((project) => project.id);

    if (insertProjectsError) {
      if (insertProjectsError.code === "23505") {
        const { data: existingProjects, error: fetchExistingError } = await supabase
          .from("user_projects")
          .select("id, trade_project_id, project_name")
          .eq("user_id", userId)
          .in("trade_project_id", templateIds);
        if (fetchExistingError) {
          throw fetchExistingError;
        }
        userProjects = existingProjects ?? [];
      } else {
        throw insertProjectsError;
      }
    }

    const { data: proposalTemplates, error: proposalTemplatesError } = await supabase
      .from("trade_proposals")
      .select("*")
      .in("project_id", templateIds);

    if (proposalTemplatesError) {
      throw proposalTemplatesError;
    }

    const createUserProposalPayload = (template: TradeProposalTemplate) => {
      if (!template.project_id) return null;
      const userProject = userProjects.find((project) => project.trade_project_id === template.project_id);
      if (!userProject) return null;
      return {
        user_id: userId,
        user_project_id: userProject.id,
        trade,
        project_name: userProject.project_name,
        tier: template.tier,
        line_items: template.line_items ?? [],
        total_price: template.total_price,
      };
    };

    const userProposalPayload = (proposalTemplates ?? [])
      .map(createUserProposalPayload)
      .filter((proposal): proposal is NonNullable<typeof proposal> => Boolean(proposal));

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

    if (updateProfileError) {
      throw updateProfileError;
    }

    return new Response(
      JSON.stringify({ status: "ok", count: projectTemplates.length }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[seed_trade_projects] failed", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unexpected error." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
