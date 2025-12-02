import { Hono } from "hono";
import { z } from "zod";
import {
  getClient,
  getContractorProfile,
  getProposalById,
  getProposalByToken,
} from "@stackquotes/db";
import { requireUser } from "../../lib/auth.js";
import { getServiceClient } from "../../lib/supabase.js";
import { sendEstimateEmail } from "../../lib/email.js";
import { loadServerConfig } from "@stackquotes/config";

const paramsSchema = z.object({
  proposalId: z.string().uuid(),
});

const querySchema = z.object({
  token: z.string().uuid().optional(),
});

const bodySchema = z.object({
  message: z.string().min(1).max(5000),
});

const mapCommentRow = (row: Record<string, any>) => ({
  id: row.id as string,
  proposalId: row.proposal_id as string,
  authorType: (row.author_type as string | null) ?? (row.author_role as string | null) ?? "client",
  authorId: (row.author_id as string | null) ?? null,
  message: row.message as string,
  createdAt: (row.created_at as string) ?? new Date().toISOString(),
  updatedAt: (row.updated_at as string) ?? (row.created_at as string) ?? new Date().toISOString(),
  authorName: (row.author_name as string | null) ?? null,
});

const buildProposalUrl = (token: string | null | undefined): string | null => {
  if (!token) return null;
  const config = loadServerConfig();
  const base =
    config.BASE_APP_URL ||
    (config.BASE_API_URL ? config.BASE_API_URL.replace(/\/api$/, "") : null) ||
    "https://stackquotes.app";
  return `${base.replace(/\/$/, "")}/proposal/${token}`;
};

export const commentsRouter = new Hono();

commentsRouter.get("/", async (c) => {
  const supabase = getServiceClient();
  const params = paramsSchema.parse(c.req.param());
  const query = querySchema.parse(c.req.query());
  const token = query.token;

  // Access: contractor via session OR client via token
  const proposal = token
    ? await getProposalByToken(supabase, token)
    : await getProposalById(supabase, (await requireUser(c)).id, params.proposalId);

  if (!proposal) {
    c.status(404);
    return c.json({ error: "Proposal not found" });
  }

  const { data, error } = await supabase
    .from("proposal_comments")
    .select("*")
    .eq("proposal_id", proposal.id)
    .order("created_at", { ascending: true });

  if (error) {
    c.status(500);
    return c.json({ error: error.message });
  }

  const items = (data ?? []).map(mapCommentRow);
  return c.json({ data: items });
});

commentsRouter.post("/", async (c) => {
  const supabase = getServiceClient();
  const params = paramsSchema.parse(c.req.param());
  const query = querySchema.parse(c.req.query());
  const token = query.token;

  const body = bodySchema.parse(await c.req.json());
  const message = body.message.trim();

  const asClient = Boolean(token);
  const user = asClient ? null : await requireUser(c);

  const proposal = asClient
    ? await getProposalByToken(supabase, token!)
    : await getProposalById(supabase, user!.id, params.proposalId);

  if (!proposal) {
    c.status(404);
    return c.json({ error: "Proposal not found" });
  }

  const authorType: "client" | "contractor" = asClient ? "client" : "contractor";

  const clientRecord = await getClient(supabase, proposal.userId, proposal.clientId).catch(() => null);
  const contractorProfile = await getContractorProfile(supabase, proposal.userId).catch(() => null);

  const proposalId = proposal.id;
  if (!proposalId) {
    c.status(404);
    return c.json({ error: "Proposal not found" });
  }

  const insertPayload: Record<string, any> = {
    proposal_id: proposalId,
    author_type: authorType,
    message,
    author_role: authorType,
  };

  const authorIdValue = authorType === "contractor" ? user?.id ?? null : null;

  if (authorType === "contractor") {
    insertPayload.author_name = contractorProfile?.businessName ?? contractorProfile?.ownerName ?? "Contractor";
  } else {
    insertPayload.author_name = clientRecord?.name ?? "Client";
  }

  // Prefer storing author_id when the column exists; fall back gracefully otherwise.
  let insertError: any = null;
  {
    const { error } = await supabase
      .from("proposal_comments")
      .insert({ ...insertPayload, author_id: authorIdValue });
    insertError = error;
  }

  if (insertError && typeof insertError.message === "string" && insertError.message.includes("author_id")) {
    // Retry without author_id to support environments where the column hasn't been migrated yet.
    const { error } = await supabase.from("proposal_comments").insert(insertPayload);
    if (error) {
      insertError = error;
    } else {
      insertError = null;
    }
  }

  if (insertError) {
    if (typeof insertError.message === "string" && insertError.message.includes("proposal_id_fkey")) {
      c.status(404);
      return c.json({ error: "Proposal not found for comments. Please refresh and try again." });
    }
    c.status(500);
    return c.json({ error: insertError.message });
  }

  // Return updated list
  const { data, error } = await supabase
    .from("proposal_comments")
    .select("*")
    .eq("proposal_id", proposal.id)
    .order("created_at", { ascending: true });

  if (error) {
    c.status(500);
    return c.json({ error: error.message });
  }

  const comments = (data ?? []).map(mapCommentRow);

  // Fire-and-forget notifications
  const proposalUrl = buildProposalUrl(proposal.publicToken ?? null);
  const contractorEmail = contractorProfile?.email ?? null;
  const clientEmail = clientRecord?.email ?? null;
  const contractorName = contractorProfile?.businessName ?? contractorProfile?.ownerName ?? "Your contractor";
  const clientName = clientRecord?.name ?? "Your client";

  if (authorType === "client" && contractorEmail) {
    sendEstimateEmail({
      to: contractorEmail,
      subject: "New client comment on proposal",
      html: `
        <div style="font-family:Inter,Segoe UI,sans-serif;font-size:16px;color:#0f172a;">
          <p style="margin:0 0 12px;">${clientName} left a new comment on ${proposal.title ?? "your proposal"}.</p>
          <blockquote style="margin:0 0 12px;border-left:3px solid #e2e8f0;padding-left:12px;color:#0f172a;">${message}</blockquote>
          ${proposalUrl ? `<p style="margin:0;">View the thread: <a href="${proposalUrl}" style="color:#0F62FE;">${proposalUrl}</a></p>` : ""}
        </div>
      `,
      contractorName,
      contractorEmail,
    }).catch((err) => console.error("[comments] notify contractor failed", err));
  } else if (authorType === "contractor" && clientEmail) {
    sendEstimateEmail({
      to: clientEmail,
      subject: "Your contractor responded",
      html: `
        <div style="font-family:Inter,Segoe UI,sans-serif;font-size:16px;color:#0f172a;">
          <p style="margin:0 0 12px;">${contractorName} replied to your proposal questions.</p>
          <blockquote style="margin:0 0 12px;border-left:3px solid #e2e8f0;padding-left:12px;color:#0f172a;">${message}</blockquote>
          ${proposalUrl ? `<p style="margin:0;">Continue the thread: <a href="${proposalUrl}" style="color:#0F62FE;">${proposalUrl}</a></p>` : ""}
        </div>
      `,
      contractorName,
      contractorEmail: contractorProfile?.email ?? undefined,
    }).catch((err) => console.error("[comments] notify client failed", err));
  }

  return c.json({ data: comments });
});
