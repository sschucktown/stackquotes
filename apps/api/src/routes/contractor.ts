import { Hono } from "hono";
import { z } from "zod";
import { Buffer } from "node:buffer";
import { requireUser } from "../lib/auth.js";
import { getServiceClient } from "../lib/supabase.js";
import { uploadPublicAsset } from "../lib/storage.js";
import { getContractorProfile, upsertContractorProfile } from "@stackquotes/db";

const profileSchema = z.object({
  businessName: z.string().max(120).optional().nullable(),
  ownerName: z.string().max(120).optional().nullable(),
  tradeType: z.string().max(120).optional().nullable(),
  city: z.string().max(120).optional().nullable(),
  state: z.string().max(60).optional().nullable(),
  phone: z.string().max(60).optional().nullable(),
  email: z.string().email().optional().nullable(),
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

contractorRouter.post("/profile", async (c) => {
  const user = await requireUser(c);
  const payload = profileSchema.parse(await c.req.json());
  const supabase = getServiceClient();
  const data = await upsertContractorProfile(supabase, {
    userId: user.id,
    businessName: payload.businessName ?? null,
    ownerName: payload.ownerName ?? null,
    tradeType: payload.tradeType ?? null,
    city: payload.city ?? null,
    state: payload.state ?? null,
    phone: payload.phone ?? null,
    email: payload.email ?? null,
    logoUrl: payload.logoUrl ?? null,
  });
  return c.json({ data });
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

