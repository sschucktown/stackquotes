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
  const { data: billing } = await supabase
    .from("users")
    .select("subscription_tier, trial_end, addons")
    .eq("id", user.id)
    .maybeSingle();

  const tier = typeof billing?.subscription_tier === "string" ? billing.subscription_tier.toLowerCase() : "launch";
  const trialEndRaw = billing?.trial_end ?? null;
  let inTrial = false;
  if (typeof trialEndRaw === "string") {
    const trialDate = new Date(trialEndRaw);
    if (!Number.isNaN(trialDate.getTime()) && trialDate.getTime() > Date.now()) {
      inTrial = tier === "pro" || tier === "crew";
    }
  }

  const addons = ((billing?.addons ?? {}) as Record<string, unknown>) ?? {};
  const hasWhiteLabel = (() => {
    const v = addons.branding ?? addons.white_label;
    if (typeof v === "boolean") return v;
    if (typeof v === "string") return v.toLowerCase() === "true";
    if (typeof v === "number") return v === 1;
    return false;
  })();

  const watermarkText = tier === "pro" || tier === "crew" || inTrial || hasWhiteLabel ? null : "StackQuotes Free Plan";

  const pdfBytes = await generateEstimatePdf(estimate, client, {
    settings,
    template: settings?.estimateTemplate ?? undefined,
    watermarkText,
  });
  const storagePath = `${user.id}/${estimate.id}.pdf`;
  const downloadUrl = await uploadPdf(storagePath, pdfBytes);
  return c.json({ data: { estimateId: estimate.id, downloadUrl } });
});

