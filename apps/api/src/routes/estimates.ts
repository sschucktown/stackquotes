import { Hono } from "hono";
import { z } from "zod";
import {
  createEstimateRecord,
  createProposalEvent,
  duplicateEstimate,
  getUserSettings,
  listEstimates,
  updateEstimateRecord,
  updateEstimateStatus,
} from "@stackquotes/db";
import type {
  EstimateInput,
  EstimateUpdateInput,
  EstimateDuplicateInput,
} from "@stackquotes/db";
import type { LineItem } from "@stackquotes/types";
import { requireUser } from "../lib/auth.js";
import { getServiceClient } from "../lib/supabase.js";

const lineItemSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  quantity: z.number().min(0),
  unitPrice: z.number().min(0),
  total: z.number(),
  cost: z.number().optional().nullable(),
});

const createSchema = z.object({
  clientId: z.string().uuid(),
  projectTitle: z.string().min(1),
  lineItems: z.array(lineItemSchema).min(1),
  notes: z.string().optional(),
  status: z.enum(["draft", "sent", "seen", "accepted", "declined"]).optional(),
  taxRate: z.number().min(0).max(1).optional(),
  jobId: z.string().optional().nullable(),
});

const updateSchema = createSchema.partial().extend({
  id: z.string().uuid(),
});

const listSchema = z.object({
  status: z.enum(["draft", "sent", "seen", "accepted", "declined"]).optional(),
  search: z.string().optional(),
});

const duplicateSchema = z.object({
  id: z.string().uuid(),
});

const statusActionSchema = z.object({
  id: z.string().uuid(),
});

export const estimatesRouter = new Hono();

estimatesRouter.get("/list", async (c) => {
  const user = await requireUser(c);
  const query = listSchema.parse(c.req.query());
  const supabase = getServiceClient();
  const data = await listEstimates(supabase, user.id, query);
  return c.json({ data });
});

estimatesRouter.post("/create", async (c) => {
  const user = await requireUser(c);
  const payload = createSchema.parse(await c.req.json());
  const supabase = getServiceClient();
  const settings =
    payload.taxRate === undefined ? await getUserSettings(supabase, user.id) : null;
  const taxRate =
    payload.taxRate !== undefined ? payload.taxRate : settings?.defaultTaxRate ?? 0;
  const lineItems: LineItem[] = payload.lineItems.map((item) => ({
    id: item.id,
    description: item.description,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    total: item.total,
    cost: item.cost ?? undefined,
  }));
  const createInput: EstimateInput = {
    userId: user.id,
    clientId: payload.clientId,
    projectTitle: payload.projectTitle,
    lineItems,
    notes: payload.notes,
    status: payload.status,
    taxRate,
    jobId: payload.jobId ?? undefined,
  };
  const data = await createEstimateRecord(supabase, createInput);
  return c.json({ data });
});

estimatesRouter.patch("/update", async (c) => {
  const user = await requireUser(c);
  const payload = updateSchema.parse(await c.req.json());
  const supabase = getServiceClient();
  const { id, lineItems, ...rest } = payload;
  const updateInput: EstimateUpdateInput = {
    userId: user.id,
    id,
    ...rest,
    lineItems: lineItems
      ? lineItems.map<LineItem>((item) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
          cost: item.cost ?? undefined,
        }))
      : undefined,
  };
  const data = await updateEstimateRecord(supabase, updateInput);
  return c.json({ data });
});

estimatesRouter.post("/duplicate", async (c) => {
  const user = await requireUser(c);
  const payload = duplicateSchema.parse(await c.req.json());
  const supabase = getServiceClient();
  const duplicateInput: EstimateDuplicateInput = {
    userId: user.id,
    id: payload.id,
  };
  const data = await duplicateEstimate(supabase, duplicateInput);
  return c.json({ data });
});

estimatesRouter.post("/accept", async (c) => {
  const user = await requireUser(c);
  const payload = statusActionSchema.parse(await c.req.json());
  const supabase = getServiceClient();
  try {
    const data = await updateEstimateStatus(supabase, {
      userId: user.id,
      estimateId: payload.id,
      status: "accepted",
      approvedAt: new Date().toISOString(),
      approvedBy: user.id,
    });
    await createProposalEvent(supabase, {
      userId: user.id,
      estimateId: data.id,
      event: "accepted",
    });
    return c.json({ data });
  } catch (error) {
    if (error instanceof Error && error.message === "Estimate not found") {
      c.status(404);
      return c.json({ error: "Estimate not found" });
    }
    throw error;
  }
});

estimatesRouter.post("/decline", async (c) => {
  const user = await requireUser(c);
  const payload = statusActionSchema.parse(await c.req.json());
  const supabase = getServiceClient();
  try {
    const data = await updateEstimateStatus(supabase, {
      userId: user.id,
      estimateId: payload.id,
      status: "declined",
      approvedAt: null,
      approvedBy: null,
    });
    await createProposalEvent(supabase, {
      userId: user.id,
      estimateId: data.id,
      event: "declined",
    });
    return c.json({ data });
  } catch (error) {
    if (error instanceof Error && error.message === "Estimate not found") {
      c.status(404);
      return c.json({ error: "Estimate not found" });
    }
    throw error;
  }
});

