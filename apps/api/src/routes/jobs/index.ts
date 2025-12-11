import { Hono } from "hono";
import { z } from "zod";
import { getServiceClient } from "../../lib/supabase.js";
import { requireUser } from "../../lib/auth.js";

export const jobsRouter = new Hono();

/* -------------------------------
   Zod Schemas
-------------------------------- */
const createJobSchema = z.object({
  proposal_id: z.string().uuid(),

  approved_option: z.string().min(1),
  approved_price: z.number().nonnegative(),
  deposit_amount: z.number().nonnegative().nullable(),

  client_id: z.string().uuid(),
});

const scheduleSchema = z.object({
  start_date: z.string(), // ISO
  end_date: z.string().optional(),
});

/* -------------------------------
   POST /api/jobs
   Create job after signing
-------------------------------- */
jobsRouter.post("/", async (c) => {
  const user = await requireUser(c);
  const supabase = getServiceClient();

  const body = await c.req.json();
  const parsed = createJobSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Invalid job payload", details: parsed.error.format() },
      400
    );
  }

  const {
    proposal_id,
    approved_option,
    approved_price,
    deposit_amount,
    client_id,
  } = parsed.data;

  const { data, error } = await supabase
    .from("jobs")
    .insert({
      proposal_id,
      contractor_id: user.id,
      client_id,
      approved_option,
      approved_price,
      deposit_amount: deposit_amount ?? null,

      // Auto-stamp: proposal was just signed
      approved_at: new Date().toISOString(),
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("Job creation error:", error);
    return c.json({ error: "Failed to create job", details: error }, 500);
  }

  return c.json(data);
});

/* -------------------------------
   GET /api/jobs
   List jobs belonging to contractor
-------------------------------- */
jobsRouter.get("/", async (c) => {
  const user = await requireUser(c);
  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("contractor_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed fetching jobs:", error);
    return c.json({ error: "Failed to load jobs", details: error }, 500);
  }

  return c.json(data ?? []);
});

/* -------------------------------
   GET /api/jobs/:id
   Fetch single job
-------------------------------- */
jobsRouter.get("/:id", async (c) => {
  const user = await requireUser(c);
  const supabase = getServiceClient();

  const jobId = c.req.param("id");

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .eq("contractor_id", user.id)
    .single();

  if (error || !data) {
    return c.json({ error: "Job not found", details: error }, 404);
  }

  return c.json(data);
});

/* -------------------------------
   PATCH /api/jobs/:id/schedule
   Set start/end dates
-------------------------------- */
jobsRouter.patch("/:id/schedule", async (c) => {
  const user = await requireUser(c);
  const supabase = getServiceClient();

  const jobId = c.req.param("id");
  const body = await c.req.json();
  const parsed = scheduleSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: "Invalid schedule payload", details: parsed.error.format() },
      400
    );
  }

  const { start_date, end_date } = parsed.data;

  const { data, error } = await supabase
    .from("jobs")
    .update({
      scheduled_start: start_date,
      scheduled_end: end_date ?? null,
      scheduled_at: new Date().toISOString(),
      status: "scheduled",
    })
    .eq("id", jobId)
    .eq("contractor_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("Schedule update error:", error);
    return c.json({ error: "Failed to schedule job", details: error }, 500);
  }

  return c.json(data);
});
