import { Hono } from "hono";
import { z } from "zod";
import { requireUser } from "../lib/auth.js";
import { getServiceClient } from "../lib/supabase.js";
import { getEstimate, getClient, getUserSettings, updateEstimateRecord } from "@stackquotes/db";
import { sendEstimateEmail } from "../lib/email.js";
import { renderEstimateEmail } from "../lib/templates/email.js";

const schema = z.object({
  estimateId: z.string().uuid(),
  to: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1),
  downloadUrl: z.string().url().optional(),
  template: z.enum(["modern", "premium", "classic"]).optional(),
});

export const emailRouter = new Hono();

emailRouter.post("/send", async (c) => {
  const user = await requireUser(c);
  const payload = schema.parse(await c.req.json());
  const supabase = getServiceClient();
  const estimate = await getEstimate(supabase, user.id, payload.estimateId);
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

  const shouldMarkAsSent = estimate.status === "draft";
  const statusForEmail = shouldMarkAsSent ? "sent" : estimate.status;

  const rendered = await renderEstimateEmail({
    estimate,
    client,
    settings,
    message: payload.message,
    downloadUrl: payload.downloadUrl,
    template: payload.template ?? settings?.estimateTemplate ?? undefined,
  });

  await sendEstimateEmail({
    to: payload.to,
    subject: payload.subject,
    html: rendered.html,
    contractorName: settings?.companyName ?? undefined,
  });

  if (shouldMarkAsSent) {
    await updateEstimateRecord(supabase, {
      id: estimate.id,
      userId: user.id,
      status: "sent",
    });
  }

  return c.json({ data: { sent: true, status: statusForEmail, template: rendered.template } });
});


