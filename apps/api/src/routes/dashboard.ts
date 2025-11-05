import { Hono } from "hono";
import { z } from "zod";
import { requireUser } from "../lib/auth.js";
import { getServiceClient } from "../lib/supabase.js";

export const dashboardRouter = new Hono();

const summaryQuery = z.object({
  // optional future filters
});

type Json = Record<string, unknown> | Json[] | string | number | boolean | null;

dashboardRouter.get("/", async (c) => {
  await requireUser(c); // validates auth; we re-fetch user for id below
  const user = await requireUser(c);
  // Validate query (kept for future use)
  summaryQuery.parse(c.req.query());

  const supabase = getServiceClient();

  // Fetch core datasets in parallel
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const since1d = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();

  const [estimatesRes, proposalsRes, paymentsRes] = await Promise.all([
    supabase
      .from("estimates")
      .select("id, project_title, status, converted_to_proposal, total, created_at, line_items")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("smart_proposals")
      .select(
        "id, title, status, deposit_amount, created_at, client_id, quickquote_id, payment_link_url, payment_link_id, sent_at, line_items, accepted_option"
      )
      .eq("contractor_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("payments")
      .select("id, proposal_id, amount, type, status, is_milestone, payment_status, created_at")
      .eq("contractor_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (estimatesRes.error) throw estimatesRes.error;
  if (proposalsRes.error) throw proposalsRes.error;
  if (paymentsRes.error) throw paymentsRes.error;

  const estimates = (estimatesRes.data as Array<Record<string, any>>) ?? [];
  const proposals = (proposalsRes.data as Array<Record<string, any>>) ?? [];
  const payments = (paymentsRes.data as Array<Record<string, any>>) ?? [];

  // Proposal views today (best-effort; proposal_events table may not exist)
  let viewedTodayEstimateIds: Set<string> = new Set();
  const latestViewByEstimate = new Map<string, string>();
  try {
    const opens = await supabase
      .from("proposal_events")
      .select("estimate_id, created_at")
      .eq("event", "proposal_view")
      .gte("created_at", since1d)
      .order("created_at", { ascending: false });
    if (!opens.error && opens.data) {
      for (const row of opens.data as Array<{ estimate_id: string | null; created_at: string }>) {
        if (row.estimate_id) {
          viewedTodayEstimateIds.add(row.estimate_id);
          if (!latestViewByEstimate.has(row.estimate_id)) {
            latestViewByEstimate.set(row.estimate_id, row.created_at);
          }
        }
      }
    }
  } catch {
    // ignore
  }

  // Build payment lookup
  const depositPaid = new Set<string>();
  const succeededDeposits = payments.filter(
    (p) => (p.type ?? "deposit").toString().toLowerCase() === "deposit" && (p.status ?? "").toString().toLowerCase() === "succeeded"
  );
  for (const p of succeededDeposits) {
    if (p.proposal_id) depositPaid.add(p.proposal_id);
  }

  // Actionables
  const depositPending = proposals.filter(
    (p) => (p.status ?? "").toLowerCase() === "accepted" && Number(p.deposit_amount ?? 0) > 0 && !depositPaid.has(p.id)
  );
  const depositPendingTotal = depositPending.reduce((sum, p) => sum + Number(p.deposit_amount ?? 0), 0);

  const viewedProposalsToday = proposals.filter((p) => p.quickquote_id && viewedTodayEstimateIds.has(p.quickquote_id));

  const readyToConvert = estimates.filter(
    (e) => (e.status ?? "").toLowerCase() === "accepted" && !Boolean(e.converted_to_proposal)
  );
  const readyToConvertTotal = readyToConvert.reduce((sum, e) => sum + Number(e.total ?? 0), 0);

  const actions = [
    depositPending.length
      ? {
          key: "deposit_pending",
          label: `${depositPending.length} deposits pending - worth ${depositPendingTotal}`,
          count: depositPending.length,
          amount: depositPendingTotal,
          cta: "Request Payment",
          route: "smart-proposals",
          weight: 5,
          tone: "red",
        }
      : null,
    viewedProposalsToday.length
      ? {
          key: "proposal_viewed",
          label: `${viewedProposalsToday.length} clients viewed your proposals today`,
          count: viewedProposalsToday.length,
          cta: "Follow Up",
          route: "quickquote-dashboard",
          weight: 4,
          tone: "blue",
        }
      : null,
    readyToConvert.length
      ? {
          key: "quote_ready",
          label: `${readyToConvert.length} QuickQuote ready to convert`,
          count: readyToConvert.length,
          amount: readyToConvertTotal,
          cta: "Generate Proposal",
          route: "smart-proposals",
          weight: 3,
          tone: "yellow",
        }
      : null,
  ].filter(Boolean) as Array<Record<string, unknown>>;

  actions.sort((a, b) => (Number(b.weight) || 0) - (Number(a.weight) || 0));

  // Helper to compute remaining final due for a proposal
  const computeFinalDue = (p: any): number => {
    try {
      const payload = p.line_items as any;
      const options = Array.isArray(payload?.options) ? payload.options : [];
      const accepted = (p.accepted_option ?? "").toString();
      const lower = accepted.toLowerCase();
      const preferred =
        options.find((o: any) => (o?.name ?? "").toString().toLowerCase() === lower) ||
        options.find((o: any) => (o?.name ?? "").toString().toLowerCase() === "better") ||
        options[0] || null;
      const subtotal = Number(preferred?.subtotal ?? 0);
      const deposit = Number(p.deposit_amount ?? 0);
      const remaining = Math.max(subtotal - deposit, 0);
      return Number.isFinite(remaining) ? remaining : 0;
    } catch {
      return 0;
    }
  };

  // Carousels
  const paymentsCarousel = {
    deposit_pending: depositPending.map((p) => ({ id: p.id, title: p.title, amount: Number(p.deposit_amount ?? 0), cta: "Request Deposit", route: "smart-proposals" })),
    deposit_received: proposals
      .filter((p) => (p.status ?? "").toLowerCase() === "accepted" && depositPaid.has(p.id))
      .map((p) => ({ id: p.id, title: p.title, amount: Number(p.deposit_amount ?? 0), cta: "View Receipt", route: "payments" })),
    final_due: proposals
      .filter((p) => (p.status ?? "").toLowerCase() === "accepted" && depositPaid.has(p.id))
      .map((p) => ({ id: p.id, title: p.title, amount: computeFinalDue(p), cta: "Send PayLink", route: "payments" }))
      .filter((entry) => (entry.amount ?? 0) > 0),
    paid: proposals
      .filter((p) => (p.status ?? "").toLowerCase() === "paid")
      .map((p) => ({ id: p.id, title: p.title, cta: "View", route: "payments" })),
  };

  const smartProposalsCarousel = {
    unsent: proposals.filter((p) => (p.status ?? "").toLowerCase() === "draft").map((p) => ({ id: p.id, title: p.title, cta: "Send", route: "smart-proposals" })),
    sent: proposals.filter((p) => (p.status ?? "").toLowerCase() === "sent").map((p) => ({ id: p.id, title: p.title, cta: "View", route: "smart-proposals" })),
    viewed: proposals
      .filter((p) => (p.status ?? "").toLowerCase() === "sent" && p.quickquote_id && viewedTodayEstimateIds.has(p.quickquote_id))
      .map((p) => ({ id: p.id, title: p.title, viewed_at: latestViewByEstimate.get(p.quickquote_id as string) ?? null, cta: "Follow Up", route: "smart-proposals" })),
    accepted: proposals.filter((p) => (p.status ?? "").toLowerCase() === "accepted").map((p) => ({ id: p.id, title: p.title, cta: "Collect Deposit", route: "smart-proposals" })),
    declined_expired: proposals
      .filter((p) => (p.status ?? "").toLowerCase() === "declined" || (p.status ?? "").toLowerCase() === "expired")
      .map((p) => ({ id: p.id, title: p.title, cta: "Archive", route: "smart-proposals" })),
  };

  const quickQuotesCarousel = {
    draft: estimates.filter((e) => (e.status ?? "").toLowerCase() === "draft").map((e) => ({ id: e.id, title: e.project_title, cta: "Finish Quote", route: "quickquote-dashboard" })),
    ready_to_convert: readyToConvert.map((e) => ({ id: e.id, title: e.project_title, cta: "Generate Proposal", route: "smart-proposals" })),
    converted: estimates
      .filter((e) => Boolean(e.converted_to_proposal))
      .map((e) => ({ id: e.id, title: e.project_title, cta: "View Proposal", route: "smart-proposals" })),
  };

  // Snapshot: latest 5 payments + gross profit margin (no forecasting, no filtering)
  const proposalTitleById = new Map<string, string | null>();
  for (const p of proposals) {
    proposalTitleById.set(p.id as string, (p.title as string | null) ?? null);
  }
  const latestPayments = payments.slice(0, 5).map((p) => ({
    id: p.id as string,
    amount: Number(p.amount ?? 0),
    type: (p.type ?? 'deposit').toString(),
    status: (p.status ?? '').toString(),
    created_at: p.created_at as string,
    proposal_title: p.proposal_id ? proposalTitleById.get(p.proposal_id as string) ?? null : null,
  }));

  const acceptedEstimates = estimates.filter((e) => (e.status ?? '').toLowerCase() === 'accepted');
  const computeCosts = (row: any): number => {
    try {
      const items = Array.isArray(row.line_items) ? row.line_items : [];
      let cost = 0;
      for (const it of items) {
        const qty = Number(it.quantity ?? 0);
        const unitCost = Number(it.cost ?? 0);
        cost += qty * unitCost;
      }
      return cost;
    } catch {
      return 0;
    }
  };
  const totalRevenue = acceptedEstimates.reduce((s, e) => s + Number(e.total ?? 0), 0);
  const totalCost = acceptedEstimates.reduce((s, e) => s + computeCosts(e), 0);
  const grossMargin = totalRevenue > 0 ? Math.round(((totalRevenue - totalCost) / totalRevenue) * 100) : 0;

  const snapshot = {
    latest_payments: latestPayments,
    gross_margin: grossMargin,
    total_revenue: Math.round(totalRevenue * 100) / 100,
    total_cost: Math.round(totalCost * 100) / 100,
  };

  // Summary metrics (for Command Center KPIs)
  const openProposalsCount = (
    (smartProposalsCarousel.unsent?.length ?? 0) +
    (smartProposalsCarousel.sent?.length ?? 0) +
    (smartProposalsCarousel.viewed?.length ?? 0)
  );
  const pendingDepositsCount = depositPending.length;

  // Close rate: accepted / (accepted + declined/expired)
  const acceptedCount = (smartProposalsCarousel.accepted?.length ?? 0);
  const declinedExpiredCount = (smartProposalsCarousel.declined_expired?.length ?? 0);
  const denom = acceptedCount + declinedExpiredCount;
  let closeRate = denom === 0 ? 0 : acceptedCount / denom;

  // Prefer Supabase function if available (best-effort)
  try {
    const rpc = await supabase.rpc('fn_close_rate', { contractor_id: user.id });
    if (!rpc.error && typeof rpc.data === 'number' && isFinite(rpc.data)) {
      closeRate = Math.max(0, Math.min(1, rpc.data));
    }
  } catch {
    // ignore
  }

  // Gross payments this month (succeeded/paid)
  const now = new Date();
  const month = now.getUTCMonth();
  const year = now.getUTCFullYear();
  const grossPaymentsMonth = payments
    .filter((p) => {
      const s = (p.status ?? '').toString().toLowerCase();
      if (!(s === 'succeeded' || s === 'paid')) return false;
      const d = new Date(p.created_at as string);
      return d.getUTCFullYear() === year && d.getUTCMonth() === month;
    })
    .reduce((sum, p) => sum + Number(p.amount ?? 0), 0);

  // Overdue milestones: milestones not paid beyond grace period
  const OVERDUE_DAYS = 14;
  const cutoff = new Date(Date.now() - OVERDUE_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const overdueMilestones = payments.filter((p) => {
    const isMilestone = Boolean((p as any).is_milestone);
    if (!isMilestone) return false;
    const status = ((p as any).status ?? '').toString().toLowerCase();
    const paid = status === 'succeeded' || status === 'paid';
    if (paid) return false;
    const createdAt = new Date((p as any).created_at ?? 0).toISOString();
    return createdAt < cutoff;
  }).length;

  return c.json({
    data: {
      actions,
      carousels: {
        payments: paymentsCarousel,
        smartProposals: smartProposalsCarousel,
        quickQuotes: quickQuotesCarousel,
      },
      snapshot,
      summary: {
        open_proposals: openProposalsCount,
        pending_deposits: pendingDepositsCount,
        close_rate: closeRate,
        gross_payments_month: Math.round(grossPaymentsMonth * 100) / 100,
        overdue_milestones: overdueMilestones,
      },
      generated_at: new Date().toISOString(),
    },
  });
});

