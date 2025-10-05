import { Hono } from "hono";
import { z } from "zod";
import { requireUser } from "../lib/auth.js";
import { getServiceClient } from "../lib/supabase.js";
import { getEstimate, getClient } from "@stackquotes/db";
import { sendEstimateEmail } from "../lib/email.js";

const schema = z.object({
  estimateId: z.string().uuid(),
  to: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1),
  downloadUrl: z.string().url().optional(),
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

  const html = `
    <h1>${estimate.projectTitle}</h1>
    <p>${payload.message}</p>
    <ul>
      <li>Total: $${estimate.total.toFixed(2)}</li>
      <li>Status: ${estimate.status}</li>
    </ul>
    ${payload.downloadUrl ? `<p><a href="${payload.downloadUrl}">Download Estimate PDF</a></p>` : ""}
  `;

  await sendEstimateEmail({
    to: payload.to,
    subject: payload.subject,
    html,
  });

  return c.json({ data: { sent: true } });
});

