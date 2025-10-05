import { Hono } from "hono";
import { z } from "zod";
import { createClientRecord, listClients } from "@stackquotes/db";
import { requireUser } from "../lib/auth.js";
import { getServiceClient } from "../lib/supabase.js";

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const clientsRouter = new Hono();

clientsRouter.get("/list", async (c) => {
  const user = await requireUser(c);
  const supabase = getServiceClient();
  const data = await listClients(supabase, user.id);
  return c.json({ data });
});

clientsRouter.post("/create", async (c) => {
  const user = await requireUser(c);
  const payload = createSchema.parse(await c.req.json());
  const supabase = getServiceClient();
  const data = await createClientRecord(supabase, { ...payload, userId: user.id });
  return c.json({ data });
});

