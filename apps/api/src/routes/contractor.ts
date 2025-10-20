import { Hono } from "hono";
import { z } from "zod";
import { Buffer } from "node:buffer";
import { requireUser } from "../lib/auth.js";
import { getServiceClient } from "../lib/supabase.js";
import { uploadPublicAsset } from "../lib/storage.js";
import { getContractorProfile, listUserProjects, upsertContractorProfile } from "@stackquotes/db";

const slugSchema = z
  .string()
  .regex(/^[a-z0-9-]{3,30}$/i, "Slug can only include letters, numbers, and hyphens (3-30 characters)")
  .optional()
  .nullable();

const profileSchema = z.object({
  businessName: z.string().max(120).optional().nullable(),
  ownerName: z.string().max(120).optional().nullable(),
  tradeType: z.string().max(120).optional().nullable(),
  trade: z.string().max(120).optional().nullable(),
  averageProjectSize: z
    .enum(["< $5K", "$5-15K", "$15-50K", "$50K+"])
    .optional()
    .nullable(),
  city: z.string().max(120).optional().nullable(),
  state: z.string().max(60).optional().nullable(),
  phone: z.string().max(60).optional().nullable(),
  email: z.string().email().optional().nullable(),
  publicSlug: slugSchema,
  logoUrl: z.string().url().optional().nullable(),
});

const logoSchema = z.object({
  fileName: z.string().min(1),
  contentType: z.string().min(1),
  data: z.string().min(1),
});

export const contractorRouter = new Hono();

contractorRouter.get("/profile", async (c) => {
  const user = await requireUser(c);
  const supabase = getServiceClient();
  const data = await getContractorProfile(supabase, user.id);
  return c.json({ data });
});

contractorRouter.get("/projects", async (c) => {
  const user = await requireUser(c);
  const supabase = getServiceClient();
  const data = await listUserProjects(supabase, user.id);
  return c.json({ data });
});

contractorRouter.post("/profile", async (c) => {
  const user = await requireUser(c);
  const payload = profileSchema.parse(await c.req.json());
  const supabase = getServiceClient();
  try {
    const data = await upsertContractorProfile(supabase, {
      userId: user.id,
      businessName: payload.businessName ?? null,
      ownerName: payload.ownerName ?? null,
      tradeType: payload.tradeType ?? null,
      trade: payload.trade ?? payload.tradeType ?? null,
      averageProjectSize: payload.averageProjectSize ?? null,
      city: payload.city ?? null,
      state: payload.state ?? null,
      phone: payload.phone ?? null,
      email: payload.email ?? null,
      publicSlug: payload.publicSlug ? payload.publicSlug.toLowerCase() : null,
      logoUrl: payload.logoUrl ?? null,
    });
    return c.json({ data });
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      c.status(409);
      return c.json({ error: "That public URL is already in use. Please choose another." });
    }
    throw error;
  }
});

contractorRouter.post("/logo", async (c) => {
  const user = await requireUser(c);
  const payload = logoSchema.parse(await c.req.json());
  const supabase = getServiceClient();

  const base64 = payload.data.includes(",") ? payload.data.split(",").pop() ?? "" : payload.data;
  if (!base64) {
    c.status(400);
    return c.json({ error: "Invalid file data" });
  }

  const buffer = Buffer.from(base64, "base64");
  const sanitizedName = payload.fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const storagePath = `${user.id}/branding/${timestamp}-${sanitizedName}`.toLowerCase();

  const publicUrl = await uploadPublicAsset("brand-assets", storagePath, new Uint8Array(buffer), {
    contentType: payload.contentType,
  });

  const data = await upsertContractorProfile(supabase, {
    userId: user.id,
    logoUrl: publicUrl,
  });

  return c.json({ data, publicUrl });
});
