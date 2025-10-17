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

const withTimeout = async <T>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
  let timeoutId: NodeJS.Timeout | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

export const clientsRouter = new Hono();

clientsRouter.get("/list", async (c) => {
  const requestId = randomUUID();
  console.log(`[clients/list] start request=${requestId}`);
  try {
    const user = await requireUser(c);
    console.log(`[clients/list] request=${requestId} user=${user.id}`);
    const supabase = getServiceClient();
    const data = await withTimeout(listClients(supabase, user.id), 15000, "listClients");
    console.log(`[clients/list] request=${requestId} success count=${data.length}`);
    return c.json({ data });
  } catch (error) {
    console.error(`[clients/list] request=${requestId} failed`, error);
    return c.json({ error: (error as Error).message ?? "Unknown error" }, 500);
  }
});

clientsRouter.post("/create", async (c) => {
  const requestId = randomUUID();
  console.log(`[clients/create] start request=${requestId}`);
  try {
    const user = await requireUser(c);
    console.log(`[clients/create] request=${requestId} user=${user.id}`);
    const payload = createSchema.parse(await withTimeout(c.req.json(), 8000, "parse body"));
    console.log(`[clients/create] request=${requestId} payload=%o`, payload);
    const supabase = getServiceClient();
    console.log(`[clients/create] request=${requestId} supabase client ready`);
    const createInput: ClientInput = {
      userId: user.id,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      address: payload.address,
    };
    const data = await withTimeout(createClientRecord(supabase, createInput), 15000, "createClientRecord");
    console.log(`[clients/create] request=${requestId} success client=${data.id}`);
    return c.json({ data });
  } catch (error) {
    console.error(`[clients/create] request=${requestId} failed`, error);
    const message = (error as Error).message ?? "Unknown error";
    const status = message.includes("timed out") ? 504 : 500;
    return c.json({ error: message }, status);
  }
});
