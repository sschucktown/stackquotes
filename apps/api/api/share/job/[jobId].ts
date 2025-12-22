import { Hono } from "hono";
import { getServiceClient } from "../../../lib/supabase";

const router = new Hono();

/**
 * GET /api/share/job/:jobId
 */
router.get("/", async (c) => {
  const supabase = getServiceClient();
  const jobId = c.req.param("jobId");

  if (!jobId) {
    return c.json({ error: "Missing jobId" }, 400);
  }

  const { data: job, error } = await supabase
    .from("jobs")
    .select(
      `
      id,
      approved_option,
      approved_price,
      deposit_amount,
      payment_link_url
    `
    )
    .eq("id", jobId)
    .single();

  if (error || !job) {
    return c.json({ error: "Job not found" }, 404);
  }

  return c.json({ job });
});

export default router;
