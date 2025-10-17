import { Hono } from "hono";
import { z } from "zod";
import { createClientRecord, listClients } from "@stackquotes/db";
import type { ClientInput } from "@stackquotes/db";
import { requireUser } from "../lib/auth.js";
import { getServiceClient } from "../lib/supabase.js";
import { randomUUID } from "node:crypto";

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
  const requestId = randomUUID();
  console.log(`[clients/create] start request=${requestId}`);
  try {
    const user = await requireUser(c);
    console.log(`[clients/create] request=${requestId} user=${user.id}`);
    const payload = createSchema.parse(await c.req.json());
    console.log(`[clients/create] request=${requestId} payload parsed`);
    const supabase = getServiceClient();
    const createInput: ClientInput = {
      userId: user.id,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      address: payload.address,
    };
    console.log(`[clients/create] request=${requestId} inserting client`);
    const data = await createClientRecord(supabase, createInput);
    console.log(`[clients/create] request=${requestId} success client=${data.id}`);
    return c.json({ data });
  } catch (error) {
    console.error(`[clients/create] request=${requestId} failed`, error);
    throw error;
  }
});
