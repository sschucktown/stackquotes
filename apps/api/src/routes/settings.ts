import { Hono } from "hono";
import { z } from "zod";
import { getUserSettings, upsertUserSettings } from "@stackquotes/db";
import { uploadPublicAsset } from "../lib/storage.js";
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

const uploadLogoSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  data: z.string().min(1),
});

export const settingsRouter = new Hono();


settingsRouter.post("/logo/upload", async (c) => {
  const user = await requireUser(c);
  const payload = uploadLogoSchema.parse(await c.req.json());
  const supabase = getServiceClient();

  const base64 = payload.data.includes(',') ? payload.data.split(',').pop() ?? '' : payload.data;
  if (!base64) {
    c.status(400);
    return c.json({ error: "Invalid file data" });
  }
  const buffer = Buffer.from(base64, 'base64');
  const sanitizedName = payload.fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const storagePath = `${user.id}/logos/${timestamp}-${sanitizedName}`.toLowerCase();

  const publicUrl = await uploadPublicAsset('brand-assets', storagePath, new Uint8Array(buffer), {
    contentType: payload.contentType,
  });

  const data = await upsertUserSettings(supabase, {
    userId: user.id,
    logoUrl: publicUrl,
  });

  return c.json({ data });
});

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

