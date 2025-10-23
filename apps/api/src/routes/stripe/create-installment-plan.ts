import { Hono } from "hono";
import { z } from "zod";
import { requireUser } from "../../lib/auth.js";
import { readJsonBody } from "./utils.js";

const installmentSchema = z.object({
  proposal_id: z.string().uuid(),
  contractor_id: z.string().uuid(),
  milestones: z
    .array(
      z.object({
        name: z.string(),
        amount: z.coerce.number().positive("milestone amount must be positive"),
        due_date: z.string().optional(),
      })
    )
    .min(1, "at least one milestone is required"),
});

export const registerCreateInstallmentPlanRoute = (router: Hono) => {
  router.post("/create-installment-plan", async (c) => {
    await requireUser(c);
    const body = await readJsonBody(c);
    const parsed = installmentSchema.safeParse(body);
    if (!parsed.success) {
      c.status(400);
      return c.json({ error: parsed.error.flatten().fieldErrors });
    }

    // TODO: Replace stub with ScopeForge milestone scheduling (multiple PaymentIntents or invoices).
    return c.json({
      data: {
        status: "scheduled",
        proposalId: parsed.data.proposal_id,
        contractorId: parsed.data.contractor_id,
        milestones: parsed.data.milestones,
        message:
          "Installment plan scheduling placeholder. ScopeForge module will create staged payment intents here.",
      },
    });
  });
};

