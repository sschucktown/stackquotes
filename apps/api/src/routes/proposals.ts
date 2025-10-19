import { Hono } from "hono";
import { z } from "zod";
import {
  createProposalRecord,
  findProposalByQuickquote,
  getContractorProfile,
  getEstimate,
  listProposals,
  updateProposalStatus,
} from "@stackquotes/db";
import { requireUser } from "../lib/auth.js";
import { getServiceClient } from "../lib/supabase.js";
import { createSmartProposalFromLineItems } from "../lib/smartProposal.js";

const generateSchema = z.object({
  estimateId: z.string().uuid(),
});

const listSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

const acceptSchema = z.object({
  proposalId: z.string().uuid(),
  optionName: z.string().min(1),
});

export const proposalsRouter = new Hono();

proposalsRouter.get("/list", async (c) => {
  const user = await requireUser(c);
  const query = listSchema.parse(c.req.query());
  const supabase = getServiceClient();
  const data = await listProposals(supabase, user.id);
  const limited = typeof query.limit === "number" ? data.slice(0, query.limit) : data;
  return c.json({ data: limited });
});

proposalsRouter.post("/generate", async (c) => {
  const user = await requireUser(c);
  const payload = generateSchema.parse(await c.req.json());
  const supabase = getServiceClient();

  const existing = await findProposalByQuickquote(supabase, user.id, payload.estimateId);
  if (existing) {
    return c.json({ data: existing, meta: { alreadyExists: true } });
  }

  const estimate = await getEstimate(supabase, user.id, payload.estimateId);
  if (!estimate) {
    c.status(404);
    return c.json({ error: "Estimate not found" });
  }

  const profile = await getContractorProfile(supabase, user.id);
  const { options, totals } = createSmartProposalFromLineItems(estimate.lineItems, {
    businessName: profile?.businessName ?? undefined,
  });

  const data = await createProposalRecord(supabase, {
    userId: user.id,
    quickquoteId: payload.estimateId,
    options,
    totals,
    status: "Generated",
  });

  return c.json({ data, meta: { alreadyExists: false } });
});

proposalsRouter.post("/accept", async (c) => {
  const user = await requireUser(c);
  const payload = acceptSchema.parse(await c.req.json());
  const supabase = getServiceClient();
  const data = await updateProposalStatus(supabase, {
    userId: user.id,
    proposalId: payload.proposalId,
    status: "Accepted",
    acceptedOption: payload.optionName,
  });
  return c.json({ data });
});
