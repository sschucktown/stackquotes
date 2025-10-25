import { Hono } from "hono";
import { z } from "zod";
import { getServiceClient } from "../../lib/supabase.js";

const telemetrySchema = z.object({
  contractor_id: z.string().uuid().optional(),
  proposal_id: z.string().uuid().optional(),
  kind: z
    .enum(["offer", "loan_funded", "application_started", "application_completed", "interest"])
    .default("interest"),
  amount_cents: z.number().int().nonnegative().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const wisetackRouter = new Hono();

wisetackRouter.post("/telemetry", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    body = {};
  }
  const parsed = telemetrySchema.safeParse(body);
  if (!parsed.success) {
    c.status(400);
    return c.json({ error: parsed.error.flatten().fieldErrors });
  }

  const supabase = getServiceClient();
  const payload = parsed.data;
  const { error } = await supabase.from("financing_events").insert({
    user_id: payload.contractor_id ?? null,
    provider: "wisetack",
    kind: payload.kind,
    amount_cents: payload.amount_cents ?? null,
    metadata: {
      ...(payload.metadata ?? {}),
      proposal_id: payload.proposal_id ?? null,
    },
  });

  if (error) {
    console.error("[wisetack] failed to record telemetry", error);
    c.status(500);
    return c.json({ error: "Failed to record financing telemetry." });
  }

  return c.json({ data: { recorded: true } });
});

