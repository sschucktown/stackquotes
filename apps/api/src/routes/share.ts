import { Hono } from "hono";
import { z } from "zod";
import {
  getEstimateByApprovalToken,
  getClient,
  getUserSettings,
  approveEstimateByToken,
} from "@stackquotes/db";
import { getServiceClient } from "../lib/supabase.js";
import { getEstimatePdfSignedUrl } from "../lib/storage.js";

const tokenParams = z.object({
  token: z.string().uuid(),
});

const approveBody = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(120, "Name must be 120 characters or fewer")
      .optional(),
  })
  .strict()
  .optional();

export const shareRouter = new Hono();

shareRouter.get("/estimate/:token", async (c) => {
  const { token } = tokenParams.parse(c.req.param());
  const supabase = getServiceClient();
  const estimate = await getEstimateByApprovalToken(supabase, token);
  if (!estimate) {
    c.status(404);
    return c.json({ error: "This approval link is invalid or has expired." });
  }

  const client = await getClient(supabase, estimate.userId, estimate.clientId);
  if (!client) {
    c.status(404);
    return c.json({ error: "Client not found for this estimate." });
  }
  const settings = await getUserSettings(supabase, estimate.userId);
  const downloadUrl = await getEstimatePdfSignedUrl(estimate.userId, estimate.id);

  return c.json({
    data: {
      estimate,
      client,
      settings,
      downloadUrl,
    },
  });
});

shareRouter.post("/estimate/:token/approve", async (c) => {
  const { token } = tokenParams.parse(c.req.param());
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    body = undefined;
  }
  const parsed = approveBody.parse(body);
  const supabase = getServiceClient();
  const estimate = await approveEstimateByToken(supabase, token, {
    approverName: parsed?.name ?? null,
  });
  if (!estimate) {
    c.status(400);
    return c.json({ error: "This approval link is invalid or has expired." });
  }
  return c.json({ data: estimate });
});
