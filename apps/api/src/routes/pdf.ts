import { Hono } from "hono";
import { z } from "zod";
import { requireUser } from "../lib/auth.js";
import { getServiceClient } from "../lib/supabase.js";
import { generateEstimatePdf } from "../lib/pdf.js";
import { uploadPdf } from "../lib/storage.js";
import { getClient, getEstimate, getUserSettings } from "@stackquotes/db";

const schema = z.object({
  estimateId: z.string().uuid(),
});

export const pdfRouter = new Hono();

pdfRouter.post("/generate", async (c) => {
  const user = await requireUser(c);
  const { estimateId } = schema.parse(await c.req.json());
  const supabase = getServiceClient();

  const estimate = await getEstimate(supabase, user.id, estimateId);
  if (!estimate) {
    c.status(404);
    return c.json({ error: "Estimate not found" });
  }

  const client = await getClient(supabase, user.id, estimate.clientId);
  if (!client) {
    c.status(404);
    return c.json({ error: "Client not found" });
  }

  const settings = await getUserSettings(supabase, user.id);
  const pdfBytes = await generateEstimatePdf(estimate, client, {
    companyName: settings?.companyName,
    logoUrl: settings?.logoUrl,
    footerText: settings?.footerText,
  });
  const storagePath = `${user.id}/${estimate.id}.pdf`;
  const downloadUrl = await uploadPdf(storagePath, pdfBytes);
  return c.json({ data: { estimateId: estimate.id, downloadUrl } });
});

