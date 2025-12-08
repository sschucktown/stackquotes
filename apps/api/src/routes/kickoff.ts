import { Hono } from "hono";
import { z } from "zod";
import { getServiceClient } from "../lib/supabase.js";
import { requireUser } from "../lib/auth.js";
import { updateProposalRecord } from "@stackquotes/db";

const sendSchema = z.object({
  proposalId: z.string().uuid(),
  arrivalWindow: z.string().min(1),
  leadName: z.string().min(1),
  leadPhone: z.string().min(1),
  materialNotes: z.string().optional().nullable(),
  accessNotes: z.string().optional().nullable(),
});

const viewedSchema = z.object({
  proposalId: z.string().uuid(),
});

export const kickoffRouter = new Hono();

kickoffRouter.post("/send", async (c) => {
  const user = await requireUser(c);
  const body = await c.req.json();
  const parsed = sendSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.message }, 400);
  }
  const supabase = getServiceClient();
  const now = new Date().toISOString();
  const input = parsed.data;

  const updated = await updateProposalRecord(supabase, {
    userId: user.id,
    proposalId: input.proposalId,
    kickoffStatus: "sent",
    kickoffSentAt: now,
    kickoffDetails: {
      arrivalWindow: input.arrivalWindow,
      leadName: input.leadName,
      leadPhone: input.leadPhone,
      materialNotes: input.materialNotes ?? "",
      accessNotes: input.accessNotes ?? "",
    },
    crewArrivalWindow: input.arrivalWindow,
    crewLeadName: input.leadName,
    crewLeadPhone: input.leadPhone,
    materialsDropNotes: input.materialNotes ?? "",
    accessNotes: input.accessNotes ?? "",
  });

  return c.json({ data: updated });
});

kickoffRouter.post("/viewed", async (c) => {
  const body = await c.req.json();
  const parsed = viewedSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: parsed.error.message }, 400);
  }
  const supabase = getServiceClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("smart_proposals")
    .update({ kickoff_status: "viewed", kickoff_viewed_at: now })
    .eq("id", parsed.data.proposalId)
    .select("*")
    .maybeSingle();
  if (error) {
    console.error("[kickoff/viewed] update error", error);
    return c.json({ error: "Failed to update kickoff status" }, 500);
  }
  return c.json({ data });
});
