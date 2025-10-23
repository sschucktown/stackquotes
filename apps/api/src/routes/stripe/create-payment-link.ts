import { Hono } from "hono";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { initStripe } from "../../lib/stripe.js";
import { requireUser } from "../../lib/auth.js";
import { getServiceClient } from "../../lib/supabase.js";
import { getContractorProfile } from "@stackquotes/db";
import { getBaseAppUrl, readJsonBody } from "./utils.js";

const paymentLinkSchema = z.object({
  proposal_id: z.string().uuid(),
  contractor_id: z.string().uuid(),
  amount: z.coerce.number().positive("amount must be greater than zero"),
  currency: z.string().optional(),
  description: z.string().optional(),
});

export const registerCreatePaymentLinkRoute = (router: Hono) => {
  router.post("/create-payment-link", async (c) => {
    await requireUser(c);
    const body = await readJsonBody(c);
    const parsed = paymentLinkSchema.safeParse(body);
    if (!parsed.success) {
      c.status(400);
      return c.json({ error: parsed.error.flatten().fieldErrors });
    }

    const { proposal_id, contractor_id, amount, currency, description } = parsed.data;
    const supabase = getServiceClient();
    const contractor = await getContractorProfile(supabase, contractor_id);

    if (!contractor?.stripeAccountId) {
      // TODO: Replace this placeholder once PayLink module issues live payment URLs.
      return c.json({
        data: {
          url: `https://dashboard.stripe.com/test/pay/${randomUUID()}`,
          onboardingRequired: true,
        },
      });
    }

    const stripe = initStripe();
    const amountInCents = Math.round(amount * 100);
    const applicationFee = Math.max(Math.round(amountInCents * 0.03), 1);
    const baseUrl = getBaseAppUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_creation: "always",
      line_items: [
        {
          price_data: {
            currency: currency ?? "usd",
            product_data: {
              name: description ?? "Project Deposit",
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: applicationFee,
        transfer_data: {
          destination: contractor.stripeAccountId,
        },
        metadata: {
          contractorId: contractor_id,
          proposalId: proposal_id,
          type: "deposit",
          module: "paylink",
        },
      },
      metadata: {
        contractorId: contractor_id,
        proposalId: proposal_id,
        type: "deposit",
      },
      success_url: `${baseUrl}/proposal/${proposal_id}?payment=success`,
      cancel_url: `${baseUrl}/proposal/${proposal_id}?payment=cancelled`,
    });

    if (!session.url) {
      c.status(500);
      return c.json({ error: "Stripe did not return a hosted payment URL." });
    }

    return c.json({
      data: {
        url: session.url,
        id: session.id,
      },
    });
  });
};
