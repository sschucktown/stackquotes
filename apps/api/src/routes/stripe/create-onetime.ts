import { Hono } from "hono";
import { z } from "zod";
import { initStripe } from "../../lib/stripe.js";
import { requireUser } from "../../lib/auth.js";
import { getBaseAppUrl, readJsonBody } from "./utils.js";

const oneTimeSchema = z.object({
  amount: z.coerce.number().positive("amount must be greater than zero"),
  description: z.string().optional(),
  currency: z.string().optional(),
});

export const registerCreateOneTimeRoute = (router: Hono) => {
  router.post("/create-onetime", async (c) => {
    await requireUser(c);
    const body = await readJsonBody(c);
    const parsed = oneTimeSchema.safeParse(body);
    if (!parsed.success) {
      c.status(400);
      return c.json({ error: parsed.error.flatten().fieldErrors });
    }

    const { amount, description, currency } = parsed.data;
    const stripe = initStripe();
    const amountInCents = Math.round(amount * 100);
    const baseUrl = getBaseAppUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: currency ?? "usd",
            product_data: {
              name: description ?? "One-time purchase",
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/thankyou?product=addons`,
      cancel_url: `${baseUrl}/pricing`,
    });

    if (!session.url) {
      c.status(500);
      return c.json({ error: "Stripe did not return a hosted checkout URL." });
    }

    // TODO: Map one-time purchases to ProfitPulse catalog when module ships.
    return c.json({
      data: {
        url: session.url,
        id: session.id,
      },
    });
  });
};

