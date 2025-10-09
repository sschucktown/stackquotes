import { Hono } from "hono";
import { z } from "zod";
import { requireUser } from "../lib/auth.js";
import { getServiceClient } from "../lib/supabase.js";
import {
  getEstimate,
  getClient,
  getUserSettings,
  updateEstimateRecord,
  issueEstimateApprovalToken,
  createProposalEvent,
  findProposalEventByToken,
} from "@stackquotes/db";
import { sendEstimateEmail } from "../lib/email.js";
import { loadServerConfig } from "@stackquotes/config";
import { renderEstimateEmail } from "../lib/templates/email.js";
import { randomUUID } from "node:crypto";

const schema = z.object({
  estimateId: z.string().uuid(),
  to: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1),
  downloadUrl: z.string().url().optional(),
  template: z.enum(["modern", "premium", "classic"]).optional(),
});

const openQuerySchema = z.object({
  id: z.string().uuid(),
  token: z.string().uuid(),
});

export const emailRouter = new Hono();

const stripTrailingSlash = (value?: string | null): string | undefined =>
  value ? value.replace(/\/$/, "") : undefined;

const getRequestOrigin = (url: string): string | undefined => {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return undefined;
  }
};

let cachedServerConfig: ReturnType<typeof loadServerConfig> | null = null;
const getServerConfig = () => {
  if (!cachedServerConfig) {
    cachedServerConfig = loadServerConfig();
  }
  return cachedServerConfig;
};

const TRANSPARENT_PIXEL = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC",
  "base64"
);

const TRACKING_PIXEL_HEADERS = {
  "Content-Type": "image/png",
  "Cache-Control": "no-store, max-age=0, must-revalidate",
  "Pragma": "no-cache",
  "Content-Length": TRANSPARENT_PIXEL.length.toString(),
};

emailRouter.get("/open", async (c) => {
  const respondWithPixel = () => c.body(TRANSPARENT_PIXEL, 200, TRACKING_PIXEL_HEADERS);

  const query = {
    id: c.req.query("id"),
    token: c.req.query("token"),
  };

  const parsed = openQuerySchema.safeParse(query);
  if (!parsed.success) {
    return respondWithPixel();
  }

  const { id: estimateId, token } = parsed.data;

  try {
    const supabase = getServiceClient();
    const trackingEvent = await findProposalEventByToken(supabase, token, {
      event: "email_tracking",
      estimateId,
    });
    if (!trackingEvent) {
      return respondWithPixel();
    }

    const existingOpen = await findProposalEventByToken(supabase, token, {
      event: "email_open",
      estimateId,
    });
    if (!existingOpen) {
      const forwardedFor = c.req.header("x-forwarded-for");
      const ip =
        c.req.header("cf-connecting-ip") ??
        c.req.header("x-real-ip") ??
        (forwardedFor ? forwardedFor.split(",")[0]?.trim() : null) ??
        null;
      const userAgent = c.req.header("user-agent") ?? null;

      await createProposalEvent(supabase, {
        userId: trackingEvent.userId,
        estimateId: trackingEvent.estimateId,
        event: "email_open",
        token,
        metadata: {
          source: "tracking_pixel",
          ip,
          userAgent,
        },
      });
    }
  } catch (error) {
    console.error("[api/email/open] failed to record open event", error);
  }

  return respondWithPixel();
});

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

  const { token, estimate: estimateWithToken } = await issueEstimateApprovalToken(supabase, {
    estimateId: estimate.id,
    userId: user.id,
  });

  const config = getServerConfig();
  const baseAppUrl =
    stripTrailingSlash(config.BASE_APP_URL) ??
    stripTrailingSlash(getRequestOrigin(c.req.url));
  const approvalUrl = baseAppUrl ? `${baseAppUrl}/share/estimate/${token}` : undefined;

  const shouldMarkAsSent = estimateWithToken.status === "draft";
  const statusForEmail = shouldMarkAsSent ? "sent" : estimateWithToken.status;

  const trackingBaseUrl =
    stripTrailingSlash(config.EMAIL_TRACKING_BASE_URL) ??
    stripTrailingSlash(config.BASE_API_URL) ??
    stripTrailingSlash(getRequestOrigin(c.req.url));
  let trackingPixelUrl: string | undefined;
  if (trackingBaseUrl) {
    const trackingToken = randomUUID();
    try {
      await createProposalEvent(supabase, {
        userId: user.id,
        estimateId: estimate.id,
        event: "email_tracking",
        token: trackingToken,
        metadata: {
          recipient: payload.to,
        },
      });
      trackingPixelUrl = `${trackingBaseUrl}/api/email/open?id=${estimate.id}&token=${trackingToken}`;
    } catch (error) {
      console.error("[api/email/send] failed to create tracking token", error);
      trackingPixelUrl = undefined;
    }
  }

  const rendered = await renderEstimateEmail({
    estimate: estimateWithToken,
    client,
    settings,
    message: payload.message,
    downloadUrl: payload.downloadUrl,
    template: payload.template ?? settings?.estimateTemplate ?? undefined,
    approvalUrl,
    trackingPixelUrl,
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

  return c.json({
    data: {
      sent: true,
      status: statusForEmail,
      template: rendered.template,
      approvalUrl,
    },
  });
});


