import { Hono } from "hono";
import { z } from "zod";
import {
  createEstimateRecord,
  duplicateEstimate,
  listEstimates,
  updateEstimateRecord,
} from "@stackquotes/db";
import { requireUser } from "../lib/auth.js";
import { getServiceClient } from "../lib/supabase.js";

const lineItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1),
  quantity: z.number().min(0),
  unitPrice: z.number().min(0),
  total: z.number().optional(),
  cost: z.number().optional().nullable(),
});

const createSchema = z.object({
  clientId: z.string().uuid(),
  projectTitle: z.string().min(1),
  lineItems: z.array(lineItemSchema).min(1),
  notes: z.string().optional(),
  status: z.enum(["draft", "sent", "accepted", "declined"]).optional(),
  taxRate: z.number().min(0).max(1).optional(),
  jobId: z.string().optional().nullable(),
});

const updateSchema = createSchema.partial().extend({
  id: z.string().uuid(),
});

const listSchema = z.object({
  status: z.enum(["draft", "sent", "accepted", "declined"]).optional(),
  search: z.string().optional(),
});

const duplicateSchema = z.object({
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
  const data = await createEstimateRecord(supabase, { ...payload, userId: user.id });
  return c.json({ data });
});

estimatesRouter.patch("/update", async (c) => {
  const user = await requireUser(c);
  const payload = updateSchema.parse(await c.req.json());
  const supabase = getServiceClient();
  const data = await updateEstimateRecord(supabase, { ...payload, userId: user.id });
  return c.json({ data });
});

estimatesRouter.post("/duplicate", async (c) => {
  const user = await requireUser(c);
  const payload = duplicateSchema.parse(await c.req.json());
  const supabase = getServiceClient();
  const data = await duplicateEstimate(supabase, { ...payload, userId: user.id });
  return c.json({ data });
});

