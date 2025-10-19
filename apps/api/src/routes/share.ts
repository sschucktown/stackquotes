import { Hono } from "hono";
import { z } from "zod";
import {
  getEstimateByApprovalToken,
  getClient,
  getUserSettings,
  approveEstimateByToken,
  updateEstimateStatus,
  createProposalEvent,
  findContractorProfileBySlug,
  getProposalSummaryForUser,
  listProposals,
} from "@stackquotes/db";
import { getServiceClient } from "../lib/supabase.js";
import { getEstimatePdfSignedUrl } from "../lib/storage.js";

const tokenParams = z.object({
  token: z.string().uuid(),
});

const slugParams = z.object({
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(30, "Slug must be at most 30 characters")
    .regex(/^[a-z0-9-]+$/i, "Slug can only include letters, numbers, and hyphens"),
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
  let estimate = await getEstimateByApprovalToken(supabase, token);
  if (!estimate) {
    c.status(404);
    return c.json({ error: "This approval link is invalid or has expired." });
  }

  if (estimate.status === "sent") {
    try {
      estimate = await updateEstimateStatus(supabase, {
        userId: estimate.userId,
        estimateId: estimate.id,
        status: "seen",
      });
      await createProposalEvent(supabase, {
        userId: estimate.userId,
        estimateId: estimate.id,
        event: "seen",
      });
    } catch (error) {
      console.error("[api/share] failed to mark estimate as seen", error);
    }
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

shareRouter.get("/profile/:slug", async (c) => {
  const { slug } = slugParams.parse(c.req.param());
  const supabase = getServiceClient();
  const profile = await findContractorProfileBySlug(supabase, slug.toLowerCase());
  if (!profile) {
    c.status(404);
    return c.json({ error: "This public profile could not be found." });
  }

  const [summary, proposals, settings] = await Promise.all([
    getProposalSummaryForUser(supabase, profile.userId),
    listProposals(supabase, profile.userId),
    getUserSettings(supabase, profile.userId),
  ]);

  const acceptanceRate = summary.totalProposals
    ? Math.round((summary.acceptedProposals / summary.totalProposals) * 100)
    : 0;
  const highlightedProposals = proposals.slice(0, 3).map((proposal) => ({
    id: proposal.id,
    quickquoteId: proposal.quickquoteId,
    status: proposal.status,
    totals: proposal.totals,
    options: proposal.options,
    createdAt: proposal.createdAt,
  }));

  return c.json({
    data: {
      profile,
      metrics: {
        totalProposals: summary.totalProposals,
        acceptedProposals: summary.acceptedProposals,
        acceptanceRate,
        revenueYtd: summary.revenueYtd,
        averageValue: summary.averageValue,
      },
      proposals: highlightedProposals,
      branding: settings
        ? {
            accentColor: settings.accentColor ?? null,
            companyName: settings.companyName ?? null,
            logoUrl: profile.logoUrl ?? settings.logoUrl ?? null,
            footerText: settings.footerText ?? null,
          }
        : null,
    },
  });
});
