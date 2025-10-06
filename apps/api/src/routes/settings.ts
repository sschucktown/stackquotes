import { Hono } from "hono";
import { z } from "zod";
import { getUserSettings, upsertUserSettings } from "@stackquotes/db";
import { requireUser } from "../lib/auth.js";
import { getServiceClient } from "../lib/supabase.js";

const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, { message: "Accent color must be a valid hex code" });

const updateSchema = z.object({
  defaultTaxRate: z.number().min(0).max(1).optional(),
  footerText: z.string().optional(),
  logoUrl: z.string().url().optional(),
  companyName: z.string().optional(),
  orgId: z.string().optional().nullable(),
  accentColor: z.union([hexColor, z.literal(null)]).optional(),
  estimateTemplate: z.enum(["modern", "premium", "classic"]).optional(),
});

export const settingsRouter = new Hono();

settingsRouter.get("/current", async (c) => {
  const user = await requireUser(c);
  const supabase = getServiceClient();
  const data = await getUserSettings(supabase, user.id);
  return c.json({ data });
});

settingsRouter.post("/update", async (c) => {
  const user = await requireUser(c);
  const payload = updateSchema.parse(await c.req.json());
  const supabase = getServiceClient();
  const data = await upsertUserSettings(supabase, { ...payload, userId: user.id });
  return c.json({ data });
});

