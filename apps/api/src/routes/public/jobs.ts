import { Hono } from "hono";
import { getServiceClient } from "../../lib/supabase.js";

export const publicJobsRouter = new Hono();

/**
 * GET /api/public/jobs/:token
 * Client-safe, read-only job view
 */
publicJobsRouter.get("/:token", async (c) => {
  const supabase = getServiceClient();
  const token = c.req.param("token");

  if (!token) {
    return c.json({ error: "Missing token" }, 400);
  }

  const { data: job, error } = await supabase
    .from("jobs")
    .select(`
      id,
      status,
      approved_option,
      approved_price,
      scheduled_start,
      scheduled_end,
      scheduled_at,
      created_at
    `)
    .eq("job_public_token", token)
    .single();

  if (error || !job) {
    return c.json({ error: "Job not found" }, 404);
  }

  return c.json({
    job: {
      status: job.status,
      approved_option: job.approved_option,
      approved_price: job.approved_price,
      scheduled_start: job.scheduled_start,
      scheduled_end: job.scheduled_end,
      scheduled_at: job.scheduled_at,
      created_at: job.created_at,
    },
  });
});
